'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type NewsItem = components['schemas']['AdminNewsItem'];

export default function NewsEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Partial<NewsItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.GET('/admin/news/{id}', { params: { path: { id } } }).then(({ data: item }) => {
      if (!item) return;
      setForm({
        ...item,
        published_at: item.published_at
          ? new Date(item.published_at).toISOString().slice(0, 16)
          : '',
      });
      setLoading(false);
    });
  }, [id]);

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { error: apiErr } = await api.PUT('/news/{id}', {
        params: { path: { id } },
        body: {
          title: form.title!,
          body: form.body!,
          image_url: (form.image_url as string) || null,
          category: (form.category as string) || null,
          published_at: (form.published_at as string) || undefined,
          is_published: form.is_published ?? false,
        },
      });
      if (apiErr) throw new Error('保存に失敗しました');
      router.push('/news');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
      setSaving(false);
    }
  }

  if (loading) return (
    <AuthGuard><AdminShell>
      <div className="p-8"><p className="text-gray-500 text-sm">読み込み中...</p></div>
    </AdminShell></AuthGuard>
  );

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ニュース 編集</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">本文 *</label>
              <textarea required rows={8} value={form.body ?? ''} onChange={(e) => set('body', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">画像URL</label>
              <input value={form.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <input value={form.category ?? ''} onChange={(e) => set('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">公開日時</label>
                <input type="datetime-local" value={form.published_at as string ?? ''} onChange={(e) => set('published_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_published" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)}
                className="rounded" />
              <label htmlFor="is_published" className="text-sm text-gray-700">公開する</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-gray-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => router.push('/news')}
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
