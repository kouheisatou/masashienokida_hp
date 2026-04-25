'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MembersProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/members/');
  }, [router]);

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <p className="text-taupe">リダイレクト中...</p>
    </div>
  );
}
