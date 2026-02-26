import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../mocks/prisma';
import { validateResponse } from '../utils/openApiValidator';

vi.mock('../../lib/prisma', async () => {
  const { prismaMock } = await import('../mocks/prisma');
  return { prisma: prismaMock };
});

// テスト環境ではレート制限をバイパスする
vi.mock('express-rate-limit', () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  rateLimit: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

// メール送信はテスト環境では実行しない
vi.mock('../../utils/email', () => ({
  sendContactNotification: vi.fn().mockResolvedValue(undefined),
  sendContactConfirmation: vi.fn().mockResolvedValue(undefined),
}));

const VALID_CONTACT = {
  name: '山田太郎',
  email: 'taro@example.com',
  subject: 'コンサートについて',
  message: 'お問い合わせ内容です。',
};

const FAKE_CONTACT_RECORD = {
  id: '00000000-0000-4000-8000-000000000006',
  ...VALID_CONTACT,
  phone: null,
  category: null,
  status: 'unread' as const,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /contact', () => {
  it('正常なリクエスト → 201 { ok: true } で openapi スキーマに一致する', async () => {
    prismaMock.contact.create.mockResolvedValue(FAKE_CONTACT_RECORD);

    const res = await request(app).post('/contact').send(VALID_CONTACT);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
    validateResponse('postContact', 201, res.body);
  });

  it('name が空 → 400', async () => {
    const res = await request(app).post('/contact').send({
      ...VALID_CONTACT,
      name: '',
    });
    expect(res.status).toBe(400);
  });

  it('email が空 → 400', async () => {
    const res = await request(app).post('/contact').send({
      ...VALID_CONTACT,
      email: '',
    });
    expect(res.status).toBe(400);
  });

  it('subject が空 → 400', async () => {
    const res = await request(app).post('/contact').send({
      ...VALID_CONTACT,
      subject: '',
    });
    expect(res.status).toBe(400);
  });

  it('message が空 → 400', async () => {
    const res = await request(app).post('/contact').send({
      ...VALID_CONTACT,
      message: '',
    });
    expect(res.status).toBe(400);
  });

  it('email の形式が不正 → 400', async () => {
    const res = await request(app).post('/contact').send({
      ...VALID_CONTACT,
      email: 'not-an-email',
    });
    expect(res.status).toBe(400);
  });

  it('phone と category はオプションで省略可能', async () => {
    prismaMock.contact.create.mockResolvedValue(FAKE_CONTACT_RECORD);

    const res = await request(app).post('/contact').send(VALID_CONTACT);

    expect(res.status).toBe(201);
    expect(prismaMock.contact.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          phone: null,
          category: null,
        }),
      })
    );
  });

  it('phone と category を含む完全なリクエストも受け付ける', async () => {
    prismaMock.contact.create.mockResolvedValue({
      ...FAKE_CONTACT_RECORD,
      phone: '090-1234-5678',
      category: 'concert',
    });

    const res = await request(app).post('/contact').send({
      ...VALID_CONTACT,
      phone: '090-1234-5678',
      category: 'concert',
    });

    expect(res.status).toBe(201);
  });
});
