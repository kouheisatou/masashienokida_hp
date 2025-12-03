'use client';

import Button from '@/components/Button';
import Card from '@/components/Card';
import Link from 'next/link';

export default function Home() {
  // Mock data - 後でAPIから取得
  const latestNews = [
    {
      id: '1',
      title: '2025年春 リサイタルツアー開催決定',
      date: '2025-01-15',
      category: 'コンサート情報',
      excerpt: '全国5都市でのリサイタルツアーが決定いたしました。',
    },
    {
      id: '2',
      title: '新アルバム「Nocturne」リリース',
      date: '2025-01-10',
      category: 'メディア',
      excerpt: 'ショパンの夜想曲全曲録音アルバムをリリースいたしました。',
    },
  ];

  const upcomingConcerts = [
    {
      id: '1',
      title: 'ショパン・リサイタル',
      date: '2025-02-20',
      venue: '東京文化会館',
    },
    {
      id: '2',
      title: '協奏曲の夕べ',
      date: '2025-03-15',
      venue: 'サントリーホール',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="text-center z-10 px-6">
          <h1 className="text-7xl md:text-8xl font-light mb-6 text-white tracking-wide">
            Enokida
          </h1>
          <p className="text-sm md:text-base mb-12 text-[#888888] tracking-[0.3em] uppercase">
            Pianist
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/concerts">
              <Button variant="primary" size="md">
                Concerts
              </Button>
            </Link>
            <Link href="/discography">
              <Button variant="outline" size="md">
                Discography
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-24 md:py-32 px-6 border-t border-[#333333]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-light mb-12 text-white tracking-[0.15em] uppercase">
            Latest News
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {latestNews.map((news) => (
              <Card
                key={news.id}
                title={news.title}
                description={news.excerpt}
                onClick={() => {}}
              >
                <div className="flex justify-between items-center text-xs mt-4">
                  <span className="text-[#888888]">{news.category}</span>
                  <span className="text-[#888888]">{news.date}</span>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Concerts */}
      <section className="py-24 md:py-32 px-6 border-t border-[#333333]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-light mb-12 text-white tracking-[0.15em] uppercase">
            Upcoming Concerts
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {upcomingConcerts.map((concert) => (
              <Card
                key={concert.id}
                title={concert.title}
                onClick={() => {}}
              >
                <div className="flex justify-between items-center text-xs mt-4">
                  <span className="text-[#cccccc]">{concert.venue}</span>
                  <span className="text-[#888888]">{concert.date}</span>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link href="/concerts">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action - Supporters Club */}
      <section className="py-24 md:py-32 px-6 border-t border-[#333333]">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-2xl font-light mb-6 text-white tracking-[0.15em] uppercase">
            Supporters Club
          </h2>
          <p className="text-sm mb-8 leading-relaxed text-[#888888]">
            ファンクラブ会員限定のコンテンツや先行予約など、<br />
            さまざまな特典をご用意しております。
          </p>
          <Link href="/supporters">
            <Button variant="primary" size="md">
              Learn More
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
