"use client";

import { useState } from "react";

export default function BiographyPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock Data State
  const [bio, setBio] = useState({
    japanese: "3歳よりピアノを始める。東京藝術大学音楽学部附属音楽高等学校を経て、同大学器楽科を首席で卒業...",
    english: "Masashi Enokida began playing the piano at the age of three...",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: API Call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">基本プロフィール (Biography)</h3>
          <p className="mt-1 text-sm text-gray-500">ウェブサイトのBIOGRAPHYページに表示されるメインの紹介文です。</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="bio_ja" className="block text-sm font-medium text-gray-700">
                日本語 (Japanese)
              </label>
              <textarea
                id="bio_ja"
                name="bio_ja"
                rows={8}
                value={bio.japanese}
                onChange={(e) => setBio({...bio, japanese: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bio_en" className="block text-sm font-medium text-gray-700">
                英語 (English)
              </label>
              <textarea
                id="bio_en"
                name="bio_en"
                rows={8}
                value={bio.english}
                onChange={(e) => setBio({...bio, english: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">学歴 (Education)</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ 追加</button>
            </div>
            <div className="p-6">
                <ul className="space-y-4">
                    <li className="flex items-start justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-900">東京藝術大学 音楽学部</p>
                            <p className="text-xs text-gray-500">2018年 - 2022年</p>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-xs text-gray-500 hover:text-indigo-600">編集</button>
                             <button className="text-xs text-red-500 hover:text-red-700">削除</button>
                        </div>
                    </li>
                     <li className="flex items-start justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-900">パリ国立高等音楽院</p>
                            <p className="text-xs text-gray-500">2022年 - 現在</p>
                        </div>
                         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-xs text-gray-500 hover:text-indigo-600">編集</button>
                             <button className="text-xs text-red-500 hover:text-red-700">削除</button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        {/* Awards Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">受賞歴 (Awards)</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ 追加</button>
            </div>
            <div className="p-6">
                <ul className="space-y-4">
                    <li className="flex items-start justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-900">第88回 日本音楽コンクール ピアノ部門 第1位</p>
                            <p className="text-xs text-gray-500">2019年</p>
                        </div>
                         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-xs text-gray-500 hover:text-indigo-600">編集</button>
                             <button className="text-xs text-red-500 hover:text-red-700">削除</button>
                        </div>
                    </li>
                     <li className="flex items-start justify-between group">
                        <div>
                            <p className="text-sm font-medium text-gray-900">ショパン国際ピアノコンクール 入賞</p>
                            <p className="text-xs text-gray-500">2021年</p>
                        </div>
                         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-xs text-gray-500 hover:text-indigo-600">編集</button>
                             <button className="text-xs text-red-500 hover:text-red-700">削除</button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
