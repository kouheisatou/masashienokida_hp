'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Save, CheckCircle, AlertCircle } from 'lucide-react';
import {
  type User as UserType,
  type Subscription,
  getMe,
  getGoogleSignInUrl,
  updateProfile,
  createPortalSession,
  deleteAccount,
} from '@/lib/api-client';

export default function MembersProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMe();
      if (!data) {
        window.location.href = getGoogleSignInUrl();
        return;
      }
      setUser(data.user);
      setSubscription(data.subscription);
      setName(data.user.name ?? '');
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateProfile(name);
      setUser(updated);
      setSuccess('プロフィールを更新しました');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }

    setSaving(false);
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await createPortalSession();
      if (url) window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('アカウントを削除しますか？この操作は取り消せません。')) return;
    try {
      await deleteAccount();
      window.location.href = '/';
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

  const isGoldMember = user?.role === 'MEMBER_GOLD';

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="section-padding pb-8">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Link
              href="/members/"
              className="inline-flex items-center gap-2 text-taupe hover:text-beige transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              マイページに戻る
            </Link>

            <h1 className="mb-4">プロフィール設定</h1>
            <p className="text-taupe">アカウント情報の確認・変更</p>
          </div>
        </div>
      </section>

      {/* Profile Form */}
      <section className="section-padding pt-0">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 p-4 rounded mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-800 p-4 rounded mb-6 flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            )}

            {/* Profile Card */}
            <div className="card p-8 mb-8">
              <h2 className="text-lg mb-6 flex items-center gap-2">
                <User size={20} className="text-burgundy-accent" />
                基本情報
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm mb-2">
                    お名前
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-burgundy border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">メールアドレス</label>
                  <p className="text-taupe bg-burgundy border border-burgundy-border rounded px-4 py-3">
                    {user?.email}
                  </p>
                  <p className="text-taupe text-xs mt-2">
                    ※ メールアドレスはGoogleアカウントに紐づいているため変更できません
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-2">会員種別</label>
                  <p className="text-beige bg-burgundy border border-burgundy-border rounded px-4 py-3">
                    {isGoldMember ? 'ゴールド会員' : 'メール会員'}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Save size={16} />
                    {saving ? '保存中...' : '保存する'}
                  </button>
                </div>
              </form>
            </div>

            {/* Subscription Card */}
            <div className="card p-8 mb-8">
              <h2 className="text-lg mb-6">サブスクリプション</h2>

              {subscription?.hasSubscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-burgundy-border">
                    <span className="text-taupe">プラン</span>
                    <span className="text-beige">
                      {subscription.tier === 'MEMBER_GOLD' ? 'ゴールド会員' : 'メール会員'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-burgundy-border">
                    <span className="text-taupe">ステータス</span>
                    <span className={subscription.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}>
                      {subscription.status === 'ACTIVE' ? '有効' : subscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-burgundy-border">
                    <span className="text-taupe">次回更新日</span>
                    <span className="text-beige">
                      {subscription.currentPeriodEnd
                        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ja-JP')
                        : '-'}
                    </span>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <p className="text-burgundy-accent text-sm">
                      ※ 次回更新日をもって解約されます
                    </p>
                  )}
                  <div className="pt-4">
                    <button onClick={handleManageSubscription} className="btn btn-outline">
                      支払い・解約の管理
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-taupe mb-6">
                    現在、有料サブスクリプションはありません。
                    <br />
                    ゴールド会員になると、特別な特典をお楽しみいただけます。
                  </p>
                  <Link href="/supporters/" className="btn btn-primary">
                    ゴールド会員について
                  </Link>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="card p-8 border-red-900/30">
              <h2 className="text-lg mb-4 text-red-400">アカウント削除</h2>
              <p className="text-taupe text-sm mb-6">
                アカウントを削除すると、すべてのデータが完全に削除されます。
                この操作は取り消せません。
              </p>
              <button
                onClick={handleDeleteAccount}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                アカウントを削除する
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
