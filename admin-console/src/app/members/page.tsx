'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type Member = components['schemas']['AdminMember'];

const ROLE_LABELS: Record<string, string> = {
  USER: 'ユーザー',
  MEMBER_FREE: 'フリー会員',
  MEMBER_GOLD: 'ゴールド会員',
  ADMIN: '管理者',
};

const ROLE_COLORS: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-500',
  MEMBER_FREE: 'bg-blue-100 text-blue-700',
  MEMBER_GOLD: 'bg-yellow-100 text-yellow-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load(p = 1, s = '', r = 'all') {
    setLoading(true);
    try {
      const { data } = await api.GET('/admin/members', { params: { query: { page: p, search: s || undefined, role: (r !== 'all' ? r : undefined) as 'USER' | 'MEMBER_FREE' | 'MEMBER_GOLD' | 'ADMIN' | undefined } } });
      if (data) {
        setMembers(data.members);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, '', 'all'); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1, search, roleFilter);
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">会員管理</h1>
            <p className="text-sm text-gray-500">全 {total} 件</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="名前・メールで検索"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-400" />
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
              <option value="all">すべてのロール</option>
              <option value="MEMBER_GOLD">ゴールド会員</option>
              <option value="MEMBER_FREE">フリー会員</option>
              <option value="USER">ユーザー</option>
              <option value="ADMIN">管理者</option>
            </select>
            <button type="submit" className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">検索</button>
          </form>

          {loading ? (
            <p className="text-gray-500 text-sm">読み込み中...</p>
          ) : members.length === 0 ? (
            <p className="text-gray-400 text-sm">会員がいません</p>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">会員</th>
                      <th className="px-6 py-3 text-left">メール</th>
                      <th className="px-6 py-3 text-left">ロール</th>
                      <th className="px-6 py-3 text-left">サブスクリプション</th>
                      <th className="px-6 py-3 text-left">登録日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {m.image ? (
                              <img src={m.image} alt={m.name ?? ''} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                {(m.name ?? m.email)[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{m.name ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{m.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[m.role] ?? 'bg-gray-100 text-gray-500'}`}>
                            {ROLE_LABELS[m.role] ?? m.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {m.subscription_status ? (
                            <div>
                              <p>{m.tier}</p>
                              <p>{m.subscription_status}</p>
                              {m.current_period_end && (
                                <p>{new Date(m.current_period_end).toLocaleDateString('ja-JP')}まで</p>
                              )}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(m.created_at).toLocaleDateString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex gap-2 mt-4 justify-end">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => { setPage(p); load(p, search, roleFilter); }}
                      className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
