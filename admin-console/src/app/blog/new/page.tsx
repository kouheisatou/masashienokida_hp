'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import MarkdownEditor from '@/components/MarkdownEditor';
import { api } from '@/lib/api';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type PublishMode = 'now' | 'scheduled';

const CATEGORY_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 'news', label: 'お知らせ' },
  { value: 'concert', label: 'コンサート' },
  { value: 'daily', label: '日常' },
  { value: 'practice', label: '練習・レッスン' },
  { value: 'travel', label: '旅' },
];

export default function BlogNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    thumbnail_url: '',
    category: '',
    members_only: false,
    is_published: false,
    published_at: '',
  });
  const [publishMode, setPublishMode] = useState<PublishMode>('now');

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestForm = useRef(form);
  latestForm.current = form;

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const saveDraft = useCallback(
    async (id: string | null, data: typeof form): Promise<string | null> => {
      setSaveStatus('saving');
      try {
        if (!id) {
          const { data: created } = await api.POST('/admin/blog', {
            body: {
              title: data.title || '（タイトルなし）',
              content: data.content,
              excerpt: data.excerpt || null,
              thumbnail_url: data.thumbnail_url || null,
              category: data.category || null,
              members_only: data.members_only,
              is_published: false,
              published_at: null,
            },
          });
          if (created) {
            setSaveStatus('saved');
            return created.id;
          }
        } else {
          await api.PUT('/admin/blog/{id}', {
            params: { path: { id } },
            body: {
              title: data.title || '（タイトルなし）',
              content: data.content,
              excerpt: data.excerpt || null,
              thumbnail_url: data.thumbnail_url || null,
              category: data.category || null,
              members_only: data.members_only,
              is_published: false,
              published_at: null,
            },
          });
          setSaveStatus('saved');
          return id;
        }
      } catch {
        setSaveStatus('error');
      }
      return id;
    },
    []
  );

  useEffect(() => {
    if (!form.title && !form.content) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    autoSaveTimer.current = setTimeout(async () => {
      const newId = await saveDraft(draftId, latestForm.current);
      if (newId && !draftId) setDraftId(newId);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, form.content, form.excerpt, form.category, form.members_only]);

  async function handlePublish() {
    if (publishMode === 'scheduled' && !form.published_at) return;
    setPublishing(true);
    try {
      let id = draftId;
      if (!id) {
        id = await saveDraft(null, form);
        if (id) setDraftId(id);
      }
      if (!id) return;

      const publishedAt = publishMode === 'now'
        ? new Date().toISOString()
        : new Date(form.published_at).toISOString();

      await api.PUT('/admin/blog/{id}', {
        params: { path: { id } },
        body: {
          title: form.title || '（タイトルなし）',
          content: form.content,
          excerpt: form.excerpt || null,
          thumbnail_url: form.thumbnail_url || null,
          category: form.category || null,
          members_only: form.members_only,
          is_published: true,
          published_at: publishedAt,
        },
      });
      router.push('/blog');
    } finally {
      setPublishing(false);
    }
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    saving: '保存中...',
    saved: '下書き保存済み',
    error: '保存失敗',
  };
  const statusColor: Record<SaveStatus, string> = {
    idle: 'text-gray-400',
    saving: 'text-gray-400',
    saved: 'text-green-600',
    error: 'text-red-500',
  };

  const isScheduledFuture = publishMode === 'scheduled' && form.published_at && new Date(form.published_at) > new Date();

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">ブログ 新規作成</h1>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${statusColor[saveStatus]}`}>
                {statusLabel[saveStatus]}
              </span>
              <button
                type="button"
                onClick={() => router.push('/blog')}
                className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing || (publishMode === 'scheduled' && !form.published_at)}
                className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {publishing ? '公開中...' : isScheduledFuture ? '予約公開する' : '公開する'}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* タイトル */}
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="タイトルを入力..."
              className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:outline-none focus:border-gray-400 bg-transparent placeholder-gray-300"
            />

            {/* マークダウンエディタ */}
            <MarkdownEditor
              value={form.content}
              onChange={(val) => set('content', val)}
            />

            {/* メタデータ */}
            <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">抜粋</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => set('excerpt', e.target.value)}
                  placeholder="省略時は本文の先頭から自動生成"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">サムネイルURL</label>
                <input
                  value={form.thumbnail_url}
                  onChange={(e) => set('thumbnail_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">カテゴリ</label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">公開タイミング</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="publishMode"
                      checked={publishMode === 'now'}
                      onChange={() => { setPublishMode('now'); set('published_at', ''); }}
                      className="accent-gray-900"
                    />
                    <span className="text-sm text-gray-700">今すぐ</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="publishMode"
                      checked={publishMode === 'scheduled'}
                      onChange={() => setPublishMode('scheduled')}
                      className="accent-gray-900"
                    />
                    <span className="text-sm text-gray-700">日時指定</span>
                  </label>
                </div>
                {publishMode === 'scheduled' && (
                  <input
                    type="datetime-local"
                    value={form.published_at}
                    onChange={(e) => set('published_at', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                )}
              </div>
              <div className="col-span-2 flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.members_only}
                    onChange={(e) => set('members_only', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">会員限定</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </AuthGuard>
  );
}
