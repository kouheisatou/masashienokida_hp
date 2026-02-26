import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { sendContactNotification, sendContactConfirmation } from '../utils/email';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: '送信回数の上限に達しました。しばらくしてから再度お試しください。' },
});

router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, category, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: '必須項目を入力してください' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'メールアドレスの形式が正しくありません' });
      return;
    }

    await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        category: category ?? null,
        subject,
        message,
      },
    });

    sendContactNotification({ name, email, phone, category, subject, message }).catch(
      (err) => console.error('Failed to send admin notification:', err)
    );
    sendContactConfirmation(email, name, subject).catch(
      (err) => console.error('Failed to send confirmation:', err)
    );

    res.status(201).json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
