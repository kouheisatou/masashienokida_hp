'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/biography', label: 'BIOGRAPHY' },
    { href: '/concerts', label: 'CONCERTS' },
    { href: '/history', label: 'HISTORY' },
    { href: '/discography', label: 'DISCOGRAPHY' },
    { href: '/supporters', label: 'SUPPORTERS' },
    { href: '/blog', label: 'BLOG' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-b from-[#8B0000]/90 via-[#4a0e0e]/85 to-transparent border-b border-[#FFD700]/20">
      {/* Curtain decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-60" />

      <div className="max-w-[1400px] mx-auto px-6">
        <nav className="flex items-center justify-between py-5">
          {/* Logo with theatrical styling */}
          <Link
            href="/"
            className="relative text-2xl md:text-3xl font-bold tracking-[0.2em] text-[#FFD700] transition-all duration-300 hover:text-[#FFA500] hover:drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
          >
            <span className="relative z-10">MASASHI ENOKIDA</span>
            <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative px-4 py-2 text-xs tracking-[0.15em] font-semibold uppercase text-[#f0f0f0] transition-all duration-300 hover:text-[#FFD700] group"
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#FFA500] transition-all duration-300 group-hover:w-4/5 group-hover:left-[10%]" />
                  {/* Hover glow */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#FFD700]/5 rounded" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-[#FFD700] hover:text-[#FFA500] transition-colors relative group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
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
          <div className="lg:hidden pb-6 pt-2 border-t border-[#FFD700]/10">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-4 py-3 text-sm tracking-[0.15em] font-semibold uppercase text-[#f0f0f0] transition-all duration-300 hover:text-[#FFD700] hover:bg-[#FFD700]/5 rounded"
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

      {/* Decorative corner ornaments */}
      <div className="absolute top-2 left-6 w-8 h-8 border-t border-l border-[#FFD700]/20" />
      <div className="absolute top-2 right-6 w-8 h-8 border-t border-r border-[#FFD700]/20" />
    </header>
  );
}
