import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { prismaMock } from '../mocks/prisma';
import { validateResponse } from '../utils/openApiValidator';
import { authHeader } from '../utils/testAuth';

vi.mock('../../lib/prisma', async () => {
  const { prismaMock } = await import('../mocks/prisma');
  return { prisma: prismaMock };
});

const FAKE_CONCERT = {
  id: '00000000-0000-4000-8000-000000000003',
  title: 'テストコンサート',
  date: new Date('2024-09-01'),
  time: '14:00',
  venue: 'サントリーホール',
  address: '東京都港区赤坂1-13-1',
  imageUrl: null,
  program: ['ショパン: バラード第1番', 'ドビュッシー: 月の光'],
  price: '¥3,000',
  ticketUrl: null,
  note: null,
  isUpcoming: true,
  isPublished: true,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /concerts', () => {
  it('公開コンサート一覧を返し openapi スキーマに一致する', async () => {
    prismaMock.concert.findMany.mockResolvedValue([FAKE_CONCERT]);

    const res = await request(app).get('/concerts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe(FAKE_CONCERT.title);
    expect(res.body[0].venue).toBe(FAKE_CONCERT.venue);
    validateResponse('getConcerts', 200, res.body);
  });

  it('?upcoming=true でフィルタリングされる', async () => {
    prismaMock.concert.findMany.mockResolvedValue([FAKE_CONCERT]);

    await request(app).get('/concerts?upcoming=true');

    expect(prismaMock.concert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isUpcoming: true }),
      })
    );
  });

  it('?upcoming=false でフィルタリングされる', async () => {
    prismaMock.concert.findMany.mockResolvedValue([]);

    await request(app).get('/concerts?upcoming=false');

    expect(prismaMock.concert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isUpcoming: false }),
      })
    );
  });
});

describe('GET /concerts/:id', () => {
  it('存在するコンサートを返す', async () => {
    prismaMock.concert.findFirst.mockResolvedValue(FAKE_CONCERT);

    const res = await request(app).get(`/concerts/${FAKE_CONCERT.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(FAKE_CONCERT.id);
    validateResponse('getConcertById', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.concert.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/concerts/non-existent-id');

    expect(res.status).toBe(404);
  });
});

describe('POST /concerts', () => {
  it('未認証 → 401', async () => {
    const res = await request(app)
      .post('/concerts')
      .send({ title: 'x', date: '2024-09-01', venue: 'y' });
    expect(res.status).toBe(401);
  });

  it('USER ロール → 403', async () => {
    const res = await request(app)
      .post('/concerts')
      .set(authHeader('USER'))
      .send({ title: 'x', date: '2024-09-01', venue: 'y' });
    expect(res.status).toBe(403);
  });

  it('ADMIN → 201 でコンサート作成し openapi スキーマに一致する', async () => {
    prismaMock.concert.create.mockResolvedValue(FAKE_CONCERT);

    const res = await request(app)
      .post('/concerts')
      .set(authHeader('ADMIN'))
      .send({ title: 'テストコンサート', date: '2024-09-01T00:00:00Z', venue: 'サントリーホール' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(FAKE_CONCERT.title);
    validateResponse('createConcert', 201, res.body);
  });
});

describe('PUT /concerts/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).put(`/concerts/${FAKE_CONCERT.id}`).send({ title: 'x' });
    expect(res.status).toBe(401);
  });

  it('ADMIN → コンサートを更新して返す', async () => {
    const updated = { ...FAKE_CONCERT, title: '更新後コンサート' };
    prismaMock.concert.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/concerts/${FAKE_CONCERT.id}`)
      .set(authHeader('ADMIN'))
      .send({ title: '更新後コンサート', date: '2024-09-01T00:00:00Z', venue: 'サントリーホール' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('更新後コンサート');
    validateResponse('updateConcert', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.concert.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/concerts/non-existent-id')
      .set(authHeader('ADMIN'))
      .send({ title: 'x', date: '2024-09-01T00:00:00Z', venue: 'y' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /concerts/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).delete(`/concerts/${FAKE_CONCERT.id}`);
    expect(res.status).toBe(401);
  });

  it('ADMIN → { ok: true }', async () => {
    prismaMock.concert.delete.mockResolvedValue(FAKE_CONCERT);

    const res = await request(app)
      .delete(`/concerts/${FAKE_CONCERT.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteConcert', 200, res.body);
  });
});
