'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { migrateLegacyToken } from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    // 旧バージョンの localStorage 残骸を一掃
    migrateLegacyToken();
    // 認証 cookie はバックエンドが既にセット済み。ヘッダ等に通知して再フェッチさせる。
    window.dispatchEvent(new CustomEvent('auth:login'));
    const savedRedirect = sessionStorage.getItem('auth_redirect') || '/';
    sessionStorage.removeItem('auth_redirect');
    router.replace(savedRedirect);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: '#d4c4b0' }}>ログイン中...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p style={{ color: '#d4c4b0' }}>ログイン中...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
