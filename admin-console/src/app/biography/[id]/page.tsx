'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import { api, type components } from '@/lib/api';

type BiographyEntry = components['schemas']['AdminBiographyEntry'];

export default function BiographyEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Partial<BiographyEntry & { year_str: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.GET('/admin/biography/{id}', { params: { path: { id } } }).then(({ data }) => {
      if (data) {
        setForm({ ...data, year_str: String(data.year) });
        setLoading(false);
      }
    });
  }, [id]);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { error: apiError } = await api.PUT('/biography/{id}', {
        params: { path: { id } },
        body: {
          year: form.year_str ?? '',
          description: form.description ?? '',
        },
      });
      if (apiError) throw new Error('保存に失敗しました');
      router.push('/biography');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">経歴 編集</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年 *</label>
              <input required type="number" value={form.year_str ?? ''} onChange={(e) => set('year_str', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 max-w-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明 *</label>
              <textarea required rows={5} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-gray-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => router.push('/biography')}
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
