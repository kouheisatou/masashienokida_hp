'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { setToken } from '@/lib/api';

function AuthCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setToken(token);
      router.replace('/');
    } else {
      router.replace('/');
    }
  }, [params, router]);

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
