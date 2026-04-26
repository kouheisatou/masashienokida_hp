import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'blog-images';

/**
 * ブラウザ向けに署名 URL を組み立てる際のホスト。
 * Docker 内部 (`http://minio:9000`) ではなく、ブラウザがアクセス可能な
 * URL (`http://localhost:9000` など) を `MINIO_PUBLIC_URL` で指定する。
 */
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000';

const SIGNED_URL_TTL_SECONDS = Number(process.env.MINIO_SIGNED_URL_TTL ?? 3600);

/**
 * 内部処理用 (PUT / DELETE) の S3 クライアント。
 * MINIO_ENDPOINT (Docker 内部 DNS など) を向く。
 */
export const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? 'minioadmin',
  },
  forcePathStyle: true,
});

/**
 * ブラウザに渡す署名 URL を生成するための S3 クライアント。
 * 署名対象のホストはブラウザから到達可能な MINIO_PUBLIC_URL とする。
 * 内部 DNS (minio:9000) で署名すると署名対象ホストが一致せず、
 * ブラウザでの GET が SignatureDoesNotMatch になる。
 */
const s3PublicSigner = new S3Client({
  endpoint: MINIO_PUBLIC_URL,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? 'minioadmin',
  },
  forcePathStyle: true,
});

/**
 * 画像をアップロードして bucket 内のキー（パス）を返す。
 * M-10 対応により公開 URL は返さなくなった (bucket は private 化)。
 * URL 取得は `getSignedUrl(key)` を呼び出して、TTL 付きの署名 URL を都度生成する。
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  contentType = 'image/webp'
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return filename;
}

export async function deleteImage(filename: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: filename,
    })
  );
}

/**
 * private bucket 内オブジェクトの GET 用署名 URL を生成。
 * デフォルトで 1 時間有効 (`MINIO_SIGNED_URL_TTL` 環境変数で調整可能)。
 *
 * 引数 `keyOrUrl` には bucket key (例: `1700000000-abc.webp`) を渡す想定だが、
 * 後方互換のため過去に保存した完全 URL (`http://...:9000/bucket/key`) や
 * 同 origin の絶対パスが渡された場合も末尾の key を抽出して署名する。
 */
export async function getSignedUrl(
  keyOrUrl: string,
  expiresInSeconds: number = SIGNED_URL_TTL_SECONDS
): Promise<string> {
  const key = extractKey(keyOrUrl);
  const cmd = new GetObjectCommand({ Bucket: MINIO_BUCKET, Key: key });
  return awsGetSignedUrl(s3PublicSigner, cmd, { expiresIn: expiresInSeconds });
}

/**
 * 旧 `getPublicUrl` 互換のラッパ。新規コードは `getSignedUrl` を使用すること。
 * @deprecated 1 時間有効の署名 URL を返す。M-10 対応で anonymous read は廃止された。
 */
export async function getPublicUrl(keyOrUrl: string): Promise<string> {
  return getSignedUrl(keyOrUrl);
}

/**
 * key, 完全 URL, `/bucket/key` パス いずれが来ても bucket key だけを取り出す。
 */
function extractKey(keyOrUrl: string): string {
  if (!keyOrUrl) return keyOrUrl;
  const trimmed = keyOrUrl.trim();
  // 完全 URL の場合
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const path = u.pathname.replace(/^\/+/, '');
      const prefix = `${MINIO_BUCKET}/`;
      if (path.startsWith(prefix)) return path.slice(prefix.length);
      return path;
    } catch {
      return trimmed;
    }
  }
  // /bucket/key 形式
  const noLead = trimmed.replace(/^\/+/, '');
  const prefix = `${MINIO_BUCKET}/`;
  if (noLead.startsWith(prefix)) return noLead.slice(prefix.length);
  return noLead;
}
