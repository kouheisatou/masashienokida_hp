'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type BiographyEntry = components['schemas']['AdminBiographyEntry'];

export default function BiographyListPage() {
  const [items, setItems] = useState<BiographyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.GET('/admin/biography').then(({ data }) => { if (data) setItems(data); }).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return;
    await api.DELETE('/biography/{id}', { params: { path: { id } } });
    setItems((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">経歴</h1>
            <Link href="/biography/new" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              + 新規作成
            </Link>
          </div>
          {loading ? <p className="text-gray-500 text-sm">読み込み中...</p> : items.length === 0 ? (
            <p className="text-gray-400 text-sm">経歴がありません</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">年</th>
                    <th className="px-6 py-3 text-left">説明</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{b.year}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-md truncate">{b.description}</td>
                      <td className="px-6 py-4 text-right flex gap-3 justify-end">
                        <Link href={`/biography/${b.id}`} className="text-blue-600 hover:underline">編集</Link>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:underline">削除</button>
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
