'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import ImageUploader from '@/components/ImageUploader';
import { api } from '@/lib/api';

export default function ConcertNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', date: '', time: '', venue: '', address: '',
    image_url: '', program: '', price: '', ticket_url: '', note: '',
    is_upcoming: false, is_published: false,
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
      const { error: apiErr } = await api.POST('/concerts', {
        body: {
          title: form.title,
          date: form.date,
          time: form.time || null,
          venue: form.venue,
          address: form.address || null,
          image_url: form.image_url || null,
          program: form.program ? form.program.split('\n').map((s: string) => s.trim()).filter(Boolean) : [],
          price: form.price || null,
          ticket_url: form.ticket_url || null,
          note: form.note || null,
          is_upcoming: form.is_upcoming,
          is_published: form.is_published,
        },
      });
      if (apiErr) throw new Error('保存に失敗しました');
      router.push('/concerts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">コンサート 新規作成</h1>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
              <input required value={form.title} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付 *</label>
                <input required type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
                <input value={form.time} onChange={(e) => set('time', e.target.value)} placeholder="例: 19:00開演"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会場 *</label>
              <input required value={form.venue} onChange={(e) => set('venue', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
              <input value={form.address} onChange={(e) => set('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">プログラム (1行1曲)</label>
              <textarea rows={4} value={form.program} onChange={(e) => set('program', e.target.value)}
                placeholder="ベートーヴェン: ピアノソナタ第14番&#10;ショパン: バラード第1番"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">料金</label>
                <input value={form.price} onChange={(e) => set('price', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">チケットURL</label>
                <input value={form.ticket_url} onChange={(e) => set('ticket_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <textarea rows={3} value={form.note} onChange={(e) => set('note', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y" />
            </div>
            <ImageUploader
              value={form.image_url || null}
              onChange={(url) => set('image_url', url ?? '')}
            />
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_upcoming" checked={form.is_upcoming} onChange={(e) => set('is_upcoming', e.target.checked)} className="rounded" />
                <label htmlFor="is_upcoming" className="text-sm text-gray-700">直近のコンサート</label>
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
