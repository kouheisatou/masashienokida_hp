'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'concert', label: 'コンサート' },
    { id: 'recording', label: 'レコーディング' },
    { id: 'daily', label: '日常' },
    { id: 'media', label: 'メディア' },
  ];

  const posts = [
    {
      id: '1',
      title: '2025年春 リサイタルツアー開催決定',
      excerpt: '全国5都市でのリサイタルツアーが決定いたしました。各地で皆様とお会いできることを心より楽しみにしております。',
      date: '2025-01-15',
      category: 'concert',
      categoryLabel: 'コンサート',
      membersOnly: false,
      imageGradient: 'from-[#8B0000] to-[#4a0e0e]',
    },
    {
      id: '2',
      title: '新アルバム「Nocturne」リリースに寄せて',
      excerpt: 'ショパンの夜想曲全曲録音という、長年の夢がついに実現しました。レコーディングの思い出を綴ります。',
      date: '2025-01-10',
      category: 'recording',
      categoryLabel: 'レコーディング',
      membersOnly: false,
      imageGradient: 'from-[#1a1a2e] to-[#16213e]',
    },
    {
      id: '3',
      title: 'パリでの思い出',
      excerpt: '留学時代を過ごしたパリを久しぶりに訪れました。懐かしい街並みと、変わらぬ音楽への情熱について。',
      date: '2025-01-05',
      category: 'daily',
      categoryLabel: '日常',
      membersOnly: true,
      imageGradient: 'from-[#2d4059] to-[#ea5455]',
    },
    {
      id: '4',
      title: 'NHK「クラシック音楽館」出演のお知らせ',
      excerpt: '来月のNHK「クラシック音楽館」にゲスト出演させていただきます。演奏と共にインタビューも収録されました。',
      date: '2024-12-28',
      category: 'media',
      categoryLabel: 'メディア',
      membersOnly: false,
      imageGradient: 'from-[#0f3460] to-[#533483]',
    },
    {
      id: '5',
      title: 'リハーサルの日々',
      excerpt: '次回のコンサートに向けて、日々リハーサルを重ねています。プログラムへの思いと、練習の様子をお届けします。',
      date: '2024-12-20',
      category: 'concert',
      categoryLabel: 'コンサート',
      membersOnly: true,
      imageGradient: 'from-[#222831] to-[#393e46]',
    },
    {
      id: '6',
      title: 'レコーディングの舞台裏',
      excerpt: '先日のレコーディングセッションの様子を、写真と共にご紹介します。スタジオでの貴重な瞬間をお届け。',
      date: '2024-12-15',
      category: 'recording',
      categoryLabel: 'レコーディング',
      membersOnly: true,
      imageGradient: 'from-[#2c3e50] to-[#34495e]',
    },
  ];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              BLOG
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            日々の想い、音楽への情熱を綴ります
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-6 border-b border-[#8b4545]/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <div className="velvet-card overflow-hidden cursor-pointer group h-full flex flex-col">
                  {/* Image placeholder */}
                  <div className="relative h-48 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${post.imageGradient} transition-transform duration-700 group-hover:scale-110`} />

                    {/* Members only badge */}
                    {post.membersOnly && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1.5 text-xs font-bold tracking-wider rounded bg-white text-black flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          会員限定
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2.5 py-1 bg-white/10 border border-[#8b4545]/30 text-white rounded">
                        {post.categoryLabel}
                      </span>
                      <span className="text-[#f0f0f0]/50">
                        {new Date(post.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#d4c4b0] transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[#f0f0f0]/80 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Read more */}
                    <div className="mt-4 flex items-center gap-2 text-white text-sm font-bold group-hover:gap-3 transition-all duration-300">
                      <span>続きを読む</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#8b4545]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#8b4545]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-wider">
            会員限定コンテンツ
          </h2>
          <p className="text-[#f0f0f0]/80 mb-8 leading-relaxed">
            サポーターズクラブ会員の方は、<br />
            会員限定の記事や動画など、特別なコンテンツをお楽しみいただけます。
          </p>
          <Button variant="outline" size="lg">
            サポーターズクラブについて
          </Button>
        </div>
      </section>
    </div>
  );
}
