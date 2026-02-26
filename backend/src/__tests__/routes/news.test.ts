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

const FAKE_NEWS = {
  id: '00000000-0000-4000-8000-000000000002',
  title: 'テストニュース',
  body: 'テスト本文',
  imageUrl: null,
  category: null,
  publishedAt: new Date('2024-06-01T00:00:00Z'),
  isPublished: true,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /news', () => {
  it('公開ニュース一覧を返し openapi スキーマに一致する', async () => {
    prismaMock.news.findMany.mockResolvedValue([FAKE_NEWS]);

    const res = await request(app).get('/news');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe(FAKE_NEWS.title);
    expect(res.body[0].image_url).toBeNull();
    validateResponse('getNews', 200, res.body);
  });

  it('limit/offset クエリが反映される', async () => {
    prismaMock.news.findMany.mockResolvedValue([]);

    await request(app).get('/news?limit=5&offset=10');

    expect(prismaMock.news.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5, skip: 10 })
    );
  });
});

describe('GET /news/:id', () => {
  it('存在するニュースを返す', async () => {
    prismaMock.news.findFirst.mockResolvedValue(FAKE_NEWS);

    const res = await request(app).get(`/news/${FAKE_NEWS.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(FAKE_NEWS.id);
    validateResponse('getNewsById', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.news.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/news/non-existent-id');

    expect(res.status).toBe(404);
  });
});

describe('POST /news', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).post('/news').send({ title: 'x', body: 'y' });
    expect(res.status).toBe(401);
  });

  it('USER ロール → 403', async () => {
    const res = await request(app)
      .post('/news')
      .set(authHeader('USER'))
      .send({ title: 'x', body: 'y' });
    expect(res.status).toBe(403);
  });

  it('ADMIN → 201 でニュース作成し openapi スキーマに一致する', async () => {
    prismaMock.news.create.mockResolvedValue(FAKE_NEWS);

    const res = await request(app)
      .post('/news')
      .set(authHeader('ADMIN'))
      .send({ title: 'テストニュース', body: 'テスト本文' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(FAKE_NEWS.title);
    validateResponse('createNews', 201, res.body);
  });
});

describe('PUT /news/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).put(`/news/${FAKE_NEWS.id}`).send({ title: 'x' });
    expect(res.status).toBe(401);
  });

  it('ADMIN → ニュースを更新して返す', async () => {
    const updated = { ...FAKE_NEWS, title: '更新後タイトル' };
    prismaMock.news.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/news/${FAKE_NEWS.id}`)
      .set(authHeader('ADMIN'))
      .send({ title: '更新後タイトル', body: 'テスト本文' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('更新後タイトル');
    validateResponse('updateNews', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.news.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/news/non-existent-id')
      .set(authHeader('ADMIN'))
      .send({ title: 'x', body: 'y' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /news/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).delete(`/news/${FAKE_NEWS.id}`);
    expect(res.status).toBe(401);
  });

  it('ADMIN → { ok: true }', async () => {
    prismaMock.news.delete.mockResolvedValue(FAKE_NEWS);

    const res = await request(app)
      .delete(`/news/${FAKE_NEWS.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteNews', 200, res.body);
  });
});
