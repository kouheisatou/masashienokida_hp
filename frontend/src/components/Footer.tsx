import Link from 'next/link';

const footerLinks = {
  navigation: [
    { name: 'HOME', href: '/' },
    { name: 'BIOGRAPHY', href: '/biography/' },
    { name: 'CONCERT', href: '/concerts/' },
    { name: 'HISTORY', href: '/history/' },
  ],
  support: [
    { name: 'SUPPORTERS', href: '/supporters/' },
    { name: 'MEMBERS', href: '/members/' },
    { name: 'BLOG', href: '/blog/' },
    { name: 'CONTACT', href: '/contact/' },
  ],
  legal: [
    { name: 'プライバシーポリシー', href: '/privacy/' },
    { name: '特定商取引法に基づく表記', href: '/legal/' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-burgundy border-t border-burgundy-border">
      <div className="container section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl tracking-[0.2em] text-white mb-4">
              MASASHI ENOKIDA
            </h2>
            <p className="text-taupe leading-relaxed mb-6">
              宮崎県小林市出身のピアニスト。
              <br />
              国内外でのリサイタル、オーケストラとの共演、
              <br />
              室内楽など幅広く活動しています。
            </p>
            <p className="text-sm text-taupe">
              所属: エトワール・ミュージック
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm tracking-[0.2em] text-white mb-4">
              NAVIGATION
            </h3>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-taupe hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm tracking-[0.2em] text-white mb-4">
              SUPPORT
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-taupe hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-taupe">
            &copy; {new Date().getFullYear()} Masashi Enokida. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-taupe hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
