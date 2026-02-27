'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, api } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    api.GET('/auth/me')
      .then(({ data }) => {
        if (!data || data.user.role !== 'ADMIN') {
          clearToken();
          router.replace('/login?error=forbidden');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        clearToken();
        router.replace('/login');
      });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">読み込み中...</p>
      </div>
    );
  }

  return <>{children}</>;
}
