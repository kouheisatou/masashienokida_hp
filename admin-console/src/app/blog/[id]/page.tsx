'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AuthGuard from '@/components/AuthGuard';
import MarkdownEditor from '@/components/MarkdownEditor';
import { api, type components } from '@/lib/api';

type BlogPost = components['schemas']['AdminBlogPost'];
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function BlogEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<Partial<BlogPost & { published_at: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [publishing, setPublishing] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestForm = useRef(form);
  latestForm.current = form;

  useEffect(() => {
    api.GET('/admin/blog/{id}', { params: { path: { id } } }).then(({ data }) => {
      if (data) {
        setForm({
          ...data,
          published_at: data.published_at
            ? new Date(data.published_at).toISOString().slice(0, 16)
            : '',
        });
        setLoading(false);
      }
    });
  }, [id]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const saveAsDraft = useCallback(
    async (data: typeof form) => {
      setSaveStatus('saving');
      try {
        await api.PUT('/admin/blog/{id}', {
          params: { path: { id } },
          body: {
            title: (data.title as string) || '（タイトルなし）',
            content: (data.content as string) ?? null,
            excerpt: (data.excerpt as string) || null,
            thumbnail_url: (data.thumbnail_url as string) || null,
            category: (data.category as string) || null,
            members_only: data.members_only ?? false,
            is_published: data.is_published ?? false,
            published_at: (data.published_at as string) || null,
          },
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [id]
  );

  // コンテンツ変更で自動保存（debounce 2秒）
  useEffect(() => {
    if (loading) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    autoSaveTimer.current = setTimeout(() => {
      saveAsDraft(latestForm.current);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, form.content, form.excerpt, form.category, form.members_only, loading]);

  async function handlePublish() {
    setPublishing(true);
    try {
      await api.PUT('/admin/blog/{id}', {
        params: { path: { id } },
        body: {
          title: (form.title as string) || '（タイトルなし）',
          content: (form.content as string) ?? null,
          excerpt: (form.excerpt as string) || null,
          thumbnail_url: (form.thumbnail_url as string) || null,
          category: (form.category as string) || null,
          members_only: form.members_only ?? false,
          is_published: true,
          published_at: (form.published_at as string) || new Date().toISOString(),
        },
      });
      router.push('/blog');
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    await api.PUT('/admin/blog/{id}', {
      params: { path: { id } },
      body: {
        title: (form.title as string) || '（タイトルなし）',
        content: (form.content as string) ?? null,
        excerpt: (form.excerpt as string) || null,
        thumbnail_url: (form.thumbnail_url as string) || null,
        category: (form.category as string) || null,
        members_only: form.members_only ?? false,
        is_published: false,
        published_at: (form.published_at as string) || null,
      },
    });
    setForm((prev) => ({ ...prev, is_published: false }));
    setSaveStatus('saved');
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

  if (loading) {
    return (
      <AuthGuard>
        <AdminShell>
          <div className="p-8">
            <p className="text-gray-500 text-sm">読み込み中...</p>
          </div>
        </AdminShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminShell>
        <div className="p-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">ブログ 編集</h1>
              {form.is_published && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  公開中
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${statusColor[saveStatus]}`}>
                {statusLabel[saveStatus]}
              </span>
              <button
                type="button"
                onClick={() => router.push('/blog')}
                className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                一覧へ戻る
              </button>
              {form.is_published ? (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  className="border border-gray-300 text-gray-700 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  非公開にする
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="bg-gray-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {publishing ? '公開中...' : '公開する'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {/* タイトル */}
            <input
              value={(form.title as string) ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder="タイトルを入力..."
              className="w-full text-2xl font-bold border-0 border-b border-gray-200 pb-3 focus:outline-none focus:border-gray-400 bg-transparent placeholder-gray-300"
            />

            {/* マークダウンエディタ */}
            <MarkdownEditor
              value={(form.content as string) ?? ''}
              onChange={(val) => set('content', val)}
            />

            {/* メタデータ */}
            <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">抜粋</label>
                <textarea
                  rows={2}
                  value={(form.excerpt as string) ?? ''}
                  onChange={(e) => set('excerpt', e.target.value)}
                  placeholder="省略時は本文の先頭から自動生成"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">サムネイルURL</label>
                <input
                  value={(form.thumbnail_url as string) ?? ''}
                  onChange={(e) => set('thumbnail_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">カテゴリ</label>
                <input
                  value={(form.category as string) ?? ''}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">公開日時</label>
                <input
                  type="datetime-local"
                  value={(form.published_at as string) ?? ''}
                  onChange={(e) => set('published_at', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div className="col-span-2 flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.members_only ?? false}
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
