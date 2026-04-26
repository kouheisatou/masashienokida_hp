/**
 * 集約 zod スキーマ。各 router は `schema.parse(req.body)` で検証し、
 * `handleZodError` で `ZodError` を 400 に変換する。
 *
 * URL は `urlSchema` ヘルパで `https?:` のみ許可し、`javascript:` / `data:` などを拒否する。
 */
import { z, ZodError, ZodTypeAny } from 'zod';
import type { Request, Response } from 'express';

// ── 共通ヘルパ ────────────────────────────────────────────────────

/**
 * URL 文字列スキーマ。`http:` または `https:` のみ許可する。
 * `javascript:`, `data:`, `vbscript:`, `file:` 等を拒否することで XSS / open redirect を防ぐ。
 *
 * - 空文字 / null / undefined を許容する場合は `.nullable().optional()` を呼び出し側で付ける
 *   か、`urlOrEmpty()` を使う。
 */
export function urlSchema() {
  return z
    .string()
    .trim()
    .max(2048, 'URL が長すぎます')
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL は http または https スキームのみ許可されます' }
    );
}

/**
 * URL もしくは空文字列を許可する。空文字は `null` 等への正規化は呼び出し側で行う。
 */
export function urlOrEmpty() {
  return z.union([urlSchema(), z.literal('')]);
}

/**
 * 既存実装が `null` / `undefined` を許容するフィールドのため、
 * `string | null | undefined` を許可しつつ URL 検証を行うヘルパ。
 */
export function nullableUrl() {
  return urlOrEmpty().nullable().optional();
}

/** 共通の email スキーマ (RFC 完全準拠ではないが既存の正規表現と同等強度) */
export const emailSchema = z
  .string()
  .trim()
  .min(1)
  .max(254)
  .email('メールアドレスの形式が正しくありません');

/** ZodError → 400 のレスポンスに変換するハンドラ */
export function handleZodError(err: unknown, res: Response): boolean {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
    return true;
  }
  return false;
}

/**
 * ルートハンドラ内で使う型安全な parse ラッパ。
 * バリデーション失敗時はレスポンスを書き出して `null` を返す。
 */
export function parseBody<T extends ZodTypeAny>(
  req: Request,
  res: Response,
  schema: T
): z.infer<T> | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    handleZodError(result.error, res);
    return null;
  }
  return result.data;
}

// ── 個別スキーマ ──────────────────────────────────────────────────

// ── Contact (公開フォーム) ───────────────────────────────────────
export const contactCreateSchema = z.object({
  name: z.string().trim().min(1, '必須項目を入力してください').max(200),
  email: emailSchema,
  phone: z
    .union([z.string().trim().max(50), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' || v == null ? null : v)),
  category: z
    .union([z.string().trim().max(100), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' || v == null ? null : v)),
  subject: z.string().trim().min(1, '必須項目を入力してください').max(500),
  message: z.string().trim().min(1, '必須項目を入力してください').max(10000),
});

// ── Concert ──────────────────────────────────────────────────────
const concertBase = {
  title: z.string().trim().min(1).max(500),
  date: z.union([z.string().min(1), z.date()]),
  time: z.string().trim().max(50).nullable().optional(),
  venue: z.string().trim().min(1).max(500),
  address: z.string().trim().max(500).nullable().optional(),
  image_url: nullableUrl(),
  program: z.union([z.array(z.string().max(500)), z.string().max(500)]).nullable().optional(),
  price: z.string().trim().max(200).nullable().optional(),
  ticket_url: nullableUrl(),
  note: z.string().max(5000).nullable().optional(),
  is_upcoming: z.boolean().optional(),
  is_published: z.boolean().optional(),
};

export const concertCreateSchema = z.object(concertBase);

export const concertUpdateSchema = z.object({
  ...concertBase,
  title: concertBase.title.optional(),
  date: concertBase.date.optional(),
  venue: concertBase.venue.optional(),
});

// ── Discography ──────────────────────────────────────────────────
const discographyBase = {
  title: z.string().trim().min(1).max(500),
  release_year: z.coerce.number().int().min(1900).max(2100),
  description: z.string().max(5000).nullable().optional(),
  image_url: nullableUrl(),
  purchase_url: nullableUrl(),
  audio_url: nullableUrl(),
  link_url: nullableUrl(),
  sort_order: z.coerce.number().int().optional(),
  is_published: z.boolean().optional(),
};

export const discographyCreateSchema = z.object(discographyBase);

export const discographyUpdateSchema = z.object({
  ...discographyBase,
  title: discographyBase.title.optional(),
  release_year: discographyBase.release_year.optional(),
});

export const reorderSchema = z.array(
  z.object({
    id: z.string().min(1),
    sort_order: z.coerce.number().int(),
  })
);

// ── Biography ────────────────────────────────────────────────────
const biographyBase = {
  year: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(5000),
  sort_order: z.coerce.number().int().optional(),
};

export const biographyCreateSchema = z.object(biographyBase);

export const biographyUpdateSchema = z.object({
  year: biographyBase.year.optional(),
  description: biographyBase.description.optional(),
  sort_order: biographyBase.sort_order,
});

// ── Blog (Admin) ─────────────────────────────────────────────────
const blogPostBase = {
  title: z.string().trim().min(1).max(500),
  content: z.string().max(200_000).nullable().optional(),
  excerpt: z.string().max(2000).nullable().optional(),
  thumbnail_url: nullableUrl(),
  category_id: z.string().min(1).nullable().optional(),
  members_only: z.boolean().optional(),
  is_published: z.boolean().optional(),
  published_at: z
    .union([z.string(), z.date(), z.null()])
    .optional(),
};

export const blogPostCreateSchema = z.object(blogPostBase);
export const blogPostUpdateSchema = z.object({
  ...blogPostBase,
  title: blogPostBase.title.optional(),
});

export const blogCategoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i, 'slug は英数字とハイフンのみ使えます'),
  sort_order: z.coerce.number().int().optional(),
});

export const blogCategoryUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i, 'slug は英数字とハイフンのみ使えます')
    .optional(),
  sort_order: z.coerce.number().int().optional(),
});

// ── Admin Contact 更新 ───────────────────────────────────────────
export const adminContactUpdateSchema = z.object({
  status: z.enum(['unread', 'read', 'replied', 'archived']),
});
