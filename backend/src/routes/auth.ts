import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthPayload } from '../middleware/auth';
import { sendWelcomeEmail } from '../utils/email';

const router = Router();

// JWT 失効リスクヘッジのための jti を含めて発行する
function signJwt(payload: { userId: string; email: string; role: string }): string {
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

// 30 日後の失効期限 (Token expiry と一致)
function jwtExpiryDate(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

async function revokeToken(jti: string | undefined): Promise<void> {
  if (!jti) return;
  try {
    await prisma.revokedToken.create({
      data: { jti, expiresAt: jwtExpiryDate() },
    });
  } catch (err) {
    // unique 違反 (= 既に revoke 済) は無視
    console.error('Failed to revoke token (may be already revoked):', err);
  }
}

// ── Stripe sync cache (M-06) ─────────────────────────────────────
//
// /auth/me で必要に応じて Stripe からサブスクリプション状態を再同期する
// 60 秒以内に同じ user で再呼び出しされた場合は cache を信用してスキップ
const stripeSyncCache = new Map<string, number>();
const STRIPE_SYNC_TTL_MS = 60_000;

const STRIPE_STATUS_MAP: Record<string, 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING'> = {
  active: 'ACTIVE',
  trialing: 'TRIALING',
  canceled: 'CANCELED',
  past_due: 'PAST_DUE',
};

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  }
  return _stripe;
}

async function syncSubscriptionFromStripe(userId: string, stripeSubscriptionId: string): Promise<void> {
  try {
    const sub = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
    const active = sub.status === 'active' || sub.status === 'trialing';
    const tier = active ? 'MEMBER_GOLD' : 'MEMBER_FREE';
    const status = STRIPE_STATUS_MAP[sub.status] ?? 'ACTIVE';

    await prisma.subscription.update({
      where: { userId },
      data: {
        tier,
        status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { role: active ? 'MEMBER_GOLD' : 'MEMBER_FREE' },
    });
  } catch (err) {
    console.error('Stripe sync failed for user', userId, err);
  }
}

async function upsertGoogleUser(profile: Profile): Promise<AuthPayload & { id: string }> {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new Error('No email from Google');

  const image = profile.photos?.[0]?.value ?? null;
  const name = profile.displayName ?? email;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email }] },
  });

  let dbUser;
  let isNewUser = false;
  if (existing) {
    dbUser = await prisma.user.update({
      where: { id: existing.id },
      data: { name, image, googleId: profile.id },
    });
  } else {
    dbUser = await prisma.user.create({
      data: { email, name, image, googleId: profile.id },
    });
    isNewUser = true;
  }

  await prisma.subscription.upsert({
    where: { userId: dbUser.id },
    create: { userId: dbUser.id },
    update: {},
  });

  if (isNewUser) {
    sendWelcomeEmail(dbUser.email, dbUser.name ?? dbUser.email).catch(
      (err) => console.error('Failed to send welcome email:', err),
    );
  }

  return { id: dbUser.id, userId: dbUser.id, email: dbUser.email, role: dbUser.role };
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        done(null, await upsertGoogleUser(profile));
      } catch (err) {
        done(err);
      }
    }
  )
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })
);

router.get(
  '/admin/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
    state: 'admin',
  } as object)
);

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err: unknown, user: (AuthPayload & { id: string }) | false) => {
      const isAdmin = req.query.state === 'admin';
      if (err || !user) {
        if (isAdmin) {
          return res.redirect(
            `${process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001/admin'}/auth/callback?error=auth_failed`,
          );
        }
        return res.redirect(`${process.env.FRONTEND_URL}/?auth=error`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    const user = req.user! as AuthPayload & { id: string };
    const isAdmin = req.query.state === 'admin';

    if (isAdmin) {
      const adminConsoleUrl = process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001/admin';
      const allowedEmails = getAdminEmails();

      if (allowedEmails.length === 0 || !allowedEmails.includes(user.email.toLowerCase())) {
        // ADMIN_EMAILS から外れたユーザーは DB の role を即時ダウングレード
        if (user.role === 'ADMIN') {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'USER' },
          });
        }
        res.redirect(`${adminConsoleUrl}/auth/callback?error=forbidden`);
        return;
      }

      if (user.role !== 'ADMIN') {
        if (allowedEmails.includes(user.email.toLowerCase())) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
          });
          user.role = 'ADMIN';
        } else {
          res.redirect(`${adminConsoleUrl}/auth/callback?error=forbidden`);
          return;
        }
      }

      const token = signJwt({ userId: user.userId, email: user.email, role: user.role });
      res.redirect(`${adminConsoleUrl}/auth/callback?token=${token}`);
    } else {
      // メインサイトフロー: ADMIN ロールでも ADMIN_EMAILS に含まれていなければ
      // トークン発行時に role を USER に下げる（管理コンソール迂回を防ぐ）
      let roleForToken = user.role;
      if (user.role === 'ADMIN') {
        const allowedEmails = getAdminEmails();
        if (allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'USER' },
          });
          roleForToken = 'USER';
        }
      }
      const token = signJwt({ userId: user.userId, email: user.email, role: roleForToken });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  }
);

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // M-06: Stripe API は 60 秒に 1 度だけ再同期する
    if (sub?.stripeSubscriptionId) {
      const lastSyncedAt = stripeSyncCache.get(userId) ?? 0;
      const now = Date.now();
      if (now - lastSyncedAt > STRIPE_SYNC_TTL_MS) {
        stripeSyncCache.set(userId, now);
        await syncSubscriptionFromStripe(userId, sub.stripeSubscriptionId);
        // 同期後に DB を読み直す
        sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
      }
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role },
      subscription: sub
        ? {
            hasSubscription: sub.tier === 'MEMBER_GOLD',
            tier: sub.tier,
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          }
        : { hasSubscription: false, tier: 'USER' },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/signout', requireAuth, async (req, res) => {
  // 現在のトークンの jti を失効リストに追加
  await revokeToken(req.user!.jti);
  res.json({ ok: true });
});

router.delete('/account', requireAuth, async (req, res) => {
  // M-07: 確認 token (`DELETE_MY_ACCOUNT`) が無いと 400
  const confirmation = (req.body as { confirmation?: unknown } | undefined)?.confirmation;
  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    res.status(400).json({ error: 'confirmation required' });
    return;
  }

  try {
    await prisma.user.delete({ where: { id: req.user!.userId } });
    // 削除と同時に現在のトークンも失効
    await revokeToken(req.user!.jti);
    // ログイン中の cache をクリア
    stripeSyncCache.delete(req.user!.userId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
