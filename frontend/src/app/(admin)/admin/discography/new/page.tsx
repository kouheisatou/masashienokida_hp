"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewDiscographyPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: API Call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CD情報の追加</h1>
        <Link
          href="/admin/discography"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          キャンセル
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="例: Nocturne Collection"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="release_date" className="block text-sm font-medium text-gray-700">
                発売日
              </label>
              <input
                type="date"
                id="release_date"
                name="release_date"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div className="space-y-1">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                価格 (税込)
              </label>
              <input
                type="text"
                id="price"
                name="price"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="例: 3000"
              />
            </div>
             <div className="space-y-1">
              <label htmlFor="shop_url" className="block text-sm font-medium text-gray-700">
                購入リンク (URL)
              </label>
              <input
                type="url"
                id="shop_url"
                name="shop_url"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="tracks" className="block text-sm font-medium text-gray-700">
              収録曲 (Tracks)
            </label>
            <textarea
              id="tracks"
              name="tracks"
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono"
              placeholder="1. Track Name...&#10;2. Track Name..."
            />
          </div>

           <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              ジャケット画像
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="jacket-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>画像をアップロード</span>
                    <input id="jacket-upload" name="jacket-upload" type="file" className="sr-only" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
