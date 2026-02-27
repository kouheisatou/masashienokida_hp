'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { api, type components } from '@/lib/api';

type DiscographyItem = components['schemas']['AdminDiscographyItem'];

export default function DiscographyEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Partial<DiscographyItem & { release_year_str: string; sort_order_str: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.GET('/admin/discography/{id}', { params: { path: { id } } }).then(({ data }) => {
      if (data) {
        setForm({ ...data, release_year_str: String(data.release_year), sort_order_str: String(data.sort_order) });
        setLoading(false);
      }
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
      const { error: apiError } = await api.PUT('/discography/{id}', {
        params: { path: { id } },
        body: {
          title: form.title!,
          release_year: Number(form.release_year_str),
          description: (form.description as string) || null,
          image_url: (form.image_url as string) || null,
          sort_order: Number(form.sort_order_str),
          is_published: form.is_published ?? false,
        },
      });
      if (apiError) throw new Error('保存に失敗しました');
      router.push('/discography');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">ディスコグラフィー 編集</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">リリース年 *</label>
                <input required type="number" value={form.release_year_str ?? ''} onChange={(e) => set('release_year_str', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                <input type="number" value={form.sort_order_str ?? '0'} onChange={(e) => set('sort_order_str', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea rows={4} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <ImageUploader
              value={(form.image_url as string) ?? null}
              onChange={(url) => set('image_url', url ?? '')}
            />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_published" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)} className="rounded" />
              <label htmlFor="is_published" className="text-sm text-gray-700">公開する</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-gray-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => router.push('/discography')}
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
