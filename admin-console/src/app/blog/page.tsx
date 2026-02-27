'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type BlogPostSummary = components['schemas']['AdminBlogPostSummary'];

export default function BlogListPage() {
  const [items, setItems] = useState<BlogPostSummary[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p = 1, s = '') {
    setLoading(true);
    try {
      const { data } = await api.GET('/admin/blog', { params: { query: { page: p, search: s } } });
      if (data) {
        setItems(data.posts);
        setTotalPages(data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, ''); }, []);

  async function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return;
    await api.DELETE('/admin/blog/{id}', { params: { path: { id } } });
    load(page, search);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1, search);
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">ブログ</h1>
            <Link href="/blog/new" className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] inline-flex items-center justify-center touch-manipulation w-fit">
              + 新規作成
            </Link>
          </div>

          <form onSubmit={handleSearch} className="mb-4 flex flex-col sm:flex-row gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="タイトル・カテゴリで検索"
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[44px]" />
            <button type="submit" className="bg-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors min-h-[44px] touch-manipulation">検索</button>
          </form>

          {loading ? <p className="text-gray-500 text-sm">読み込み中...</p> : items.length === 0 ? (
            <p className="text-gray-400 text-sm">記事がありません</p>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">タイトル</th>
                      <th className="px-6 py-3 text-left">カテゴリ</th>
                      <th className="px-6 py-3 text-left">公開</th>
                      <th className="px-6 py-3 text-left">会員限定</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{b.title}</td>
                        <td className="px-6 py-4 text-gray-500">{b.category ?? '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {b.is_published ? '公開' : '非公開'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.members_only && <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">会員限定</span>}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right flex gap-2 sm:gap-3 justify-end">
                          <Link href={`/blog/${b.id}`} className="text-blue-600 hover:underline">編集</Link>
                          <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline">削除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex gap-2 mt-4 justify-end">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => { setPage(p); load(p, search); }}
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
