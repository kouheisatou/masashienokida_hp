/**
 * Contact Function - OCI Function for Contact Form
 * Handles form submissions with bot protection
 */

import {
  executeQuery,
  executeInsert,
  createResponse,
  handleCors,
  badRequest,
  serverError,
  rateLimitExceeded,
  verifyAuth,
  parseBody,
  sanitizeInput,
  validateEmail,
  RATE_LIMITS,
  checkRateLimit,
  getClientIP,
  verifyRecaptcha,
  validateFormInput,
} from '@enokida/shared';

// OCI Function context
interface FunctionContext {
  httpGateway: {
    requestURL: string;
    headers: Record<string, string>;
    method: string;
  };
}

// Contact form data
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category?: string;
  message: string;
  recaptchaToken?: string;
}

// Contact categories
const VALID_CATEGORIES = [
  'リサイタル依頼',
  'コンサート依頼',
  'ボランティア公演',
  '取材・メディア',
  'サポーターズクラブ',
  'その他',
];

/**
 * Main function handler
 */
export async function handler(
  ctx: FunctionContext,
  data: string
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  const { headers, method } = ctx.httpGateway;

  if (method === 'OPTIONS') {
    return handleCors();
  }

  if (method !== 'POST') {
    return createResponse(405, { error: 'Method not allowed' });
  }

  try {
    return await handleContactSubmission(headers, data);
  } catch (error) {
    console.error('Contact function error:', error);
    return serverError('お問い合わせの送信に失敗しました');
  }
}

/**
 * Handle contact form submission
 */
async function handleContactSubmission(
  headers: Record<string, string>,
  data: string
): Promise<ReturnType<typeof createResponse>> {
  // Get client IP for rate limiting
  const clientIP = getClientIP(headers);

  // Check rate limit (3 requests per 5 minutes)
  const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMITS.contact);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil(
      (rateLimitResult.resetAt.getTime() - Date.now()) / 1000
    );
    return rateLimitExceeded(
      retryAfter,
      'お問い合わせの送信回数が上限に達しました。しばらく待ってから再度お試しください。'
    );
  }

  // Parse request body
  const body = parseBody<ContactFormData>(data);

  if (!body) {
    return badRequest('リクエストの形式が正しくありません');
  }

  // Validate reCAPTCHA
  if (process.env.RECAPTCHA_SECRET_KEY) {
    const recaptchaResult = await verifyRecaptcha(
      body.recaptchaToken || '',
      'contact'
    );

    if (!recaptchaResult.success) {
      return createResponse(403, {
        error: 'Bot detection',
        message: recaptchaResult.error || 'セキュリティ検証に失敗しました',
      });
    }
  }

  // Validate form input
  const validation = validateFormInput({
    name: body.name,
    email: body.email,
    message: body.message,
  });

  if (!validation.valid) {
    return badRequest('入力内容を確認してください', {
      errors: validation.errors,
    });
  }

  // Validate required fields
  if (!body.name || !body.email || !body.subject || !body.message) {
    return badRequest('必須項目を入力してください');
  }

  // Validate email format
  if (!validateEmail(body.email)) {
    return badRequest('メールアドレスの形式が正しくありません');
  }

  // Validate category if provided
  if (body.category && !VALID_CATEGORIES.includes(body.category)) {
    return badRequest('カテゴリが正しくありません');
  }

  // Sanitize inputs
  const sanitizedData = {
    name: sanitizeInput(body.name),
    email: body.email.trim().toLowerCase(),
    phone: body.phone ? sanitizeInput(body.phone) : null,
    subject: sanitizeInput(body.subject),
    category: body.category || 'その他',
    message: sanitizeInput(body.message),
  };

  // Get user ID if authenticated
  const user = await verifyAuth(headers);
  const userId = user?.id || null;

  // Get user agent for logging
  const userAgent = headers['user-agent'] || headers['User-Agent'] || '';

  // Store contact submission
  const result = await executeInsert(
    `INSERT INTO contacts
     (id, user_id, name, email, phone, subject, category, message, status, ip_address, user_agent)
     VALUES (SYS_GUID(), :userId, :name, :email, :phone, :subject, :category, :message, 'PENDING', :ip, :ua)`,
    {
      userId,
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      subject: sanitizedData.subject,
      category: sanitizedData.category,
      message: sanitizedData.message,
      ip: clientIP,
      ua: userAgent.substring(0, 500),
    }
  );

  // Send notification email to admin (async, don't wait)
  sendAdminNotification(sanitizedData).catch((err) =>
    console.error('Failed to send admin notification:', err)
  );

  // Send confirmation email to user (async, don't wait)
  sendUserConfirmation(sanitizedData).catch((err) =>
    console.error('Failed to send user confirmation:', err)
  );

  // Add rate limit headers to response
  return createResponse(
    200,
    {
      success: true,
      message: 'お問い合わせを受け付けました。確認メールをお送りしましたのでご確認ください。',
      id: result.id,
    },
    {
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
    }
  );
}

/**
 * Send notification email to admin
 */
async function sendAdminNotification(data: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  category: string;
  message: string;
}): Promise<void> {
  // OCI Email Delivery configuration
  const smtpEndpoint = process.env.OCI_SMTP_ENDPOINT;
  const smtpUser = process.env.OCI_SMTP_USER;
  const smtpPassword = process.env.OCI_SMTP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@masashi-enokida.com';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@masashi-enokida.com';

  if (!smtpEndpoint || !smtpUser || !smtpPassword) {
    console.log('Email not configured, skipping admin notification');
    console.log('Contact submission:', data);
    return;
  }

  // Format email body
  const emailBody = `
新しいお問い合わせがありました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${data.name}
メール: ${data.email}
電話番号: ${data.phone || '未入力'}
カテゴリ: ${data.category}
件名: ${data.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ お問い合わせ内容

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※ このメールは自動送信されています。
  `.trim();

  // Send email using OCI Email Delivery
  // Implementation depends on your email sending method
  // This is a placeholder for the actual implementation
  console.log('Sending admin notification to:', adminEmail);
  console.log('Email body:', emailBody);
}

/**
 * Send confirmation email to user
 */
async function sendUserConfirmation(data: {
  name: string;
  email: string;
  subject: string;
}): Promise<void> {
  const smtpEndpoint = process.env.OCI_SMTP_ENDPOINT;

  if (!smtpEndpoint) {
    console.log('Email not configured, skipping user confirmation');
    return;
  }

  const emailBody = `
${data.name} 様

お問い合わせいただきありがとうございます。
以下の内容でお問い合わせを受け付けました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
件名: ${data.subject}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

内容を確認の上、折り返しご連絡いたします。
今しばらくお待ちくださいますようお願い申し上げます。

※ このメールは自動送信されています。
※ 本メールに心当たりのない場合は、お手数ですがメールを破棄してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ピアニスト 榎田雅士 公式サイト
https://www.masashi-enokida.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  console.log('Sending user confirmation to:', data.email);
  console.log('Email body:', emailBody);
}

module.exports = { handler };
