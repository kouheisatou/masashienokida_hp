'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type Contact = components['schemas']['AdminContact'];

const STATUS_LABELS: Record<string, string> = {
  unread: '未読',
  read: '既読',
  replied: '返信済',
  archived: 'アーカイブ',
};

const STATUS_COLORS: Record<string, string> = {
  unread: 'bg-red-100 text-red-700',
  read: 'bg-blue-100 text-blue-700',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load(p = 1, s = '', st = 'all') {
    setLoading(true);
    try {
      const { data } = await api.GET('/admin/contacts', { params: { query: { page: p, search: s || undefined, status: (st !== 'all' ? st : undefined) as 'unread' | 'read' | 'replied' | 'archived' | undefined } } });
      if (data) {
        setContacts(data.contacts);
        setTotalPages(data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, '', 'all'); }, []);

  async function handleSelect(c: Contact) {
    setSelected(c);
    if (c.status === 'unread') {
      await api.PUT('/admin/contacts/{id}', { params: { path: { id: c.id } }, body: { status: 'read' } });
      setContacts((prev) => prev.map((x) => x.id === c.id ? { ...x, status: 'read' } : x));
      setSelected({ ...c, status: 'read' });
    }
  }

  async function handleStatusChange(id: string, status: Contact['status']) {
    await api.PUT('/admin/contacts/{id}', { params: { path: { id } }, body: { status } });
    setContacts((prev) => prev.map((x) => x.id === id ? { ...x, status } : x));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1, search, statusFilter);
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">お問い合わせ</h1>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="名前・メール・件名で検索"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px]" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); load(1, search, e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px] w-full sm:w-auto">
              <option value="all">すべて</option>
              <option value="unread">未読</option>
              <option value="read">既読</option>
              <option value="replied">返信済</option>
              <option value="archived">アーカイブ</option>
            </select>
            <button type="submit" className="bg-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors min-h-[44px] touch-manipulation">検索</button>
          </form>

          <div className="flex flex-col lg:flex-row gap-4 min-h-[400px] lg:h-[calc(100vh-220px)]">
            {/* List */}
            <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-y-auto min-h-[200px] lg:min-h-0">
              {loading ? (
                <p className="text-gray-500 text-sm p-4">読み込み中...</p>
              ) : contacts.length === 0 ? (
                <p className="text-gray-400 text-sm p-4">お問い合わせがありません</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {contacts.map((c) => (
                    <li key={c.id}
                      onClick={() => handleSelect(c)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation min-h-[60px] ${selected?.id === c.id ? 'bg-gray-50 border-l-2 border-gray-900' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${c.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>{c.subject}</p>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_COLORS[c.status]}`}>
                          {STATUS_LABELS[c.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{c.name} · {new Date(c.created_at).toLocaleDateString('ja-JP')}</p>
                    </li>
                  ))}
                </ul>
              )}
              {totalPages > 1 && (
                <div className="flex gap-1 p-3 border-t border-gray-100">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => { setPage(p); load(p, search, statusFilter); }}
                      className={`px-2 py-1 rounded text-xs ${p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detail */}
            <div className="flex-1 bg-white rounded-xl shadow-sm overflow-y-auto">
              {!selected ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  お問い合わせを選択してください
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">{selected.subject}</h2>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {(['unread', 'read', 'replied', 'archived'] as const).map((s) => (
                        <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${selected.status === s ? STATUS_COLORS[s] : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
                    <div>
                      <dt className="text-gray-500">名前</dt>
                      <dd className="font-medium text-gray-900">{selected.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">メール</dt>
                      <dd className="font-medium text-gray-900">
                        <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a>
                      </dd>
                    </div>
                    {selected.phone && (
                      <div>
                        <dt className="text-gray-500">電話</dt>
                        <dd className="font-medium text-gray-900">{selected.phone}</dd>
                      </div>
                    )}
                    {selected.category && (
                      <div>
                        <dt className="text-gray-500">カテゴリ</dt>
                        <dd className="font-medium text-gray-900">{selected.category}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-gray-500">受信日時</dt>
                      <dd className="font-medium text-gray-900">{new Date(selected.created_at).toLocaleString('ja-JP')}</dd>
                    </div>
                  </dl>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
                  </div>
                  <div className="mt-4">
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      className="bg-gray-900 text-white text-sm px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block min-h-[44px] flex items-center justify-center touch-manipulation">
                      返信する
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
