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

passport.use(
  'google-admin',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.ADMIN_CONSOLE_GOOGLE_CALLBACK_URL!,
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
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/?auth=error`,
  }),
  (req, res) => {
    const user = req.user!;
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

router.get(
  '/admin/google',
  passport.authenticate('google-admin', { scope: ['email', 'profile'], session: false })
);

router.get(
  '/admin/google/callback',
  passport.authenticate('google-admin', {
    session: false,
    failureRedirect: `${process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001'}/auth/callback?error=auth_failed`,
  }),
  (req, res) => {
    const user = req.user!;
    if (user.role !== 'ADMIN') {
      res.redirect(
        `${process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001'}/auth/callback?error=forbidden`
      );
      return;
    }
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    res.redirect(
      `${process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001'}/auth/callback?token=${token}`
    );
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
