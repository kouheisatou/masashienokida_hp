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

const FAKE_BIOGRAPHY = {
  id: '00000000-0000-4000-8000-000000000005',
  year: '2010',
  description: '東京藝術大学に入学',
  sortOrder: 1,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /biography', () => {
  it('略歴一覧を返し openapi スキーマに一致する', async () => {
    prismaMock.biography.findMany.mockResolvedValue([FAKE_BIOGRAPHY]);

    const res = await request(app).get('/biography');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].year).toBe(FAKE_BIOGRAPHY.year);
    expect(res.body[0].sort_order).toBe(FAKE_BIOGRAPHY.sortOrder);
    validateResponse('getBiography', 200, res.body);
  });
});

describe('POST /biography', () => {
  it('未認証 → 401', async () => {
    const res = await request(app)
      .post('/biography')
      .send({ year: '2010', description: 'テスト' });
    expect(res.status).toBe(401);
  });

  it('USER ロール → 403', async () => {
    const res = await request(app)
      .post('/biography')
      .set(authHeader('USER'))
      .send({ year: '2010', description: 'テスト' });
    expect(res.status).toBe(403);
  });

  it('ADMIN → 201 で略歴を作成し openapi スキーマに一致する', async () => {
    prismaMock.biography.create.mockResolvedValue(FAKE_BIOGRAPHY);

    const res = await request(app)
      .post('/biography')
      .set(authHeader('ADMIN'))
      .send({ year: '2010', description: '東京藝術大学に入学' });

    expect(res.status).toBe(201);
    expect(res.body.year).toBe(FAKE_BIOGRAPHY.year);
    validateResponse('createBiography', 201, res.body);
  });
});

describe('PUT /biography/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app)
      .put(`/biography/${FAKE_BIOGRAPHY.id}`)
      .send({ year: '2011', description: '更新' });
    expect(res.status).toBe(401);
  });

  it('ADMIN → 略歴を更新して返す', async () => {
    const updated = { ...FAKE_BIOGRAPHY, description: '卒業' };
    prismaMock.biography.update.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/biography/${FAKE_BIOGRAPHY.id}`)
      .set(authHeader('ADMIN'))
      .send({ year: '2010', description: '卒業' });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('卒業');
    validateResponse('updateBiography', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.biography.update.mockRejectedValue({ code: 'P2025' });

    const res = await request(app)
      .put('/biography/non-existent-id')
      .set(authHeader('ADMIN'))
      .send({ year: '2010', description: 'テスト' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /biography/:id', () => {
  it('未認証 → 401', async () => {
    const res = await request(app).delete(`/biography/${FAKE_BIOGRAPHY.id}`);
    expect(res.status).toBe(401);
  });

  it('ADMIN → { ok: true }', async () => {
    prismaMock.biography.delete.mockResolvedValue(FAKE_BIOGRAPHY);

    const res = await request(app)
      .delete(`/biography/${FAKE_BIOGRAPHY.id}`)
      .set(authHeader('ADMIN'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('deleteBiography', 200, res.body);
  });
});
