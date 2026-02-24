import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: {
    template: '%s | 榎田雅士 - ピアニスト',
    default: '榎田雅士 - ピアニスト 公式サイト',
  },
  description:
    'ピアニスト榎田雅士の公式ウェブサイト。コンサート情報、プロフィール、ディスコグラフィなどをご紹介しています。',
  keywords: ['榎田雅士', 'ピアニスト', 'クラシック', 'ピアノ', 'コンサート'],
  authors: [{ name: '榎田雅士' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.masashi-enokida.com',
    siteName: '榎田雅士 公式サイト',
    title: '榎田雅士 - ピアニスト 公式サイト',
    description: 'ピアニスト榎田雅士の公式ウェブサイト',
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
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
