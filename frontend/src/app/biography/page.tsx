'use client';

import Image from 'next/image';
import Card from '@/components/Card';

export default function BiographyPage() {
  const profile = {
    name: '榎田 雅士',
    nameEn: 'MASASHI ENOKIDA',
    title: 'ピアニスト / Pianist',
    bio: `国際的に活躍するピアニスト。繊細かつ力強い演奏で、聴衆を魅了し続けている。

ショパン、リスト、ラヴェルなどロマン派から近現代の作品を得意とし、その解釈の深さと卓越した技術で高い評価を得ている。

国内外の主要なコンサートホールでのリサイタル、オーケストラとの共演、室内楽など、幅広い演奏活動を展開。数々の音楽賞を受賞し、CDリリースも高く評価されている。`,
  };

  const education = [
    {
      year: '2010',
      title: '東京藝術大学音楽学部卒業',
      description: 'ピアノ科を首席で卒業。卒業時に藝大賞を受賞。',
    },
    {
      year: '2012',
      title: '同大学院修士課程修了',
      description: '室内楽、伴奏法を専攻。学長賞を受賞。',
    },
    {
      year: '2013-2015',
      title: 'パリ国立高等音楽院留学',
      description: 'ピエール・ローラン教授に師事。ディプロマを取得。',
    },
  ];

  const awards = [
    {
      year: '2009',
      title: '日本音楽コンクール第1位',
      description: '併せて聴衆賞、審査員特別賞を受賞',
    },
    {
      year: '2011',
      title: 'ショパン国際ピアノコンクール セミファイナリスト',
      description: 'ポーランド批評家賞を受賞',
    },
    {
      year: '2014',
      title: 'ロン=ティボー国際コンクール 第2位',
      description: 'フランス音楽最優秀演奏賞も受賞',
    },
    {
      year: '2018',
      title: '芸術選奨文部科学大臣新人賞',
      description: '音楽部門にて受賞',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              BIOGRAPHY
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            音楽への情熱と、芸術への深い探求心を持って
          </p>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            {/* Profile Image */}
            <div className="md:col-span-2">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-[#8B0000]/30 to-[#4a0e0e]/40 rounded overflow-hidden border-2 border-[#FFD700]/30">
                {/* Placeholder for profile image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[#FFD700]/30 text-center">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm">Profile Photo</p>
                  </div>
                </div>
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#FFD700]/50" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#FFD700]/50" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-[#FFD700] mb-2 tracking-wider">
                  {profile.name}
                </h2>
                <p className="text-xl text-[#FFA500] tracking-[0.15em] mb-4">
                  {profile.nameEn}
                </p>
                <p className="text-[#f0f0f0]/80 text-sm tracking-widest">
                  {profile.title}
                </p>
              </div>

              <div className="gold-divider" />

              <div className="space-y-4 text-[#f0f0f0]/80 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[1200px] mx-auto">
          <div className="ornament mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFD700] tracking-wider">
              EDUCATION
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {education.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                description={item.description}
                variant="velvet"
              >
                <div className="text-[#FFD700] text-sm font-bold tracking-wider">
                  {item.year}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="ornament mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFD700] tracking-wider">
              AWARDS & HONORS
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <Card
                key={index}
                title={award.title}
                description={award.description}
                variant="stage"
              >
                <div className="text-[#FFD700] text-lg font-bold tracking-wider">
                  {award.year}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-6 theater-frame">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="velvet-card p-12">
            <svg className="w-12 h-12 text-[#FFD700]/30 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-xl md:text-2xl text-[#f0f0f0]/90 leading-relaxed mb-6 italic">
              音楽は言葉を超えた対話。<br />
              一音一音に心を込めて、聴く人の魂に届ける。<br />
              それが私の使命です。
            </p>
            <p className="text-[#FFD700] tracking-widest">
              — MASASHI ENOKIDA
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
