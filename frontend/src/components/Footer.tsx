import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-gray border-t border-maroon/20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-metallic-gold font-bold mb-4">MASASHI ENOKIDA</h3>
            <p className="text-sm text-off-white/70 leading-relaxed">
              ピアニスト 榎田雅士のオフィシャルウェブサイト
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-metallic-gold font-bold mb-4">QUICK LINKS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/biography" className="hover:text-metallic-gold transition-colors">
                  Biography
                </Link>
              </li>
              <li>
                <Link href="/concerts" className="hover:text-metallic-gold transition-colors">
                  Concerts
                </Link>
              </li>
              <li>
                <Link href="/discography" className="hover:text-metallic-gold transition-colors">
                  Discography
                </Link>
              </li>
              <li>
                <Link href="/supporters" className="hover:text-metallic-gold transition-colors">
                  Fan Club
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-metallic-gold font-bold mb-4">FOLLOW</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-metallic-gold/20 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-metallic-gold/20 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-off-white/50 pt-8 border-t border-maroon/20">
          <p>&copy; {currentYear} Masashi Enokida. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
