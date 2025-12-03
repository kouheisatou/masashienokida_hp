'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'TOP' },
    { href: '/biography', label: 'BIOGRAPHY' },
    { href: '/concerts', label: 'CONCERT' },
    { href: '/history', label: 'HISTORY' },
    { href: '/discography', label: 'DISCOGRAPHY' },
    { href: '/supporters', label: 'SUPPORTERS' },
    { href: '/blog', label: 'BLOG' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#333333]">
      <div className="max-w-[1400px] mx-auto px-6">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-sm tracking-[0.2em] text-white hover:text-[#cccccc] transition-colors"
          >
            榎田 雅士
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[11px] tracking-[0.15em] uppercase text-[#cccccc] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white hover:text-[#cccccc] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-[#333333]">
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block text-[11px] tracking-[0.15em] uppercase text-[#cccccc] hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
