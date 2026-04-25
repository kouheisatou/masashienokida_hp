'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/api';

function parseHash(hash: string): URLSearchParams {
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
}

function AuthCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    const token = parseHash(window.location.hash).get('token');
    if (token) {
      setToken(token);
      // hash を即座に消去 (履歴・後続スクリプトからの参照を防ぐ)
      window.history.replaceState(null, '', window.location.pathname);
      window.dispatchEvent(new CustomEvent('auth:login'));
    }
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
