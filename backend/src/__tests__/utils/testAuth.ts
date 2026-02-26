import jwt from 'jsonwebtoken';

const TEST_SECRET = process.env.JWT_SECRET ?? 'test-secret-32-chars-minimum-ok!!';

export type TestRole = 'USER' | 'MEMBER_FREE' | 'MEMBER_GOLD' | 'ADMIN';

/**
 * テスト用 Bearer JWT トークンを生成する。
 * setup.ts で設定した JWT_SECRET と一致させること。
 */
export function makeToken(
  role: TestRole,
  overrides: { userId?: string; email?: string } = {}
): string {
  const payload = {
    userId: overrides.userId ?? '00000000-0000-4000-8000-000000000001',
    email: overrides.email ?? `test-${role.toLowerCase()}@example.com`,
    role,
  };
  return jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });
}

export function authHeader(role: TestRole): { Authorization: string } {
  return { Authorization: `Bearer ${makeToken(role)}` };
}
