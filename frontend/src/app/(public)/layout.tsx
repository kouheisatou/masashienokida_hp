import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: {
    template: '%s | 榎田まさし - ピアニスト',
    default: '榎田まさし - ピアニスト 公式サイト',
  },
  description:
    'ピアニスト榎田まさしの公式ウェブサイト。コンサート情報、プロフィール、ディスコグラフィなどをご紹介しています。',
  keywords: ['榎田まさし', 'ピアニスト', 'クラシック', 'ピアノ', 'コンサート'],
  authors: [{ name: '榎田まさし' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.masashi-enokida.com',
    siteName: '榎田まさし 公式サイト',
    title: '榎田まさし - ピアニスト 公式サイト',
    description: 'ピアニスト榎田まさしの公式ウェブサイト',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="relative z-10">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
