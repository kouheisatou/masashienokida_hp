'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api } from '@/lib/api';

export default function BlogNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', thumbnail_url: '', category: '',
    members_only: false, is_published: false, published_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { error: apiError } = await api.POST('/admin/blog', {
        body: {
          title: form.title,
          content: form.content,
          excerpt: form.excerpt || null,
          thumbnail_url: form.thumbnail_url || null,
          category: form.category || null,
          members_only: form.members_only,
          is_published: form.is_published,
          published_at: form.published_at || null,
        },
      });
      if (apiError) throw new Error('保存に失敗しました');
      router.push('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8 max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ブログ 新規作成</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input required value={form.title} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">本文 *</label>
              <textarea required rows={12} value={form.content} onChange={(e) => set('content', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">抜粋</label>
              <textarea rows={3} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <input value={form.category} onChange={(e) => set('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公開日時</label>
                <input type="datetime-local" value={form.published_at} onChange={(e) => set('published_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">サムネイルURL</label>
              <input value={form.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="members_only" checked={form.members_only} onChange={(e) => set('members_only', e.target.checked)} className="rounded" />
                <label htmlFor="members_only" className="text-sm text-gray-700">会員限定</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="rounded" />
                <label htmlFor="is_published" className="text-sm text-gray-700">公開する</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-gray-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => router.push('/blog')}
                className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
