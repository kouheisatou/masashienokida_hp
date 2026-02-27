'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { api, type components } from '@/lib/api';

type Concert = components['schemas']['AdminConcert'];

export default function ConcertEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Partial<Concert & { program_text: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.GET('/admin/concerts/{id}', { params: { path: { id } } }).then(({ data: item }) => {
      if (!item) return;
      setForm({ ...item, program_text: (item.program ?? []).join('\n') });
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
      const { error: apiErr } = await api.PUT('/concerts/{id}', {
        params: { path: { id } },
        body: {
          title: form.title!,
          date: form.date!,
          time: (form.time as string) || null,
          venue: form.venue!,
          address: (form.address as string) || null,
          image_url: (form.image_url as string) || null,
          program: form.program_text
            ? (form.program_text as string).split('\n').map((s: string) => s.trim()).filter(Boolean)
            : [],
          price: (form.price as string) || null,
          ticket_url: (form.ticket_url as string) || null,
          note: (form.note as string) || null,
          is_upcoming: form.is_upcoming ?? false,
          is_published: form.is_published ?? false,
        },
      });
      if (apiErr) throw new Error('保存に失敗しました');
      router.push('/concerts');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">コンサート 編集</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input required value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付 *</label>
                <input required type="date" value={form.date ?? ''} onChange={(e) => set('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                <input value={form.time ?? ''} onChange={(e) => set('time', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会場 *</label>
              <input required value={form.venue ?? ''} onChange={(e) => set('venue', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
              <input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">プログラム (1行1曲)</label>
              <textarea rows={4} value={form.program_text ?? ''} onChange={(e) => set('program_text', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金</label>
                <input value={form.price ?? ''} onChange={(e) => set('price', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">チケットURL</label>
                <input value={form.ticket_url ?? ''} onChange={(e) => set('ticket_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <textarea rows={3} value={form.note ?? ''} onChange={(e) => set('note', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <ImageUploader
              value={(form.image_url as string) ?? null}
              onChange={(url) => set('image_url', url ?? '')}
            />
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_upcoming" checked={form.is_upcoming ?? false} onChange={(e) => set('is_upcoming', e.target.checked)} className="rounded" />
                <label htmlFor="is_upcoming" className="text-sm text-gray-700">直近のコンサート</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={form.is_published ?? false} onChange={(e) => set('is_published', e.target.checked)} className="rounded" />
                <label htmlFor="is_published" className="text-sm text-gray-700">公開する</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-gray-900 text-white text-sm px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={() => router.push('/concerts')}
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
