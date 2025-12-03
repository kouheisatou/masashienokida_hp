import type { Metadata } from "next";
import { Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-noto-serif",
});

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Masashi Enokida | Pianist",
  description: "Official website of Masashi Enokida, Pianist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSerif.variable} ${notoSans.variable} font-sans bg-bg-base text-text-primary antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
