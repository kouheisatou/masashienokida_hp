import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

榎田まさし 公式サイト
    `.trim(),
  });
}
