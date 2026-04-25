'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken } from '@/lib/api';

function parseHash(hash: string): URLSearchParams {
  return new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
}

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = parseHash(window.location.hash).get('token');
    const error = params.get('error');

    if (token) {
      setToken(token);
      window.history.replaceState(null, '', window.location.pathname);
      router.replace('/dashboard');
    } else if (error === 'forbidden') {
      router.replace('/login?error=forbidden');
    } else {
      router.replace('/login?error=auth_failed');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">認証中...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">認証中...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
