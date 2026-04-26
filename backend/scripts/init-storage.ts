/**
 * MinIO bucket initialization script (M-10)
 *
 * 目的:
 *   - 起動時に bucket 存在を確認し、なければ作成
 *   - bucket policy を private 化 (anonymous-read を撤廃)
 *
 * 実行:
 *   ts-node backend/scripts/init-storage.ts
 *
 * docker-compose.yml の `minio-init` で `mc anonymous set download local/<bucket>` を
 * 行っていた public 化を廃止し、本スクリプトで明示的に anonymous policy を解除する。
 */
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  DeleteBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { logger } from '../src/lib/logger';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'blog-images';

const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? 'minioadmin',
  },
  forcePathStyle: true,
});

/**
 * 完全に anonymous read を拒否する policy。
 * 認証 (アクセスキー署名 / 署名 URL) があるリクエストのみ通過。
 */
const PRIVATE_POLICY = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'DenyAnonymousAccess',
      Effect: 'Deny',
      Principal: { AWS: ['*'] },
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
      Condition: { Null: { 'aws:SecureTransport': false }, Bool: { 'aws:PrincipalIsAWSService': 'false' } },
    },
  ],
};

async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
    logger.info('storage.bucket.exists', { bucket: MINIO_BUCKET });
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
    logger.info('storage.bucket.created', { bucket: MINIO_BUCKET });
  }
}

async function applyPrivatePolicy(): Promise<void> {
  // 既存の anonymous policy を完全削除してから明示的な Deny policy を設定。
  // MinIO は SDK 経由で DeleteBucketPolicy を呼んだ後でも anonymous は default deny に戻る。
  try {
    await s3.send(new DeleteBucketPolicyCommand({ Bucket: MINIO_BUCKET }));
    logger.info('storage.policy.cleared', { bucket: MINIO_BUCKET });
  } catch (err) {
    // policy が無い場合は NoSuchBucketPolicy が返るので無視
    logger.debug('storage.policy.delete_skipped', { reason: (err as Error).message });
  }

  try {
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: MINIO_BUCKET,
        Policy: JSON.stringify(PRIVATE_POLICY),
      })
    );
    logger.info('storage.policy.private_applied', { bucket: MINIO_BUCKET });
  } catch (err) {
    // 一部の MinIO バージョンでは Deny policy を MinIO 側が拒否することがあるが、
    // policy 削除済みなので default = private のまま。エラーは warn にとどめる。
    logger.warn('storage.policy.apply_failed', {
      bucket: MINIO_BUCKET,
      error: (err as Error).message,
    });
  }
}

async function main() {
  logger.info('storage.init.start', { endpoint: MINIO_ENDPOINT, bucket: MINIO_BUCKET });
  await ensureBucket();
  await applyPrivatePolicy();
  logger.info('storage.init.done');
}

main().catch((err) => {
  logger.error('storage.init.failed', { error: (err as Error).message });
  process.exit(1);
});
