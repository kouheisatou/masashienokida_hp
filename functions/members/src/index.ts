/**
 * Members Function - OCI Function for Member Management
 * Handles profile, subscription, and member-only content
 */

import {
  executeQuery,
  createResponse,
  handleCors,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  serverError,
  verifyAuth,
  isMember,
  isGoldMember,
  parseBody,
  sanitizeInput,
} from '@enokida/shared';

// OCI Function context
interface FunctionContext {
  httpGateway: {
    requestURL: string;
    headers: Record<string, string>;
    method: string;
  };
}

// User profile row
interface UserRow {
  ID: string;
  NAME: string;
  EMAIL: string;
  IMAGE: string | null;
  ROLE: string;
  CREATED_AT: Date;
  STRIPE_CUSTOMER_ID: string | null;
}

// Subscription row
interface SubscriptionRow {
  TIER: string;
  STATUS: string;
  CURRENT_PERIOD_END: Date;
  CANCEL_AT_PERIOD_END: number;
}

/**
 * Main function handler
 */
export async function handler(
  ctx: FunctionContext,
  data: string
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }> {
  const { requestURL, headers, method } = ctx.httpGateway;

  if (method === 'OPTIONS') {
    return handleCors();
  }

  // All member routes require authentication
  const user = await verifyAuth(headers);

  if (!user) {
    return unauthorized('ログインが必要です');
  }

  const url = new URL(requestURL);
  const path = url.pathname.replace(/^\/api\/members/, '');

  try {
    switch (path) {
      case '/profile':
        return method === 'GET'
          ? await handleGetProfile(user.id)
          : await handleUpdateProfile(user.id, data);

      case '/content':
        return await handleGetContent(user);

      case '/subscription':
        return await handleGetSubscription(user.id);

      case '/benefits':
        return await handleGetBenefits(user);

      default:
        return notFound('エンドポイントが見つかりません');
    }
  } catch (error) {
    console.error('Members function error:', error);
    return serverError('エラーが発生しました');
  }
}

/**
 * Get user profile
 */
async function handleGetProfile(
  userId: string
): Promise<ReturnType<typeof createResponse>> {
  const users = await executeQuery<UserRow>(
    `SELECT id, name, email, image, role, created_at, stripe_customer_id
     FROM users WHERE id = :userId`,
    { userId }
  );

  if (users.length === 0) {
    return notFound('ユーザーが見つかりません');
  }

  const user = users[0];

  // Get subscription info
  const subs = await executeQuery<SubscriptionRow>(
    `SELECT tier, status, current_period_end, cancel_at_period_end
     FROM subscriptions
     WHERE user_id = :userId AND status = 'ACTIVE'
     ORDER BY created_at DESC
     FETCH FIRST 1 ROW ONLY`,
    { userId }
  );

  return createResponse(200, {
    id: user.ID,
    name: user.NAME,
    email: user.EMAIL,
    image: user.IMAGE,
    role: user.ROLE,
    createdAt: user.CREATED_AT,
    subscription:
      subs.length > 0
        ? {
            tier: subs[0].TIER,
            status: subs[0].STATUS,
            currentPeriodEnd: subs[0].CURRENT_PERIOD_END,
            cancelAtPeriodEnd: subs[0].CANCEL_AT_PERIOD_END === 1,
          }
        : null,
  });
}

/**
 * Update user profile
 */
async function handleUpdateProfile(
  userId: string,
  data: string
): Promise<ReturnType<typeof createResponse>> {
  const body = parseBody<{ name?: string }>(data);

  if (!body || !body.name) {
    return badRequest('名前は必須です');
  }

  const name = sanitizeInput(body.name);

  if (name.length < 1 || name.length > 100) {
    return badRequest('名前は1〜100文字で入力してください');
  }

  await executeQuery(
    `UPDATE users SET name = :name WHERE id = :userId`,
    { name, userId }
  );

  return createResponse(200, {
    success: true,
    message: 'プロフィールを更新しました',
  });
}

/**
 * Get member-only content
 */
