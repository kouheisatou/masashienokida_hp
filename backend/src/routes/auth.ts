import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthPayload } from '../middleware/auth';
import { sendWelcomeEmail } from '../utils/email';

const router = Router();

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
            `${process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001'}/auth/callback?error=auth_failed`,
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
      const adminConsoleUrl = process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001';
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

      const token = jwt.sign(
        { userId: user.userId, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );
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
      const token = jwt.sign(
        { userId: user.userId, email: user.email, role: roleForToken },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      );
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
  }
);

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

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

router.post('/signout', requireAuth, (_req, res) => {
  res.json({ ok: true });
});

router.delete('/account', requireAuth, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.userId } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
