"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditDiscographyPage() {
  const params = useParams();
  const id = params?.id;
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
        <h1 className="text-2xl font-bold text-gray-900">CD情報の編集 #{id}</h1>
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
                defaultValue="Nocturne - Chopin Collection"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
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
                defaultValue="2025-01-10"
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
                defaultValue="3000"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
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
              defaultValue="1. Nocturne Op.9-2..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
             <button
              type="button"
              className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              削除
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '更新する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