async function handleGetContent(
  user: { id: string; role: string }
): Promise<ReturnType<typeof createResponse>> {
  // Check membership
  if (!isMember({ ...user, name: '', email: '' })) {
    return forbidden('会員登録が必要です', {
      upgradeUrl: '/supporters',
    });
  }

  const isGold = isGoldMember({ ...user, name: '', email: '' });

  // Member content organized by category
  const content = {
    videos: [
      {
        id: 'v1',
        title: 'リハーサル映像 - トロイメライ',
        description: '2023年秋のリサイタルに向けたリハーサル風景',
        thumbnail: '/images/members/rehearsal-1.jpg',
        duration: '12:34',
        tier: 'MEMBER_FREE',
        available: true,
      },
      {
        id: 'v2',
        title: '限定インタビュー - 音楽との出会い',
        description: 'ピアノを始めたきっかけ、師との出会いについて',
        thumbnail: '/images/members/interview-1.jpg',
        duration: '25:10',
        tier: 'MEMBER_GOLD',
        available: isGold,
      },
      {
        id: 'v3',
        title: 'マスタークラス - ショパン練習曲 Op.10-4',
        description: '難曲へのアプローチを詳しく解説',
        thumbnail: '/images/members/masterclass-1.jpg',
        duration: '45:22',
        tier: 'MEMBER_GOLD',
        available: isGold,
      },
    ],
    articles: [
      {
        id: 'a1',
        title: '会員限定ニュースレター Vol.1',
        excerpt: '最新のコンサート情報、裏話をお届けします',
        publishedAt: '2024-01-15',
        tier: 'MEMBER_FREE',
        available: true,
      },
      {
        id: 'a2',
        title: 'ツアー日記 - ヨーロッパ編',
        excerpt: 'イタリア、ポーランドでの演奏旅行の記録',
        publishedAt: '2024-02-10',
        tier: 'MEMBER_GOLD',
        available: isGold,
      },
    ],
    photos: [
      {
        id: 'p1',
        title: 'バックステージ写真集',
        count: 24,
        tier: 'MEMBER_GOLD',
        available: isGold,
      },
    ],
    benefits: [
      {
        id: 'b1',
        title: '先行チケット予約',
        description: '一般発売より1週間早くチケットを購入できます',
        tier: 'MEMBER_FREE',
        available: true,
      },
      {
        id: 'b2',
        title: 'チケット割引',
        description: '主催公演のチケットが10%OFF',
        tier: 'MEMBER_GOLD',
        available: isGold,
      },
      {
        id: 'b3',
        title: '年1回の無料招待',
        description: '主催公演に年1回無料でご招待',
        tier: 'MEMBER_GOLD',
        available: isGold,
      },
    ],
  };

  return createResponse(200, {
    tier: isGold ? 'MEMBER_GOLD' : 'MEMBER_FREE',
    content,
  });
}

/**
 * Get subscription details
 */
async function handleGetSubscription(
  userId: string
): Promise<ReturnType<typeof createResponse>> {
  const subs = await executeQuery<SubscriptionRow & { CREATED_AT: Date }>(
    `SELECT tier, status, current_period_end, cancel_at_period_end, created_at
     FROM subscriptions
     WHERE user_id = :userId
     ORDER BY created_at DESC
     FETCH FIRST 1 ROW ONLY`,
    { userId }
  );

  if (subs.length === 0) {
    return createResponse(200, {
      hasSubscription: false,
      tier: 'MEMBER_FREE',
    });
  }

  const sub = subs[0];

  return createResponse(200, {
    hasSubscription: sub.STATUS === 'ACTIVE',
    tier: sub.TIER,
    status: sub.STATUS,
    currentPeriodEnd: sub.CURRENT_PERIOD_END,
    cancelAtPeriodEnd: sub.CANCEL_AT_PERIOD_END === 1,
    memberSince: sub.CREATED_AT,
  });
}

/**
 * Get membership benefits summary
 */
async function handleGetBenefits(
  user: { id: string; role: string }
): Promise<ReturnType<typeof createResponse>> {
  const isGold = isGoldMember({ ...user, name: '', email: '' });

  const benefits = {
    free: [
      { title: 'メール会員限定情報', description: 'コンサート情報を優先的にお届け' },
      { title: '先行予約', description: '一般発売より1週間早くチケット購入可能' },
      { title: '会員限定動画', description: 'リハーサル映像などを視聴可能' },
      { title: '会報誌', description: '季刊会報誌をPDFでお届け' },
    ],
    gold: [
      { title: 'チケット10%OFF', description: '主催公演のチケットが割引価格で購入可能' },
      { title: '年1回無料招待', description: '主催公演に年1回無料でご招待' },
      { title: 'リハーサル見学', description: '年1回リハーサルにご招待' },
      { title: '限定コンテンツ', description: 'インタビュー、バックステージ写真など' },
      { title: 'サイン入りグッズ', description: '限定グッズを優先購入' },
      { title: 'ファンミーティング', description: '年1回の会員限定交流会にご招待' },
    ],
    current: isGold ? 'MEMBER_GOLD' : isMember({ ...user, name: '', email: '' }) ? 'MEMBER_FREE' : 'NONE',
    upgradeUrl: isGold ? null : '/supporters',
    price: {
      gold: {
        amount: 3000,
        currency: 'JPY',
        interval: 'year',
      },
    },
  };

  return createResponse(200, benefits);
}

module.exports = { handler };
