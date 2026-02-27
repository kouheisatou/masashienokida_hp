'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type Concert = components['schemas']['AdminConcert'];

export default function ConcertsListPage() {
  const [items, setItems] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.GET('/admin/concerts').then(({ data }) => { if (data) setItems(data); }).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return;
    await api.DELETE('/concerts/{id}', { params: { path: { id } } });
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">コンサート</h1>
            <Link href="/concerts/new" className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] inline-flex items-center justify-center touch-manipulation w-fit">
              + 新規作成
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">読み込み中...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-sm">コンサートがありません</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">タイトル</th>
                    <th className="px-6 py-3 text-left">日付</th>
                    <th className="px-6 py-3 text-left">会場</th>
                    <th className="px-6 py-3 text-left">公開</th>
                    <th className="px-6 py-3 text-left">直近</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(c.date).toLocaleDateString('ja-JP')}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-[160px] truncate">{c.venue}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {c.is_published ? '公開' : '非公開'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.is_upcoming && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">直近</span>}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right flex gap-2 sm:gap-3 justify-end">
                        <Link href={`/concerts/${c.id}`} className="text-blue-600 hover:underline">編集</Link>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline">削除</button>
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
