import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CONCERT',
  description:
    'ピアニスト榎田雅士のコンサート情報。今後の公演予定と過去の演奏会をご紹介します。',
};

// Upcoming concerts data
const upcomingConcerts = [
  {
    id: 1,
    title: '東京秋のリサイタル2024「甘い想い出」',
    date: '2024-12-15',
    time: '14:00開演（13:30開場）',
    venue: '東京文化会館 小ホール',
    address: '東京都台東区上野公園5-45',
    image: 'https://picsum.photos/seed/venue-tokyo-bunka/900/450',
    program: [
      'ショパン: ノクターン 第2番 変ホ長調 Op.9-2',
      'リスト: 愛の夢 第3番',
      'ドビュッシー: 月の光',
      'シューマン: トロイメライ',
      'ラフマニノフ: ピアノ協奏曲第2番より（抜粋）',
    ],
    price: '一般 4,000円 / 学生 2,500円',
    ticketUrl: '#',
    note: 'サポーターズクラブ会員は10%OFF',
  },
  {
    id: 2,
    title: '新春リサイタル2025',
    date: '2025-01-18',
    time: '15:00開演（14:30開場）',
    venue: '横浜みなとみらいホール 小ホール',
    address: '神奈川県横浜市西区みなとみらい2-3-6',
    image: 'https://picsum.photos/seed/venue-minatomirai/900/450',
    program: [
      'ベートーヴェン: ピアノソナタ第14番「月光」',
      'ショパン: バラード第1番 ト短調 Op.23',
      'リスト: ラ・カンパネラ',
    ],
    price: '一般 4,500円 / 学生 3,000円',
    ticketUrl: '#',
    note: null,
  },
];

// Past concerts data
const pastConcerts = [
  {
    year: 2024,
    concerts: [
      {
        date: '2024-10-20',
        title: '秋の名曲コンサート',
        venue: '神奈川県立音楽堂',
      },
      {
        date: '2024-09-15',
        title: 'ピアノリサイタル in 宮崎',
        venue: '宮崎市民文化ホール',
      },
      {
        date: '2024-06-08',
        title: '初夏のサロンコンサート',
        venue: 'カワイ表参道コンサートサロン',
      },
    ],
  },
  {
    year: 2023,
    concerts: [
      {
        date: '2023-11-12',
        title: '東京秋のリサイタル2023「ふなうた」',
        venue: '東京文化会館 小ホール',
      },
      {
        date: '2023-08-20',
        title: 'サマーコンサート',
        venue: '大分県立芸術会館',
      },
      {
        date: '2023-05-14',
        title: 'スプリングリサイタル',
        venue: '紀尾井ホール',
      },
    ],
  },
];

export default function ConcertsPage() {
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
            {upcomingConcerts.map((concert) => (
              <article key={concert.id} className="card overflow-hidden">
                {/* Venue Photo */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={concert.image}
                    alt={concert.venue}
                    className="w-full h-full object-cover"
                  />
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
                    <div className="flex items-center gap-3 text-taupe text-sm">
                      <Clock size={16} className="flex-shrink-0" />
                      <span>{concert.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-taupe text-sm">
                      <MapPin size={16} className="flex-shrink-0" />
                      <span>
                        {concert.venue}
                        <br />
                        <span className="text-xs">{concert.address}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-taupe text-sm">
                      <Ticket size={16} className="flex-shrink-0" />
                      <span>{concert.price}</span>
                    </div>
                  </div>

                  {/* Program */}
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

                  {concert.note && (
                    <p className="text-burgundy-accent text-sm mb-6">
                      ※ {concert.note}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <Link href={concert.ticketUrl} className="btn btn-primary">
                      チケットを購入
                    </Link>
                    <Link href="/supporters/" className="btn btn-outline">
                      会員割引について
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Strip - Performance moments */}
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
      <section className="section-padding bg-burgundy">
        <div className="container">
          <h2 className="text-center mb-16">PAST CONCERTS</h2>

          <div className="max-w-3xl mx-auto">
            {pastConcerts.map((yearGroup) => (
              <div key={yearGroup.year} className="mb-12 last:mb-0">
                <h3 className="text-burgundy-accent text-lg mb-6">
                  {yearGroup.year}
                </h3>

                <div className="space-y-4">
                  {yearGroup.concerts.map((concert, index) => (
                    <div
                      key={index}
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

            <div className="text-center mt-12">
              <Link href="/history/" className="btn btn-outline">
                すべての活動履歴を見る
              </Link>
            </div>
          </div>
        </div>
      </section>

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
