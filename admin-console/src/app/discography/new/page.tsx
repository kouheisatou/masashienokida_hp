'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { api } from '@/lib/api';

export default function DiscographyNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', release_year: '', description: '', image_url: '', purchase_url: '', sort_order: '0', is_published: false });
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
      const { error: apiError } = await api.POST('/discography', {
        body: {
          title: form.title,
          release_year: Number(form.release_year),
          description: form.description || null,
          image_url: form.image_url || null,
          purchase_url: form.purchase_url || null,
          sort_order: Number(form.sort_order),
          is_published: form.is_published,
        },
      });
      if (apiError) throw new Error('保存に失敗しました');
      router.push('/discography');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">ディスコグラフィー 新規作成</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input required value={form.title} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">リリース年 *</label>
                <input required type="number" value={form.release_year} onChange={(e) => set('release_year', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">購入URL</label>
              <input type="url" value={form.purchase_url} onChange={(e) => set('purchase_url', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <ImageUploader
              value={form.image_url || null}
              onChange={(url) => set('image_url', url ?? '')}
            />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="rounded" />
              <label htmlFor="is_published" className="text-sm text-gray-700">公開する</label>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-gray-900 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors min-h-[44px] touch-manipulation">
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => router.push('/discography')}
                className="text-sm text-gray-500 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] touch-manipulation">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
