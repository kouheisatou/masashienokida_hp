'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function ConcertsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingConcerts = [
    {
      id: '1',
      date: '2025-02-20',
      time: '19:00開演',
      title: 'ショパン・リサイタル',
      venue: '東京文化会館 小ホール',
      location: '東京',
      program: [
        'ショパン: バラード第1番 ト短調 Op.23',
        'ショパン: 夜想曲 第2番 変ホ長調 Op.9-2',
        'ショパン: スケルツォ第2番 変ロ短調 Op.31',
        'ショパン: ポロネーズ第6番「英雄」Op.53',
      ],
      ticketUrl: '#',
      status: '販売中',
    },
    {
      id: '2',
      date: '2025-03-15',
      time: '18:30開演',
      title: '協奏曲の夕べ',
      venue: 'サントリーホール',
      location: '東京',
      program: [
        'ラフマニノフ: ピアノ協奏曲第2番 ハ短調 Op.18',
      ],
      collaborator: '東京交響楽団',
      conductor: '指揮: 山田太郎',
      ticketUrl: '#',
      status: '販売中',
    },
    {
      id: '3',
      date: '2025-04-10',
      time: '19:00開演',
      title: 'ロマンティック・ピアノ・リサイタル',
      venue: 'いずみホール',
      location: '大阪',
      program: [
        'シューマン: 幻想曲 ハ長調 Op.17',
        'リスト: 巡礼の年 第2年「イタリア」より',
        'ブラームス: ピアノ・ソナタ第3番 ヘ短調 Op.5',
      ],
      ticketUrl: '#',
      status: '販売中',
    },
    {
      id: '4',
      date: '2025-05-22',
      time: '19:00開演',
      title: 'フランス音楽の夕べ',
      venue: '横浜みなとみらいホール',
      location: '神奈川',
      program: [
        'ドビュッシー: 映像 第1集',
        'ラヴェル: 夜のガスパール',
        'フォーレ: 夜想曲集より',
      ],
      ticketUrl: '#',
      status: '先行予約',
    },
  ];

  const pastConcerts = [
    {
      id: '1',
      date: '2024-12-15',
      title: 'クリスマス・スペシャル・コンサート',
      venue: '紀尾井ホール',
      location: '東京',
    },
    {
      id: '2',
      date: '2024-11-20',
      title: 'ベートーヴェン・リサイタル',
      venue: 'ザ・フェニックスホール',
      location: '大阪',
    },
    {
      id: '3',
      date: '2024-10-05',
      title: '室内楽の夕べ',
      venue: '王子ホール',
      location: '東京',
    },
    {
      id: '4',
      date: '2024-09-12',
      title: 'バッハからショパンへ',
      venue: '札幌コンサートホール Kitara',
      location: '北海道',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              CONCERTS
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            皆様との音楽的な出会いを、心よりお待ちしております
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 px-6 border-b border-[#FFD700]/20">
        <div className="max-w-[1200px] mx-auto flex justify-center gap-4">
          <Button
            variant={activeTab === 'upcoming' ? 'gold' : 'outline'}
            onClick={() => setActiveTab('upcoming')}
          >
            今後の公演
          </Button>
          <Button
            variant={activeTab === 'past' ? 'gold' : 'outline'}
            onClick={() => setActiveTab('past')}
          >
            過去の公演
          </Button>
        </div>
      </section>

      {/* Upcoming Concerts */}
      {activeTab === 'upcoming' && (
        <section className="py-20 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="space-y-8">
              {upcomingConcerts.map((concert) => (
                <div
                  key={concert.id}
                  className="velvet-card p-8 md:p-10 relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    <span className={`px-4 py-1.5 text-xs font-bold tracking-wider rounded ${
                      concert.status === '販売中'
                        ? 'bg-[#FFD700] text-black'
                        : 'bg-[#8B0000] text-[#FFD700] border border-[#FFD700]/30'
                    }`}>
                      {concert.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-12 gap-8">
                    {/* Date */}
                    <div className="md:col-span-3 text-center md:text-left">
                      <div className="inline-block velvet-card px-6 py-4 border-2 border-[#FFD700]/40">
                        <div className="text-4xl font-bold text-[#FFD700] mb-1">
                          {new Date(concert.date).getDate()}
                        </div>
                        <div className="text-sm text-[#FFA500] tracking-wider">
                          {new Date(concert.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-xs text-[#f0f0f0]/60 mt-2">
                          {concert.time}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-9 space-y-4">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-[#FFD700] mb-3">
                          {concert.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-[#f0f0f0]/80">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{concert.venue}</span>
                          </div>
                          <span className="text-[#FFD700]/50">•</span>
                          <span>{concert.location}</span>
                        </div>
                      </div>

                      {(concert.collaborator || concert.conductor) && (
                        <div className="text-sm text-[#f0f0f0]/70">
                          {concert.collaborator && <div>{concert.collaborator}</div>}
                          {concert.conductor && <div>{concert.conductor}</div>}
                        </div>
                      )}

                      {concert.program && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-[#FFA500] tracking-wider">
                            PROGRAM
                          </h4>
                          <ul className="space-y-1.5 text-sm text-[#f0f0f0]/80">
                            {concert.program.map((piece, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#FFD700]/50 mt-1.5">•</span>
                                <span>{piece}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4">
                        <Button variant="gold" size="sm">
                          チケット情報・予約
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-[#FFD700]/20" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-[#FFD700]/20" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Concerts */}
      {activeTab === 'past' && (
        <section className="py-20 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {pastConcerts.map((concert) => (
                <Card
                  key={concert.id}
                  title={concert.title}
                  variant="velvet"
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#FFD700]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(concert.date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[#f0f0f0]/80">
                      <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div>{concert.venue}</div>
                        <div className="text-xs text-[#f0f0f0]/60">{concert.location}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#FFD700] mb-6 tracking-wider">
            最新情報をお届け
          </h2>
          <p className="text-[#f0f0f0]/80 mb-8 leading-relaxed">
            サポーターズクラブ会員の方には、公演情報の先行案内やチケット優先予約など、<br />
            さまざまな特典をご用意しております。
          </p>
          <Button variant="velvet" size="lg">
            サポーターズクラブについて
          </Button>
        </div>
      </section>
    </div>
  );
}
