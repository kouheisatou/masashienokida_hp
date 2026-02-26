import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { beforeEach } from 'vitest';

// vitest-mock-extended が Prisma Client の全メソッドを型安全にモック化する
// これがデファクトスタンダード（Prisma 公式ドキュメントでも推奨）
export const prismaMock = mockDeep<PrismaClient>();

// 各テスト前にモックの呼び出し履歴・戻り値をリセット
beforeEach(() => {
  mockReset(prismaMock);
});
