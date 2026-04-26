/**
 * HTML / Markdown 本文用 sanitizer。
 *
 * ブログ本文は管理コンソール側で markdown / 簡易 HTML として保存される可能性があるため、
 * 保存時にサーバ側で sanitize-html を通し、`<script>` `<iframe>` `on*` 属性等を除去する。
 *
 * - 許可タグは見出し・段落・リスト・リンク・画像・コード・引用 など、ブログ本文で
 *   想定される最小集合のみ。
 * - リンク / 画像の URL は `http:`, `https:`, `mailto:` のみ許可し、`javascript:`, `data:`
 *   などは弾く。
 */
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
  'blockquote', 'q', 'cite',
  'ul', 'ol', 'li',
  'a', 'img',
  'code', 'pre',
  'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    span: ['class'],
    div: ['class'],
    code: ['class'],
    pre: ['class'],
    th: ['scope'],
    '*': [], // それ以外のタグは属性なし
  },
  // 許可するスキームを制限。`javascript:` `data:` `vbscript:` などは弾かれる。
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: false,
  // 不正な属性 / タグを silently 除去
  disallowedTagsMode: 'discard',
  // a タグには rel=noopener を強制してタブ乗っ取りを防ぐ
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
};

/**
 * ブログ本文向け HTML / markdown 文字列を sanitize する。
 * 入力が `null` / `undefined` の場合はそのまま返す。
 */
export function sanitizeBlogContent(input: string | null | undefined): string | null | undefined {
  if (input == null) return input;
  return sanitizeHtml(input, SANITIZE_OPTIONS);
}

/**
 * 短文 (excerpt 等) 用の sanitizer。タグは全て除去しテキストのみ残す。
 */
export function sanitizePlainText(input: string | null | undefined): string | null | undefined {
  if (input == null) return input;
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
}
