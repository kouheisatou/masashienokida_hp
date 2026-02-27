'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { api, clearToken, type components } from '@/lib/api';

type User = components['schemas']['User'];
import '../(public)/globals.css';

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: LayoutDashboard },
  { name: '会員管理', href: '/admin/members', icon: Users },
  { name: 'お問い合わせ', href: '/admin/contacts', icon: Mail },
  { name: 'コンテンツ', href: '/admin/content', icon: FileText },
  { name: '設定', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await api.GET('/auth/me');
      if (!data || data.user.role !== 'ADMIN') {
        window.location.href = '/';
        return;
      }
      setUser(data.user);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await api.POST('/auth/signout');
    clearToken();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <html lang="ja">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-burgundy-black">
            <p className="text-taupe">読み込み中...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-burgundy-black">
        <div className="relative z-10">
          {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 w-64 bg-burgundy transform transition-transform duration-200 z-50 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-burgundy-border">
              <Link href="/admin" className="text-white text-lg">
                Admin Panel
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                      isActive
                        ? 'bg-burgundy-accent text-white'
                        : 'text-taupe hover:text-beige hover:bg-burgundy-light'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-burgundy-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-burgundy-light flex items-center justify-center">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || ''}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users size={16} className="text-taupe" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-beige text-sm truncate">{user?.name}</p>
                  <p className="text-taupe text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-taupe hover:text-beige transition-colors text-sm w-full"
              >
                <LogOut size={16} />
                ログアウト
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Mobile header */}
          <header className="lg:hidden sticky top-0 z-30 bg-burgundy border-b border-burgundy-border">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-taupe hover:text-beige"
              >
                <Menu size={24} />
              </button>
              <span className="text-white">Admin Panel</span>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-screen">
            {children}
          </main>
        </div>

        {/* Close button for mobile sidebar */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="fixed top-4 right-4 z-50 lg:hidden text-white"
          >
            <X size={24} />
          </button>
        )}
        </div>
      </body>
    </html>
  );
}
