'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { getToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Tab = 'write' | 'preview';

interface Props {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export default function MarkdownEditor({ value, onChange, height = 520 }: Props) {
  const [tab, setTab] = useState<Tab>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Auto-resize textarea to fill container
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${height}px`;
    }
  }, [height, tab]);

  const insertAtCursor = useCallback(
    (insertion: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        onChange(value + '\n' + insertion);
        return;
      }
      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const newValue = value.slice(0, start) + insertion + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = start + insertion.length;
        textarea.selectionEnd = start + insertion.length;
        textarea.focus();
      });
    },
    [value, onChange]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/upload/image`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const { url } = (await res.json()) as { url: string };
        const altText = file.name.replace(/\.[^.]+$/, '');
        insertAtCursor(`![${altText}](${url})`);
      } catch {
        alert('画像のアップロードに失敗しました');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [insertAtCursor]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('  ');
      }
    },
    [insertAtCursor]
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              tab === 'write'
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              tab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            プレビュー
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || tab === 'preview'}
            className="flex items-center gap-1.5 text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-300 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {uploading ? 'アップロード中...' : '画像を挿入'}
          </button>
          <span className="text-xs text-gray-400 hidden sm:inline">
            JPG / PNG / WebP（最大10MB）
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Editor / Preview */}
      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="記事を書いてください...&#10;&#10;改行はそのまま反映されます。&#10;Markdown記法も使えます: # 見出し　**太字**　*斜体*　[リンク](url)"
          className="w-full resize-none border-0 px-4 py-3 text-sm leading-relaxed focus:outline-none font-mono"
          style={{ height: `${height}px` }}
        />
      ) : (
        <div
          className="px-4 py-3 overflow-y-auto prose prose-sm max-w-none"
          style={{ height: `${height}px` }}
        >
          {value ? (
            <ReactMarkdown
              remarkPlugins={[remarkBreaks, remarkGfm]}
              components={{
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || ''}
                    className="max-w-full rounded my-2"
                    loading="lazy"
                  />
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-400 text-sm">プレビューする内容がありません</p>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-1.5 bg-gray-50">
        <p className="text-xs text-gray-400">
          改行はそのまま反映されます　|　# 見出し　**太字**　*斜体*　`コード`　[リンク](url)　![画像](url)
        </p>
      </div>
    </div>
  );
}
