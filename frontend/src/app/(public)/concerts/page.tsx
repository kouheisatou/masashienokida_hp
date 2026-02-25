'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { getAllConcerts, type Concert } from '@/lib/api-client';

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllConcerts()
      .then(setConcerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcomingConcerts = concerts.filter((c) => c.is_upcoming);
  const pastConcerts = concerts.filter((c) => !c.is_upcoming);

  // Group past concerts by year
  const pastByYear = pastConcerts.reduce<Record<number, Concert[]>>((acc, c) => {
    const year = new Date(c.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(c);
    return acc;
  }, {});

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-80 flex items-end pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/concert-hero/1600/600)',
            filter: 'brightness(0.45)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/20 to-transparent" />
        <div className="relative z-10 container">
          <h1 className="mb-4">CONCERT</h1>
          <p className="text-taupe max-w-2xl">
            今後の公演予定と過去の演奏会をご紹介します。
            サポーターズクラブ会員は優先予約・割引特典があります。
          </p>
        </div>
      </section>

      {/* Upcoming Concerts */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <h2 className="text-center mb-16">UPCOMING</h2>

          <div className="max-w-4xl mx-auto space-y-12">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-taupe">読み込み中...</p>
              </div>
            ) : upcomingConcerts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-taupe">近日開催のコンサート情報をお待ちください</p>
              </div>
            ) : (
              upcomingConcerts.map((concert) => (
                <article key={concert.id} className="card overflow-hidden">
                  {/* Venue Photo */}
                  <div className="relative h-56 overflow-hidden">
                    {concert.image_url ? (
                      <img
                        src={concert.image_url}
                        alt={concert.venue}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-burgundy-light" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-burgundy-black/70 to-transparent" />
                    <div className="absolute top-6 left-8">
                      <div className="text-5xl text-white font-light leading-none">
                        {new Date(concert.date).getDate()}
                      </div>
                      <div className="text-taupe text-sm uppercase mt-1">
                        {new Date(concert.date).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-xl mb-4">{concert.title}</h3>

                    <div className="space-y-2 mb-6">
                      {concert.time && (
                        <div className="flex items-center gap-3 text-taupe text-sm">
                          <Clock size={16} className="flex-shrink-0" />
                          <span>{concert.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-taupe text-sm">
                        <MapPin size={16} className="flex-shrink-0" />
                        <span>
                          {concert.venue}
                          {concert.address && (
                            <>
                              <br />
                              <span className="text-xs">{concert.address}</span>
                            </>
                          )}
                        </span>
                      </div>
                      {concert.price && (
                        <div className="flex items-center gap-3 text-taupe text-sm">
                          <Ticket size={16} className="flex-shrink-0" />
                          <span>{concert.price}</span>
                        </div>
                      )}
                    </div>

                    {/* Program */}
                    {concert.program && concert.program.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm text-white mb-3">PROGRAM</h4>
                        <ul className="space-y-1">
                          {concert.program.map((item, index) => (
                            <li key={index} className="text-taupe text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {concert.note && (
                      <p className="text-burgundy-accent text-sm mb-6">
                        ※ {concert.note}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4">
                      {concert.ticket_url && (
                        <a href={concert.ticket_url} className="btn btn-primary">
                          チケットを購入
                        </a>
                      )}
                      <Link href="/supporters/" className="btn btn-outline">
                        会員割引について
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Photo Strip */}
      <section>
        <div className="grid grid-cols-3">
          {[
            'concert-moment-1',
            'concert-moment-2',
            'concert-moment-3',
          ].map((seed) => (
            <div key={seed} className="relative aspect-[4/3] overflow-hidden group">
              <img
                src={`https://picsum.photos/seed/${seed}/600/450`}
                alt="演奏風景"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-burgundy-black/30 group-hover:bg-burgundy-black/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Ticket Info */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">TICKET INFO</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg mb-4">一般販売</h3>
                <p className="text-taupe text-sm leading-relaxed">
                  各公演の1ヶ月前より販売開始。
                  <br />
                  各種プレイガイド、会場窓口にてお求めいただけます。
                </p>
              </div>

              <div className="card p-6 border-burgundy-accent">
                <h3 className="text-lg mb-4">会員先行予約</h3>
                <p className="text-taupe text-sm leading-relaxed">
                  サポーターズクラブ会員は一般発売の1週間前より先行予約可能。
                  <br />
                  ゴールド会員は10%割引。
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/supporters/" className="text-burgundy-accent hover:text-white transition-colors text-sm">
                サポーターズクラブについて詳しく見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Past Concerts */}
      {pastConcerts.length > 0 && (
        <section className="section-padding bg-burgundy">
          <div className="container">
            <h2 className="text-center mb-16">PAST CONCERTS</h2>

            <div className="max-w-3xl mx-auto">
              {Object.entries(pastByYear)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([year, yearConcerts]) => (
                  <div key={year} className="mb-12 last:mb-0">
                    <h3 className="text-burgundy-accent text-lg mb-6">{year}</h3>

                    <div className="space-y-4">
                      {yearConcerts.map((concert) => (
                        <div
                          key={concert.id}
                          className="flex gap-6 pb-4 border-b border-burgundy-border last:border-0"
                        >
                          <div className="w-24 flex-shrink-0 text-taupe text-sm">
                            {new Date(concert.date).toLocaleDateString('ja-JP', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div>
                            <p className="text-beige mb-1">{concert.title}</p>
                            <p className="text-taupe text-sm">{concert.venue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Concert Request */}
      <section className="relative section-padding overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/concert-request-bg/1600/700)',
            filter: 'brightness(0.3)',
          }}
        />
        <div className="relative z-10 container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">コンサートのご依頼</h2>
            <p className="text-taupe leading-relaxed mb-8">
              リサイタル、企業イベント、学校公演、福祉施設でのボランティア公演など、
              <br />
              様々なご依頼を承っております。お気軽にお問い合わせください。
            </p>
            <p className="text-beige mb-8">
              日本全国47都道府県、どこでも参ります。
            </p>
            <Link href="/contact/" className="btn btn-primary">
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
