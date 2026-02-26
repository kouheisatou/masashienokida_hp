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

const FAKE_DISC = {
  id: '00000000-0000-4000-8000-000000000004',
  title: 'テストアルバム',
  releaseYear: 2023,
  description: 'テスト説明',
  imageUrl: null,
  sortOrder: 0,
  isPublished: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /discography', () => {
  it('公開ディスコグラフィー一覧を返し openapi スキーマに一致する', async () => {
    prismaMock.discography.findMany.mockResolvedValue([FAKE_DISC]);

    const res = await request(app).get('/discography');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe(FAKE_DISC.title);
    expect(res.body[0].release_year).toBe(FAKE_DISC.releaseYear);
    validateResponse('getDiscography', 200, res.body);
  });
});

describe('GET /discography/:id', () => {
  it('存在するアイテムを返す', async () => {
    prismaMock.discography.findFirst.mockResolvedValue(FAKE_DISC);

    const res = await request(app).get(`/discography/${FAKE_DISC.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(FAKE_DISC.id);
    validateResponse('getDiscographyById', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.discography.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/discography/non-existent-id');

    expect(res.status).toBe(404);
  });
});

describe('POST /discography', () => {
  it('未認証 → 401', async () => {
    const res = await request(app)
      .post('/discography')
      .send({ title: 'x', release_year: 2023 });
    expect(res.status).toBe(401);
  });

  it('USER ロール → 403', async () => {
    const res = await request(app)
      .post('/discography')
      .set(authHeader('USER'))
      .send({ title: 'x', release_year: 2023 });
    expect(res.status).toBe(403);
  });

  it('ADMIN → 201 でアイテムを作成し openapi スキーマに一致する', async () => {
    prismaMock.discography.create.mockResolvedValue(FAKE_DISC);

    const res = await request(app)
      .post('/discography')
      .set(authHeader('ADMIN'))
      .send({ title: 'テストアルバム', release_year: 2023 });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(FAKE_DISC.title);
    validateResponse('createDiscography', 201, res.body);
  });
});

describe('PUT /discography/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app)
      .put(`/discography/${FAKE_DISC.id}`)
      .send({ title: 'x', release_year: 2023 });
    expect(res.status).toBe(401);
  });

  it('ADMIN → アイテムを更新して返す', async () => {
    const updated = { ...FAKE_DISC, title: '更新後アルバム' };
    prismaMock.discography.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/discography/${FAKE_DISC.id}`)
      .set(authHeader('ADMIN'))
      .send({ title: '更新後アルバム', release_year: 2023 });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('更新後アルバム');
    validateResponse('updateDiscography', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.discography.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/discography/non-existent-id')
      .set(authHeader('ADMIN'))
      .send({ title: 'x', release_year: 2023 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /discography/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).delete(`/discography/${FAKE_DISC.id}`);
    expect(res.status).toBe(401);
  });

  it('ADMIN → { ok: true }', async () => {
    prismaMock.discography.delete.mockResolvedValue(FAKE_DISC);

    const res = await request(app)
      .delete(`/discography/${FAKE_DISC.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteDiscography', 200, res.body);
  });
});
