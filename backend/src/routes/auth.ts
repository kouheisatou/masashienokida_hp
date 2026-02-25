import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: (err: unknown, user?: DbUser) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'));

        const image = profile.photos?.[0]?.value ?? null;
        const name = profile.displayName ?? email;

        // Upsert user
        const rows = await query<DbUser>(
          `INSERT INTO users (email, name, image, google_id)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (google_id) DO UPDATE
             SET name = EXCLUDED.name,
                 image = EXCLUDED.image,
                 updated_at = NOW()
           RETURNING id, email, name, image, role`,
          [email, name, image, profile.id]
        );

        const user = rows[0];

        // Ensure subscription row exists
        await query(
          `INSERT INTO subscriptions (user_id)
           VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id]
        );

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// Redirect to Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })
);

// OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/?auth=error` }),
  (req, res) => {
    const user = req.user as DbUser;
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await queryOne<DbUser>(
      'SELECT id, email, name, image, role FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sub = await queryOne<{
      tier: string;
      status: string;
      current_period_end: string | null;
      cancel_at_period_end: boolean;
    }>(
      'SELECT tier, status, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id = $1',
      [user.id]
    );

    res.json({
      user,
      subscription: sub
        ? {
            hasSubscription: sub.tier === 'MEMBER_GOLD',
            tier: sub.tier,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          }
        : { hasSubscription: false, tier: 'USER' },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out (client drops JWT, but we record it if needed)
router.post('/signout', requireAuth, (_req, res) => {
  res.json({ ok: true });
});

// Delete account
router.delete('/account', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.user!.userId]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
