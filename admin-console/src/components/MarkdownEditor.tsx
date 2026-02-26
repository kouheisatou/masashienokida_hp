'use client';

import { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getToken } from '@/lib/api';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Props {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

export default function MarkdownEditor({ value, onChange, height = 520 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTextarea = (): HTMLTextAreaElement | null =>
    document.querySelector('.w-md-editor-text-input');

  const insertAtCursor = useCallback(
    (insertion: string) => {
      const textarea = getTextarea();
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
        e.target.value = '';
      }
    },
    [insertAtCursor]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          画像を挿入
        </button>
        <span className="text-xs text-gray-400">JPG / PNG / WebP（最大10MB）→ WebP に自動変換・1200px にリサイズ</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div data-color-mode="light">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val ?? '')}
          height={height}
          preview="live"
          textareaProps={{ placeholder: 'Markdownで記事を書いてください...' }}
        />
      </div>

      <p className="mt-1.5 text-xs text-gray-400">
        # 見出し　**太字**　*斜体*　`コード`　[リンク](url)　![画像](url)
      </p>
    </div>
  );
}
