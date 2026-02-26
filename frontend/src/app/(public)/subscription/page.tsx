'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crown, Check, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { api, getToken, getGoogleSignInUrl, type components } from '@/lib/api';

type UserType = components['schemas']['User'];
type SubscriptionType = components['schemas']['Subscription'];

const goldBenefits = [
  'メール会員の全特典',
  '主催公演チケット10%OFF',
  '年1回の主催公演無料招待',
  '年1回のリハーサル見学',
  '限定コンテンツ（インタビュー、写真等）',
  'サイン入りグッズの優先購入',
  '会員限定交流会への参加',
];

const ROLE_LABELS: Record<UserType['role'], string> = {
  USER: '無料会員',
  MEMBER_FREE: 'メール会員',
  MEMBER_GOLD: 'ゴールド会員',
  ADMIN: '管理者',
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api.GET('/auth/me').then(({ data }) => {
      if (data) {
        setUser(data.user);
        setSubscription(data.subscription);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCheckout = useCallback(async () => {
    setCheckoutLoading(true);
    try {
      const { data } = await api.POST('/stripe/checkout');
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setCheckoutLoading(false);
    }
  }, []);

  const handlePortal = useCallback(async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.GET('/stripe/portal');
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-taupe" size={32} />
      </div>
    );
  }

  const isGoldMember = user?.role === 'MEMBER_GOLD';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="pt-20">
      <section className="section-padding">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-center mb-4">SUBSCRIPTION</h1>
            <p className="text-taupe text-center mb-12">会員プランの管理</p>

            {!user ? (
              <div className="card p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-burgundy-light flex items-center justify-center mx-auto mb-6">
                  <Shield size={28} className="text-taupe" />
                </div>
                <h2 className="text-xl mb-3">ログインが必要です</h2>
                <p className="text-taupe text-sm mb-8 leading-relaxed">
                  会員プランの確認・変更にはログインが必要です。
                  <br />
                  Googleアカウントで簡単にログインできます。
                </p>
                <a
                  href={getGoogleSignInUrl()}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  ログインして続ける
                  <ArrowRight size={16} />
                </a>
              </div>
            ) : isGoldMember || isAdmin ? (
              <div className="space-y-6">
                <div className="card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-burgundy-accent/20 flex items-center justify-center">
                      <Crown size={24} className="text-burgundy-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg">{user.name || 'ゲスト'}</h2>
                      <p className="text-taupe text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="bg-burgundy rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-taupe text-sm">現在のプラン</span>
                      <span className="inline-flex items-center gap-1.5 bg-burgundy-accent/20 text-burgundy-accent text-sm px-3 py-1 rounded-full">
                        <Crown size={14} />
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    {subscription?.currentPeriodEnd && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-taupe text-sm">次回更新日</span>
                        <span className="text-beige text-sm">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    )}
                    {subscription?.cancelAtPeriodEnd && (
                      <p className="text-sm text-yellow-400 mt-3">
                        期間終了後に解約予定です
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-taupe text-sm">ステータス</span>
                      <span className="text-emerald-400 text-sm">有効</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePortal}
                    disabled={portalLoading}
                    className="btn btn-outline w-full justify-center"
                  >
                    {portalLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'サブスクリプションを管理する'
                    )}
                  </button>
                </div>

                <div className="card p-6">
                  <h3 className="text-sm text-taupe mb-4">ご利用中の特典</h3>
                  <ul className="space-y-3">
                    {goldBenefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <Check size={16} className="text-burgundy-accent flex-shrink-0 mt-0.5" />
                        <span className="text-beige text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="card p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Shield size={24} className="text-taupe" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg">{user.name || 'ゲスト'}</h2>
                      <p className="text-taupe text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="bg-burgundy rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-taupe text-sm">現在のプラン</span>
                      <span className="inline-flex items-center gap-1.5 bg-white/10 text-taupe text-sm px-3 py-1 rounded-full">
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card p-8 border-burgundy-accent relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-burgundy-accent text-white text-xs px-4 py-1 rounded-full flex items-center gap-1">
                    <Crown size={12} />
                    おすすめ
                  </div>

                  <div className="text-center mb-8">
                    <h3 className="text-xl mb-2">ゴールド会員にアップグレード</h3>
                    <p className="text-3xl text-white mt-4">¥3,000<span className="text-taupe text-base ml-1">/年</span></p>
                    <p className="text-taupe text-xs mt-1">入会金なし・いつでも解約可能</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {goldBenefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <Check size={16} className="text-burgundy-accent flex-shrink-0 mt-0.5" />
                        <span className="text-beige text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="btn btn-primary w-full justify-center text-base py-3"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        ゴールド会員になる
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-taupe text-xs">
                    <Shield size={14} />
                    <span>Stripeによる安全な決済</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/supporters/" className="text-taupe text-sm hover:text-white transition-colors underline underline-offset-4">
                    会員特典の詳細を見る
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
