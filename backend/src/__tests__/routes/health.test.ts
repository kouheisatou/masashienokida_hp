import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { validateResponse } from '../utils/openApiValidator';

vi.mock('../../lib/prisma', async () => {
  const { prismaMock } = await import('../mocks/prisma');
  return { prisma: prismaMock };
});

describe('GET /health', () => {
  it('{ ok: true } を返し openapi スキーマに一致する', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    validateResponse('getHealth', 200, res.body);
  });
});
