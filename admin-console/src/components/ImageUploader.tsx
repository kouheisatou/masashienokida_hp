'use client';

import { useRef, useCallback, useState } from 'react';
import { getToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  helpText?: string;
}

export default function ImageUploader({ value, onChange, label = 'サムネイル画像', helpText }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('画像ファイル（JPG / PNG / WebP）を選択してください');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください');
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/upload/image`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'アップロードに失敗しました');
        }
        const { url } = (await res.json()) as { url: string };
        onChange(url);
      } catch (e) {
        alert(e instanceof Error ? e.message : '画像のアップロードに失敗しました');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {helpText && <p className="text-xs text-gray-500 mb-2">{helpText}</p>}
      {value ? (
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={value}
              alt="プレビュー"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
              aria-label="画像を削除"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 truncate max-w-[240px]" title={value}>
              {value}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                {uploading ? 'アップロード中...' : '別の画像を選択'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <p className="text-sm text-gray-600">アップロード中...</p>
          ) : (
            <>
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-600">ドラッグ＆ドロップ または クリックしてファイルを選択</p>
              <p className="text-xs text-gray-400 mt-1">JPG / PNG / WebP（最大10MB）→ WebP に自動変換・1200px にリサイズ</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
