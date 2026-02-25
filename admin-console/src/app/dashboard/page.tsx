'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type AdminStats = components['schemas']['AdminStats']['stats'];
type Contact = components['schemas']['AdminContact'];
type Member = components['schemas']['AdminMember'];

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.GET('/admin/stats')
      .then(({ data }) => {
        if (!data) return;
        setStats(data.stats);
        setRecentContacts(data.recentContacts as Contact[]);
        setRecentMembers(data.recentMembers as Member[]);
      })
      .catch(() => setError('データの読み込みに失敗しました'));
  }, []);

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: '総会員数', value: stats?.totalMembers ?? '—' },
              { label: 'ゴールド会員', value: stats?.goldMembers ?? '—' },
              { label: 'フリー会員', value: stats?.freeMembers ?? '—' },
              { label: '未読問い合わせ', value: stats?.unreadContacts ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent contacts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">最近のお問い合わせ</h2>
              {recentContacts.length === 0 ? (
                <p className="text-sm text-gray-400">なし</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentContacts.map((c) => (
                    <li key={c.id} className="py-3">
                      <p className="text-sm font-medium text-gray-900">{c.subject}</p>
                      <p className="text-xs text-gray-500">{c.name} · {new Date(c.created_at).toLocaleDateString('ja-JP')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">最近の会員登録</h2>
              {recentMembers.length === 0 ? (
                <p className="text-sm text-gray-400">なし</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentMembers.map((m) => (
                    <li key={m.id} className="py-3 flex items-center gap-3">
                      {m.image ? (
                        <img src={m.image} alt={m.name ?? ''} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          {(m.name ?? m.email)[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.name ?? m.email}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
