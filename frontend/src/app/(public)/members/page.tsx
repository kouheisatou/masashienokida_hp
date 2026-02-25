'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, CreditCard, Video, FileText, Settings, LogOut, Star, Crown } from 'lucide-react';
import {
  type User as UserType,
  type Subscription,
  getMe,
  signOut,
  getGoogleSignInUrl,
  createCheckoutSession,
  createPortalSession,
} from '@/lib/api-client';

export default function MembersDashboardPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMe();
      if (!data) {
        window.location.href = getGoogleSignInUrl();
        return;
      }
      setUser(data.user);
      setSubscription(data.subscription);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleUpgrade = async () => {
    try {
      const { url } = await createCheckoutSession();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await createPortalSession();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="btn btn-outline">
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  const isGoldMember = user?.role === 'MEMBER_GOLD';
  const isFreeMember = user?.role === 'MEMBER_FREE';

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="section-padding pb-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center mb-4">MEMBERS</h1>
            <p className="text-taupe text-center">マイページ</p>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="section-padding pt-0">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* User Info Card */}
            <div className="card p-8 mb-8">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-burgundy flex items-center justify-center flex-shrink-0">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || ''}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-taupe" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl">{user?.name || 'ゲスト'}</h2>
                    {isGoldMember && (
                      <span className="flex items-center gap-1 bg-burgundy-accent/20 text-burgundy-accent text-xs px-2 py-1 rounded">
                        <Crown size={12} />
                        ゴールド会員
                      </span>
                    )}
                    {isFreeMember && (
                      <span className="flex items-center gap-1 bg-burgundy-light text-taupe text-xs px-2 py-1 rounded">
                        <Star size={12} />
                        メール会員
                      </span>
                    )}
                  </div>
                  <p className="text-taupe text-sm">{user?.email}</p>

                  {subscription?.hasSubscription && (
                    <div className="mt-4 text-sm">
                      <p className="text-taupe">
                        次回更新日:{' '}
                        <span className="text-beige">
                          {subscription.currentPeriodEnd
                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')
                            : '-'}
                        </span>
                      </p>
                      {subscription.cancelAtPeriodEnd && (
                        <p className="text-burgundy-accent mt-1">
                          ※ 次回更新時に解約されます
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="/members/profile/"
                    className="text-taupe hover:text-beige transition-colors text-sm flex items-center gap-2"
                  >
                    <Settings size={14} />
                    設定
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-taupe hover:text-beige transition-colors text-sm flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    ログアウト
                  </button>
                </div>
              </div>
            </div>

            {/* Upgrade Banner (for free members) */}
            {isFreeMember && (
              <div className="card p-8 mb-8 border-burgundy-accent">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-lg mb-2">ゴールド会員にアップグレード</h3>
                    <p className="text-taupe text-sm">
                      年会費3,000円で、限定コンテンツやコンサート割引など、
                      <br className="hidden md:block" />
                      特別な特典をお楽しみいただけます。
                    </p>
                  </div>
                  <button onClick={handleUpgrade} className="btn btn-primary flex-shrink-0">
                    アップグレード
                  </button>
                </div>
              </div>
            )}

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content */}
              <Link href="/members/content/" className="card p-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
                    <Video size={20} className="text-burgundy-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg group-hover:text-burgundy-accent transition-colors">
                      限定コンテンツ
                    </h3>
                    <p className="text-taupe text-sm">動画・記事を閲覧</p>
                  </div>
                </div>
              </Link>

              {/* Blog */}
              <Link href="/blog/?category=members" className="card p-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
                    <FileText size={20} className="text-burgundy-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg group-hover:text-burgundy-accent transition-colors">
                      会員限定記事
                    </h3>
                    <p className="text-taupe text-sm">ブログを読む</p>
                  </div>
                </div>
              </Link>

              {/* Profile */}
              <Link href="/members/profile/" className="card p-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
                    <User size={20} className="text-burgundy-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg group-hover:text-burgundy-accent transition-colors">
                      プロフィール
                    </h3>
                    <p className="text-taupe text-sm">アカウント設定</p>
                  </div>
                </div>
              </Link>

              {/* Subscription */}
              <button
                onClick={isGoldMember ? handleManageSubscription : handleUpgrade}
                className="card p-6 group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center">
                    <CreditCard size={20} className="text-burgundy-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg group-hover:text-burgundy-accent transition-colors">
                      {isGoldMember ? 'サブスクリプション管理' : 'アップグレード'}
                    </h3>
                    <p className="text-taupe text-sm">
                      {isGoldMember ? '支払い・解約' : 'ゴールド会員になる'}
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-12">
              <h2 className="text-center mb-8">会員特典</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Star size={18} className="text-taupe" />
                    メール会員
                  </h3>
                  <ul className="space-y-2 text-taupe text-sm">
                    <li>・コンサート情報の優先配信</li>
                    <li>・チケット先行予約</li>
                    <li>・会員限定動画の視聴</li>
                    <li>・季刊会報誌（PDF配信）</li>
                  </ul>
                </div>

                <div className="card p-6 border-burgundy-accent">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Crown size={18} className="text-burgundy-accent" />
                    ゴールド会員
                  </h3>
                  <ul className="space-y-2 text-taupe text-sm">
                    <li>・メール会員の全特典</li>
                    <li className="text-beige">・主催公演チケット10%OFF</li>
                    <li className="text-beige">・年1回の主催公演無料招待</li>
                    <li className="text-beige">・年1回のリハーサル見学</li>
                    <li className="text-beige">・限定コンテンツ</li>
                    <li className="text-beige">・会員限定交流会への参加</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
