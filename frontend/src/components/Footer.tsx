import Link from 'next/link';

const navigation = [
  { name: 'HOME', href: '/' },
  { name: 'CONCERT', href: '/concerts/' },
  { name: 'DISCOGRAPHY', href: '/discography/' },
  { name: 'BLOG', href: '/blog/' },
  { name: 'CONTACT', href: '/contact/' },
  { name: 'SUPPORTERS', href: '/supporters/' },
];

export function Footer() {
  return (
    <footer className="border-t border-burgundy-border">
      <div className="container section-padding !py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Logo & Tagline */}
          <div>
            <Link href="/" className="text-xl tracking-[0.3em] text-white hover:opacity-80 transition-opacity">
              MASASHI ENOKIDA
            </Link>
            <p className="text-taupe text-sm mt-3 tracking-wider">PIANIST</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm tracking-[0.15em] text-taupe hover:text-white transition-colors w-fit"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Contact Info */}
          <div className="space-y-3">
            <p className="text-sm text-taupe">
              お問い合わせ・コンサートのご依頼は
              <br />
              <Link href="/contact/" className="text-beige hover:text-white transition-colors underline underline-offset-4">
                コンタクトページ
              </Link>
              よりお願いいたします。
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-burgundy-border">
        <div className="container py-6 text-center">
          <p className="text-taupe text-xs tracking-wider">
            &copy; {new Date().getFullYear()} Masashi Enokida. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
