"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewMemberContentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("article");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: API Call
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add Member Content</h1>
        <Link
          href="/admin/members-content"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="access_level" className="block text-sm font-medium text-gray-700">
                Access Level
              </label>
              <select
                id="access_level"
                name="access_level"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              >
                <option value="gold">Gold Members Only</option>
                <option value="free">All Members (Free & Gold)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
             <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Content Type
              </label>
               <select
                id="type"
                name="type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="file">File Download</option>
              </select>
          </div>

          {contentType === "article" && (
             <div className="space-y-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Article Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono"
                />
            </div>
          )}

          {contentType === "video" && (
             <div className="space-y-1">
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                  Video URL (Vimeo/YouTube/S3)
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  placeholder="https://..."
                />
            </div>
          )}

           {contentType === "file" && (
             <div className="space-y-1">
                <label htmlFor="file_upload" className="block text-sm font-medium text-gray-700">
                  Upload File
                </label>
                <input
                  type="file"
                  id="file_upload"
                  name="file_upload"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Publishing...' : 'Publish Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
