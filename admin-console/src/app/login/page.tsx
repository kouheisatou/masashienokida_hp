'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getToken, getAdminGoogleSignInUrl } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get('error');

  useEffect(() => {
    if (getToken()) router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">管理コンソール</h1>
        <p className="text-gray-500 text-sm mb-8">榎田まさし ピアニスト</p>
        {error === 'forbidden' && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-700 text-sm font-medium">アクセスが拒否されました</p>
            <p className="text-red-500 text-xs mt-1">
              このアカウントには管理者権限がありません。許可されたメールアドレスでログインしてください。
            </p>
          </div>
        )}
        {error === 'auth_failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-red-700 text-sm font-medium">認証に失敗しました</p>
            <p className="text-red-500 text-xs mt-1">もう一度お試しください。</p>
          </div>
        )}
        <a
          href={getAdminGoogleSignInUrl()}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google アカウントでサインイン
        </a>
        <p className="text-xs text-gray-400 mt-6">管理者権限を持つアカウントのみ利用できます</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
