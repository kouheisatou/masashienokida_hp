import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import { optionalAuth } from './middleware/auth';
import authRouter from './routes/auth';
import newsRouter from './routes/news';
import concertsRouter from './routes/concerts';
import discographyRouter from './routes/discography';
import biographyRouter from './routes/biography';
import blogRouter from './routes/blog';
import membersRouter from './routes/members';
import contactRouter from './routes/contact';
import stripeRouter from './routes/stripe';
import adminRouter from './routes/admin';

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL ?? 'http://localhost:3000',
  process.env.ADMIN_CONSOLE_URL ?? 'http://localhost:3001',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Stripe webhook requires raw body — mount before json parser
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(passport.initialize());
app.use(optionalAuth);

app.use('/auth', authRouter);
app.use('/news', newsRouter);
app.use('/concerts', concertsRouter);
app.use('/discography', discographyRouter);
app.use('/biography', biographyRouter);
app.use('/blog', blogRouter);
app.use('/members', membersRouter);
app.use('/contact', contactRouter);
app.use('/stripe', stripeRouter);
app.use('/admin', adminRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

export default app;
