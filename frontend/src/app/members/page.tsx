'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Star, Crown, CheckCircle, AlertCircle, Trash2, Check, CreditCard, Shield, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, type components } from '@/lib/api';

type UserType = components['schemas']['User'];
type Subscription = components['schemas']['Subscription'];

export default function MembersDashboardPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    }>
      <MembersDashboardContent />
    </Suspense>
  );
}

function MembersDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowCheckoutSuccess(true);
      window.history.replaceState({}, '', '/members');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.GET('/auth/me');
      if (!data) {
        router.replace('/login?redirect=/members');
        return;
      }
      setUser(data.user);
      setSubscription(data.subscription);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSignOut = async () => {
    await api.POST('/auth/signout');
    window.location.href = '/';
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setError('');
    const { data, error: err } = await api.POST('/stripe/checkout');
    if (err || !data) {
      setError('エラーが発生しました');
      setUpgradeLoading(false);
      return;
    }
    if (data.url) window.location.href = data.url;
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError('');
    const { data, error: err } = await api.GET('/stripe/portal');
    if (err || !data?.url) {
      setError('お支払い管理ページを開けませんでした');
      setPortalLoading(false);
      return;
    }
    window.location.href = data.url;
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    const { error: err } = await api.DELETE('/auth/account');
    if (err) {
      setError('退会処理中にエラーが発生しました');
      setDeleting(false);
      return;
    }
    window.location.href = '/?withdrawn=true';
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    );
  }

  if (error && !user) {
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
            {/* Checkout Success Banner */}
            {showCheckoutSuccess && (
              <div className="bg-green-900/20 border border-green-800 p-4 rounded mb-6 flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 font-medium">ゴールド会員へのアップグレードが完了しました！</p>
                  <p className="text-green-400/70 text-sm mt-1">
                    特別な特典をお楽しみください。
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckoutSuccess(false)}
                  className="text-green-400/50 hover:text-green-300 ml-auto text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Messages */}
            {error && user && (
              <div className="bg-red-900/20 border border-red-800 p-4 rounded mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

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
                        無料会員
                      </span>
                    )}
                  </div>
                  <p className="text-taupe text-sm">{user?.email}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
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

            {/* Current Plan Card */}
            <div
              className={`card p-8 mb-8 ${
                isGoldMember ? 'border-burgundy-accent' : isFreeMember ? 'border-burgundy-light' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-burgundy-light">
                <div>
                  <p className="text-taupe text-xs tracking-widest mb-2">CURRENT PLAN</p>
                  <div className="flex items-center gap-3">
                    {isGoldMember ? (
                      <Crown size={24} className="text-burgundy-accent" />
                    ) : isFreeMember ? (
                      <Star size={24} className="text-taupe" />
                    ) : (
                      <Shield size={24} className="text-burgundy-accent" />
                    )}
                    <h3 className="text-xl">
                      {isGoldMember ? 'ゴールド会員' : isFreeMember ? '無料会員' : '管理者'}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-beige">
                    {isGoldMember ? '¥3,000' : '¥0'}
                  </p>
                  <p className="text-taupe text-xs">
                    {isGoldMember ? '年会費（税込）' : '無料'}
                  </p>
                </div>
              </div>

              {/* Subscription Status (Gold only) */}
              {isGoldMember && subscription?.hasSubscription && (
                <div className="mb-6">
                  {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd ? (
                    <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 flex items-start gap-3">
                      <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-300 font-medium text-sm">
                          解約済み —{' '}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          にダウングレードされます
                        </p>
                        <p className="text-red-400/70 text-xs mt-1">
                          期間終了まではゴールド会員の特典をご利用いただけます
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-taupe text-sm">
                      次回更新日:{' '}
                      <span className="text-beige">
                        {subscription.currentPeriodEnd
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '-'}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Benefits */}
              <div className="mb-6">
                <p className="text-taupe text-xs tracking-widest mb-3">主な特典</p>
                <ul className="space-y-2">
                  {(isGoldMember
                    ? [
                        '無料会員の全特典',
                        '主催公演チケット10%OFF',
                        '年1回の主催公演無料招待',
                        '限定コンテンツ（インタビュー、写真等）',
                      ]
                    : [
                        'コンサート情報の優先配信',
                        'チケット先行予約（一般発売より1週間前）',
                        '会員限定動画の視聴',
                        '季刊会報誌（PDF配信）',
                      ]
                  ).map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check size={16} className="text-burgundy-accent flex-shrink-0 mt-0.5" />
                      <span className="text-beige text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isFreeMember && (
                  <>
                    <button
                      onClick={handleUpgrade}
                      disabled={upgradeLoading}
                      className="btn btn-primary flex-1 justify-center disabled:opacity-50"
                    >
                      {upgradeLoading ? '処理中...' : (
                        <>
                          ゴールド会員にアップグレード
                          <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </button>
                    <Link href="/supporters/" className="btn btn-outline flex-1 justify-center">
                      プラン詳細を見る
                    </Link>
                  </>
                )}
                {isGoldMember && subscription?.hasSubscription && (
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="btn btn-outline flex-1 justify-center disabled:opacity-50"
                  >
                    <CreditCard size={16} className="mr-2" />
                    {portalLoading ? '処理中...' : 'お支払い情報を管理'}
                  </button>
                )}
              </div>
            </div>

            {/* Account Deletion */}
            <div className="card p-8 mt-12 border-red-900/30">
              <h2 className="text-lg mb-4 text-red-400">退会する</h2>
              <p className="text-taupe text-sm mb-2">
                退会すると、以下の内容が適用されます。
              </p>
              <ul className="text-taupe text-sm mb-6 space-y-1 list-disc list-inside">
                <li>アカウント情報がすべて削除されます</li>
                <li>会員特典がご利用いただけなくなります</li>
                {isGoldMember && <li>ゴールド会員のサブスクリプションが解約されます</li>}
                <li>この操作は取り消せません</li>
              </ul>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 border border-red-900/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded px-4 py-2.5 text-sm transition-colors"
                >
                  <Trash2 size={16} />
                  退会手続きへ進む
                </button>
              ) : (
                <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-6">
                  <p className="text-red-300 text-sm font-medium mb-4">
                    本当に退会しますか？この操作は取り消せません。
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white rounded px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deleting ? '処理中...' : '退会する'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="text-taupe hover:text-beige text-sm transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
