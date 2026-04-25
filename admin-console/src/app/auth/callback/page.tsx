'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, migrateLegacyToken } from '@/lib/api';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    migrateLegacyToken();
    const error = params.get('error');

    if (error === 'forbidden') {
      router.replace('/login?error=forbidden');
      return;
    }
    if (isAuthenticated()) {
      router.replace('/dashboard');
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
