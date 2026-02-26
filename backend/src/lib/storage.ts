import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? 'http://minio:9000';
export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'blog-images';
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000';

export const s3 = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER ?? 'minioadmin',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD ?? 'minioadmin',
  },
  forcePathStyle: true,
});

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
  return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${filename}`;
}

export async function deleteImage(filename: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: filename,
    })
  );
}
