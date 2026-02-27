'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { href: '/blog', label: 'ブログ', icon: '✍️' },
  { href: '/blog/categories', label: 'カテゴリ管理', icon: '🏷️' },
  { href: '/concerts', label: 'コンサート', icon: '🎵' },
  { href: '/discography', label: 'ディスコグラフィー', icon: '💿' },
  { href: '/biography', label: '経歴', icon: '📝' },
  { href: '/contacts', label: 'お問い合わせ', icon: '📬' },
  { href: '/members', label: '会員管理', icon: '👥' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSignOut() {
    clearToken();
    router.push('/login');
  }

  // ナビゲーション後にサイドバーを閉じる（モバイル）
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-900 text-white flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-colors touch-manipulation"
          aria-label="メニューを開く"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="text-sm font-semibold">榎田まさし</p>
        <div className="w-10" aria-hidden />
      </header>

      {/* Overlay (mobile) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col transform transition-transform duration-200 ease-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between lg:block">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Admin</p>
            <p className="text-sm font-semibold text-white mt-1">榎田まさし</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="メニューを閉じる"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ href, label, icon }) => {
            const active = href === '/blog'
              ? pathname === '/blog' || (pathname.startsWith('/blog/') && !pathname.startsWith('/blog/categories'))
              : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors touch-manipulation min-h-[48px] ${
                  active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            type="button"
            className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors py-3 touch-manipulation min-h-[44px]"
          >
            サインアウト
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
