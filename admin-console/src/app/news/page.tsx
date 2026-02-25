'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type NewsItem = components['schemas']['AdminNewsItem'];

export default function NewsListPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.GET('/admin/news').then(({ data }) => { if (data) setItems(data); }).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return;
    await api.DELETE('/news/{id}', { params: { path: { id } } });
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">ニュース</h1>
            <Link href="/news/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              + 新規作成
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">読み込み中...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-sm">ニュースがありません</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">タイトル</th>
                    <th className="px-6 py-3 text-left">カテゴリ</th>
                    <th className="px-6 py-3 text-left">公開日</th>
                    <th className="px-6 py-3 text-left">公開</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{n.title}</td>
                      <td className="px-6 py-4 text-gray-500">{n.category ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {n.published_at ? new Date(n.published_at).toLocaleDateString('ja-JP') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${n.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {n.is_published ? '公開' : '非公開'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex gap-3 justify-end">
                        <Link href={`/news/${n.id}`} className="text-blue-600 hover:underline">編集</Link>
                        <button onClick={() => handleDelete(n.id)} className="text-red-500 hover:underline">削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
