'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut, Settings, CreditCard, Crown, Heart, LogIn, Sparkles } from 'lucide-react';
import { api, getGoogleSignInUrl, clearToken, type components } from '@/lib/api';

type UserType = components['schemas']['User'];

const ROLE_LABELS: Record<UserType['role'], string> = {
  USER: '無料会員',
  MEMBER_FREE: 'メール会員',
  MEMBER_GOLD: 'ゴールド会員',
  ADMIN: '管理者',
};

const navigation = [
  { name: 'HOME', href: '/' },
  { name: 'CONCERT', href: '/concerts/' },
  { name: 'DISCOGRAPHY', href: '/discography/' },
  { name: 'BLOG', href: '/blog/' },
  { name: 'CONTACT', href: '/contact/' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.GET('/auth/me').then(({ data }) => {
      if (data) setUser(data.user);
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopRef.current?.contains(target);
      const insideMobile = mobileRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = useCallback(async () => {
    await api.POST('/auth/signout');
    clearToken();
    setUser(null);
    setAccountOpen(false);
    window.location.href = '/';
  }, []);

  const closeAccount = useCallback(() => setAccountOpen(false), []);
  const isGoldMember = user?.role === 'MEMBER_GOLD';
  const isAdmin = user?.role === 'ADMIN';
  const needsUpgrade = user && !isGoldMember && !isAdmin;

  const accountMenuItems = user ? (
    <>
      <div className="px-4 py-3 border-b border-burgundy-border">
        <p className="text-beige text-sm font-medium truncate">{user.name || 'ゲスト'}</p>
        <p className="text-taupe text-xs truncate">{user.email}</p>
        <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded ${
          isGoldMember
            ? 'bg-burgundy-accent/20 text-burgundy-accent'
            : isAdmin
              ? 'bg-purple-500/20 text-purple-300'
              : 'bg-white/10 text-taupe'
        }`}>
          {isGoldMember && <Crown size={10} />}
          {isAdmin && <Sparkles size={10} />}
          {ROLE_LABELS[user.role]}
        </span>
      </div>
      <div className="py-1">
        <Link href="/members/" onClick={closeAccount} className="flex items-center gap-3 px-4 py-2.5 text-sm text-taupe hover:text-white hover:bg-burgundy transition-colors">
          <User size={16} />
          マイページ
        </Link>
        <Link href="/members/profile/" onClick={closeAccount} className="flex items-center gap-3 px-4 py-2.5 text-sm text-taupe hover:text-white hover:bg-burgundy transition-colors">
          <Settings size={16} />
          プロフィール設定
        </Link>
        <Link href="/supporters/" onClick={closeAccount} className="flex items-center gap-3 px-4 py-2.5 text-sm text-taupe hover:text-white hover:bg-burgundy transition-colors">
          <Heart size={16} />
          サポーターズについて
        </Link>
        {needsUpgrade && (
          <Link href="/subscription/" onClick={closeAccount} className="flex items-center gap-3 px-4 py-2.5 text-sm text-burgundy-accent hover:text-white hover:bg-burgundy transition-colors font-medium">
            <CreditCard size={16} />
            ゴールド会員にアップグレード
          </Link>
        )}
      </div>
      <div className="border-t border-burgundy-border py-1">
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-taupe hover:text-white hover:bg-burgundy transition-colors">
          <LogOut size={16} />
          ログアウト
        </button>
      </div>
    </>
  ) : (
    <div className="py-1">
      <a href={getGoogleSignInUrl()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-taupe hover:text-white hover:bg-burgundy transition-colors">
        <LogIn size={16} />
        ログイン / 会員登録
      </a>
      <Link href="/supporters/" onClick={closeAccount} className="flex items-center gap-3 px-4 py-2.5 text-sm text-taupe hover:text-white hover:bg-burgundy transition-colors">
        <Heart size={16} />
        サポーターズについて
      </Link>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl tracking-[0.3em] text-white hover:opacity-80 transition-opacity"
          >
            MASASHI ENOKIDA
          </Link>

          {/* Desktop Navigation + Account */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm tracking-[0.15em] text-taupe hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {authChecked && (
              <div className="relative" ref={desktopRef}>
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="relative w-9 h-9 rounded-full bg-burgundy border border-burgundy-border flex items-center justify-center overflow-hidden text-taupe hover:text-white hover:border-taupe transition-colors"
                >
                  {user?.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                  {user && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#1a0a0a] rounded-full" />
                  )}
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a0a0a] border border-burgundy-border rounded-lg shadow-2xl overflow-hidden">
                    {accountMenuItems}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Account Icon + Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {authChecked && (
              <div ref={mobileRef}>
                <button
                  onClick={() => { setAccountOpen((v) => !v); setIsOpen(false); }}
                  className="relative w-8 h-8 rounded-full bg-burgundy border border-burgundy-border flex items-center justify-center overflow-hidden text-taupe"
                >
                  {user?.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                  {user && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#1a0a0a] rounded-full" />
                  )}
                </button>
              </div>
            )}
            <button
              type="button"
              className="p-2 text-beige"
              onClick={() => { setIsOpen((v) => !v); setAccountOpen(false); }}
              aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="lg:hidden bg-burgundy border-t border-burgundy-border">
          <div className="container py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 text-sm tracking-[0.15em] text-beige hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Mobile Account Dropdown */}
      {accountOpen && (
        <div className="lg:hidden bg-burgundy border-t border-burgundy-border">
          <div className="container py-4">
            {accountMenuItems}
          </div>
        </div>
      )}
    </header>
  );
}
