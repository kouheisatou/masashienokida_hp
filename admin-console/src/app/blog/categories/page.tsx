'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type Category = components['schemas']['AdminBlogCategory'];

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function fetchCategories() {
    const { data } = await api.GET('/admin/blog/categories');
    if (data) setCategories(data as Category[]);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setCreating(true);
    setError('');
    try {
      const { data, error: err } = await api.POST('/admin/blog/categories', {
        body: { name: name.trim(), slug: slug.trim(), sort_order: sortOrder },
      });
      if (err) {
        setError('このカテゴリ名またはスラッグは既に使用されています');
      } else if (data) {
        setName('');
        setSlug('');
        setSortOrder(0);
        await fetchCategories();
      }
    } catch {
      setError('エラーが発生しました');
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('このカテゴリを削除しますか？')) return;
    const { error: err } = await api.DELETE('/admin/blog/categories/{id}', {
      params: { path: { id } },
    });
    if (err) {
      alert('このカテゴリに紐づく記事があるため削除できません。');
    } else {
      await fetchCategories();
    }
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ブログカテゴリ管理</h1>

          {/* Add form */}
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm p-5 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">新しいカテゴリを追加</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">カテゴリ名</label>
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="例: お知らせ"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">スラッグ</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="例: news"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">表示順</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                  <button
                    type="submit"
                    disabled={creating || !name.trim() || !slug.trim()}
                    className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {creating ? '追加中...' : '追加'}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>

          {/* Category list */}
          {loading ? (
            <p className="text-gray-500 text-sm">読み込み中...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-5 py-3">カテゴリ名</th>
                    <th className="text-left px-5 py-3">スラッグ</th>
                    <th className="text-center px-5 py-3">表示順</th>
                    <th className="text-center px-5 py-3">記事数</th>
                    <th className="text-right px-5 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-5 py-3 text-gray-500">{cat.slug}</td>
                      <td className="px-5 py-3 text-center text-gray-500">{cat.sort_order}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {cat.post_count}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={cat.post_count > 0}
                          className="text-red-500 hover:text-red-700 text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={cat.post_count > 0 ? '記事が紐づいているため削除できません' : '削除'}
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                        カテゴリがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
