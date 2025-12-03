"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditHistoryPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">活動履歴の編集 #{id}</h1>
        <Link
          href="/admin/history"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          キャンセル
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="space-y-1 md:col-span-1">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                年 (Year)
              </label>
              <input
                type="number"
                id="year"
                name="year"
                defaultValue="2024"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>

            <div className="space-y-1 md:col-span-3">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                タイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue="初の全国ツアー開催"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              詳細 (Description)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue="東京、大阪、名古屋、福岡、札幌の5都市を巡るリサイタルツアー。"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
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
