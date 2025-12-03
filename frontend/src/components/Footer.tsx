import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-[#1a0505] to-[#0a0a0a] border-t border-[#FFD700]/30">
      {/* Top decorative line with ornament */}
      <div className="relative h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FFD700] text-xs bg-[#0a0a0a] px-3">
          ◆
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About */}
          <div className="text-center md:text-left">
            <h3 className="text-[#FFD700] font-bold text-lg tracking-[0.2em] mb-4 relative inline-block">
              MASASHI ENOKIDA
              <span className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
            </h3>
            <p className="text-sm text-[#f0f0f0]/70 leading-relaxed mt-6">
              ピアニスト 榎田雅士のオフィシャルウェブサイト
            </p>
            <p className="text-xs text-[#FFD700]/50 mt-2 tracking-wider">
              Official Website
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-[#FFD700] font-bold text-lg tracking-[0.2em] mb-4 relative inline-block">
              QUICK LINKS
              <span className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
            </h3>
            <ul className="space-y-3 text-sm mt-6">
              <li>
                <Link
                  href="/biography"
                  className="text-[#f0f0f0]/80 hover:text-[#FFD700] transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#FFD700]/50 rounded-full group-hover:w-2 transition-all duration-300" />
                  Biography
                </Link>
              </li>
              <li>
                <Link
                  href="/concerts"
                  className="text-[#f0f0f0]/80 hover:text-[#FFD700] transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#FFD700]/50 rounded-full group-hover:w-2 transition-all duration-300" />
                  Concerts
                </Link>
              </li>
              <li>
                <Link
                  href="/discography"
                  className="text-[#f0f0f0]/80 hover:text-[#FFD700] transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#FFD700]/50 rounded-full group-hover:w-2 transition-all duration-300" />
                  Discography
                </Link>
              </li>
              <li>
                <Link
                  href="/supporters"
                  className="text-[#f0f0f0]/80 hover:text-[#FFD700] transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 bg-[#FFD700]/50 rounded-full group-hover:w-2 transition-all duration-300" />
                  Supporters Club
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-left">
            <h3 className="text-[#FFD700] font-bold text-lg tracking-[0.2em] mb-4 relative inline-block">
              FOLLOW
              <span className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent" />
            </h3>
            <div className="flex gap-4 justify-center md:justify-start mt-6">
              <a
                href="#"
                className="w-12 h-12 rounded border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 group"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 group"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300 group"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="gold-divider my-8" />

        {/* Copyright */}
        <div className="text-center text-sm text-[#f0f0f0]/50 pt-4">
          <p className="tracking-wider">
            &copy; {currentYear} Masashi Enokida. All rights reserved.
          </p>
        </div>
      </div>

      {/* Bottom decorative corners */}
      <div className="absolute bottom-4 left-6 w-12 h-12 border-b border-l border-[#FFD700]/20" />
      <div className="absolute bottom-4 right-6 w-12 h-12 border-b border-r border-[#FFD700]/20" />
    </footer>
  );
}
