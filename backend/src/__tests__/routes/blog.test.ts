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

const PUBLISHED_AT = new Date('2024-06-01T00:00:00Z');

const FAKE_POST_PUBLIC = {
  id: '00000000-0000-4000-8000-000000000007',
  title: '公開記事',
  content: '記事本文',
  excerpt: '記事の要約',
  thumbnailUrl: null,
  categoryId: null,
  category: null,
  membersOnly: false,
  isPublished: true,
  publishedAt: PUBLISHED_AT,
  createdAt: new Date('2024-06-01T00:00:00Z'),
  updatedAt: new Date('2024-06-01T00:00:00Z'),
};

const FAKE_POST_MEMBERS = {
  ...FAKE_POST_PUBLIC,
  id: '00000000-0000-4000-8000-000000000008',
  title: 'メンバー限定記事',
  membersOnly: true,
};

// $transaction の戻り値: [total, posts]
function mockTransaction(total: number, posts: typeof FAKE_POST_PUBLIC[]) {
  prismaMock.$transaction.mockImplementation((queries: unknown[]) => {
    if (Array.isArray(queries)) {
      return Promise.resolve([total, posts]);
    }
    return Promise.resolve(null);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /blog', () => {
  it('公開記事一覧を返し openapi スキーマに一致する', async () => {
    mockTransaction(1, [FAKE_POST_PUBLIC]);

    const res = await request(app).get('/blog');

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.totalPages).toBe(1);
    validateResponse('getBlog', 200, res.body);
  });

  it('未認証ユーザーにはメンバー限定記事が isLocked: true で返る', async () => {
    mockTransaction(1, [{ ...FAKE_POST_MEMBERS, content: undefined } as never]);

    const res = await request(app).get('/blog');

    expect(res.status).toBe(200);
    const post = res.body.posts[0];
    expect(post.isLocked).toBe(true);
    expect(post.membersOnly).toBe(true);
  });

  it('USER ロールにはメンバー限定記事が isLocked: true で返る', async () => {
    mockTransaction(1, [{ ...FAKE_POST_MEMBERS, content: undefined } as never]);

    const res = await request(app)
      .get('/blog')
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body.posts[0].isLocked).toBe(true);
  });

  it('MEMBER_FREE ロールにはメンバー限定記事が isLocked: false で返る', async () => {
    mockTransaction(1, [{ ...FAKE_POST_MEMBERS, content: undefined } as never]);

    const res = await request(app)
      .get('/blog')
      .set(authHeader('MEMBER_FREE'));

    expect(res.status).toBe(200);
    expect(res.body.posts[0].isLocked).toBe(false);
  });

  it('MEMBER_GOLD ロールにはメンバー限定記事が isLocked: false で返る', async () => {
    mockTransaction(1, [{ ...FAKE_POST_MEMBERS, content: undefined } as never]);

    const res = await request(app)
      .get('/blog')
      .set(authHeader('MEMBER_GOLD'));

    expect(res.status).toBe(200);
    expect(res.body.posts[0].isLocked).toBe(false);
  });

  it('page クエリによるページネーション', async () => {
    mockTransaction(20, []);

    const res = await request(app).get('/blog?page=2');

    expect(res.status).toBe(200);
    // page=2 なので skip = 9
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('category クエリによるフィルタリング', async () => {
    mockTransaction(0, []);

    await request(app).get('/blog?category=music');

    expect(prismaMock.$transaction).toHaveBeenCalled();
  });
});

describe('GET /blog/:id', () => {
  it('公開記事を返し openapi スキーマに一致する', async () => {
    prismaMock.blogPost.findFirst.mockResolvedValue(FAKE_POST_PUBLIC);

    const res = await request(app).get(`/blog/${FAKE_POST_PUBLIC.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(FAKE_POST_PUBLIC.id);
    expect(res.body.content).toBe(FAKE_POST_PUBLIC.content);
    expect(res.body.isLocked).toBe(false);
    validateResponse('getBlogPost', 200, res.body);
  });

  it('存在しない ID → 404', async () => {
    prismaMock.blogPost.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/blog/non-existent-id');

    expect(res.status).toBe(404);
  });

  it('未認証ユーザーがメンバー限定記事を取得 → content: null, isLocked: true', async () => {
    prismaMock.blogPost.findFirst.mockResolvedValue(FAKE_POST_MEMBERS);

    const res = await request(app).get(`/blog/${FAKE_POST_MEMBERS.id}`);

    expect(res.status).toBe(200);
    expect(res.body.isLocked).toBe(true);
    expect(res.body.content).toBeNull();
  });

  it('USER ロールがメンバー限定記事を取得 → content: null, isLocked: true', async () => {
    prismaMock.blogPost.findFirst.mockResolvedValue(FAKE_POST_MEMBERS);

    const res = await request(app)
      .get(`/blog/${FAKE_POST_MEMBERS.id}`)
      .set(authHeader('USER'));

    expect(res.status).toBe(200);
    expect(res.body.isLocked).toBe(true);
    expect(res.body.content).toBeNull();
  });

  it('MEMBER_FREE ロールがメンバー限定記事を取得 → content あり, isLocked: false', async () => {
    prismaMock.blogPost.findFirst.mockResolvedValue(FAKE_POST_MEMBERS);

    const res = await request(app)
      .get(`/blog/${FAKE_POST_MEMBERS.id}`)
      .set(authHeader('MEMBER_FREE'));

    expect(res.status).toBe(200);
    expect(res.body.isLocked).toBe(false);
    expect(res.body.content).toBe(FAKE_POST_MEMBERS.content);
  });

  it('MEMBER_GOLD ロールがメンバー限定記事を取得 → content あり, isLocked: false', async () => {
    prismaMock.blogPost.findFirst.mockResolvedValue(FAKE_POST_MEMBERS);

    const res = await request(app)
      .get(`/blog/${FAKE_POST_MEMBERS.id}`)
      .set(authHeader('MEMBER_GOLD'));

    expect(res.status).toBe(200);
    expect(res.body.isLocked).toBe(false);
    expect(res.body.content).toBe(FAKE_POST_MEMBERS.content);
  });
});
