import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SITE_NAME = '榎田まさし 公式サイト';

function siteUrl(path = ''): string {
  return `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}${path}`;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    ...options,
  });
}

async function sendBulkMail(
  recipients: { email: string }[],
  subject: string,
  text: string,
) {
  const results = await Promise.allSettled(
    recipients.map((r) => sendMail({ to: r.email, subject, text })),
  );
  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(`Bulk mail: ${failed.length}/${recipients.length} failed for "${subject}"`);
  }
}

// ── Contact ──────────────────────────────────────────────────────

export async function sendContactNotification(contact: {
  name: string;
  email: string;
  phone?: string;
  category?: string;
  subject: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendMail({
    to: adminEmail,
    subject: `[お問い合わせ] ${contact.subject}`,
    text: `
新しいお問い合わせが届きました。

お名前: ${contact.name}
メール: ${contact.email}
電話番号: ${contact.phone ?? '未入力'}
カテゴリ: ${contact.category ?? '未選択'}
件名: ${contact.subject}

メッセージ:
${contact.message}
    `.trim(),
  });
}

export async function sendContactConfirmation(to: string, name: string, subject: string) {
  await sendMail({
    to,
    subject: `お問い合わせを受け付けました: ${subject}`,
    text: `
${name} 様

この度はお問い合わせいただきありがとうございます。
以下の内容を受け付けました。

件名: ${subject}

内容を確認の上、担当者よりご連絡いたします。
しばらくお待ちください。

${SITE_NAME}
    `.trim(),
  });
}

// ── Welcome (N4) ─────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  await sendMail({
    to,
    subject: 'ご登録ありがとうございます',
    text: `
${name} 様

${SITE_NAME}への会員登録が完了しました。

マイページではコンサート情報の確認や、会員限定コンテンツをお楽しみいただけます。

▼ マイページ
${siteUrl('/members')}

▼ ゴールド会員について
${siteUrl('/supporters')}

今後ともどうぞよろしくお願いいたします。

${SITE_NAME}
    `.trim(),
  });
}

// ── Gold Welcome (N5) ────────────────────────────────────────────

export async function sendGoldWelcomeEmail(to: string, name: string) {
  await sendMail({
    to,
    subject: 'ゴールド会員へようこそ',
    text: `
${name} 様

ゴールド会員へのご登録ありがとうございます。

これより以下の特典をお楽しみいただけます：
・会員限定記事・動画の閲覧
・主催公演チケット10%OFF
・年1回の主催公演無料招待
・年1回のリハーサル見学
・会員限定交流会への参加

▼ 限定コンテンツ
${siteUrl('/members/content')}

▼ サブスクリプション管理
${siteUrl('/members/profile')}

今後ともどうぞよろしくお願いいたします。

${SITE_NAME}
    `.trim(),
  });
}

// ── New Gold Member → Admin (N3) ─────────────────────────────────

export async function sendNewGoldMemberToAdmin(user: { name: string | null; email: string }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  await sendMail({
    to: adminEmail,
    subject: `[新規ゴールド会員] ${user.name ?? user.email}`,
    text: `
新しいゴールド会員が登録されました。

お名前: ${user.name ?? '未設定'}
メール: ${user.email}

▼ 会員管理
${siteUrl('/admin/members')}
    `.trim(),
  });
}

// ── News Notification (N1) ───────────────────────────────────────

export async function sendNewsNotification(news: { id: string; title: string; body: string | null }) {
  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: { email: true },
  });
  if (users.length === 0) return;

  const text = `
新しいお知らせが公開されました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${news.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${news.body ? `\n${news.body}\n` : ''}
▼ 詳細はこちら
${siteUrl(`/news`)}

${SITE_NAME}
  `.trim();

  await sendBulkMail(users, `[お知らせ] ${news.title}`, text);
}

// ── Blog Post Notification (N2) ──────────────────────────────────

export async function sendBlogPostNotification(post: { id: string; title: string; excerpt: string | null }) {
  const goldUsers = await prisma.user.findMany({
    where: { role: 'MEMBER_GOLD' },
    select: { email: true },
  });
  if (goldUsers.length === 0) return;

  const text = `
新しい記事が公開されました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${post.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${post.excerpt ? `\n${post.excerpt}\n` : ''}
▼ 記事を読む
${siteUrl(`/blog/${post.id}`)}

${SITE_NAME}
  `.trim();

  await sendBulkMail(goldUsers, `[新着記事] ${post.title}`, text);
}

// ── Concert Notification (N6) ────────────────────────────────────

export async function sendConcertNotification(concert: {
  id: string;
  title: string;
  date: Date;
  venue: string;
  price: string | null;
}) {
  const users = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: { email: true },
  });
  if (users.length === 0) return;

  const dateStr = concert.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const text = `
新しいコンサート情報が公開されました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${concert.title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

日時: ${dateStr}
会場: ${concert.venue}
${concert.price ? `料金: ${concert.price}` : ''}

▼ 詳細・チケット
${siteUrl('/concerts')}

${SITE_NAME}
  `.trim();

  await sendBulkMail(users, `[コンサート情報] ${concert.title}`, text);
}
