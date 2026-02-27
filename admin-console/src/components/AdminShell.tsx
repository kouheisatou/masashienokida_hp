'use client';

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

  function handleSignOut() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Admin</p>
          <p className="text-sm font-semibold text-white mt-1">榎田まさし</p>
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
                className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
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
            className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
          >
            サインアウト
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
