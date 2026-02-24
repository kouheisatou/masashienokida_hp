import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, MapPin, Music } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HISTORY',
  description:
    'ピアニスト榎田雅士の活動履歴。東京秋のリサイタルシリーズをはじめとする、これまでの演奏会記録をご覧いただけます。',
};

// Tokyo Autumn Recital Series data (2013-2024)
const tokyoAutumnRecitals = [
  {
    year: 2024,
    title: '東京秋のリサイタル2024「甘い想い出」',
    date: '2024-12-15',
    venue: '東京文化会館 小ホール',
    program: [
      'ショパン: ノクターン 第2番 変ホ長調 Op.9-2',
      'リスト: 愛の夢 第3番',
      'ドビュッシー: 月の光',
      'シューマン: トロイメライ',
      'ラフマニノフ: ピアノ協奏曲第2番より（抜粋）',
    ],
  },
  {
    year: 2023,
    title: '東京秋のリサイタル2023「ふなうた」',
    date: '2023-11-12',
    venue: '東京文化会館 小ホール',
    program: [
      'シューマン: 舟歌 嬰ヘ長調 Op.13',
      'ショパン: 舟歌 嬰ヘ長調 Op.60',
      'メンデルスゾーン: 無言歌集より「ヴェネツィアの舟歌」',
      'フォーレ: 舟歌 第1番 イ短調 Op.26',
    ],
  },
  {
    year: 2022,
    title: '東京秋のリサイタル2022',
    date: '2022-11-20',
    venue: '東京文化会館 小ホール',
    program: [
      'ベートーヴェン: ピアノソナタ第8番「悲愴」',
      'ショパン: バラード第4番 ヘ短調 Op.52',
      'リスト: ハンガリー狂詩曲 第2番',
    ],
  },
  {
    year: 2021,
    title: '東京秋のリサイタル2021',
    date: '2021-11-14',
    venue: '東京文化会館 小ホール',
    program: [
      'モーツァルト: ピアノソナタ第11番「トルコ行進曲付き」',
      'ベートーヴェン: ピアノソナタ第14番「月光」',
      'ショパン: 幻想即響曲 Op.66',
    ],
  },
  {
    year: 2020,
    title: '東京秋のリサイタル2020',
    date: '2020-11-15',
    venue: '東京文化会館 小ホール',
    note: '無観客配信公演',
    program: [
      'ドビュッシー: ベルガマスク組曲',
      'サティ: ジムノペディ 第1番',
      'ラヴェル: 水の戯れ',
    ],
  },
  {
    year: 2019,
    title: '東京秋のリサイタル2019',
    date: '2019-11-10',
    venue: '東京文化会館 小ホール',
    program: [
      'シューベルト: 即興曲集 D.899',
      'ブラームス: 間奏曲 Op.118-2',
      'リスト: ラ・カンパネラ',
    ],
  },
  {
    year: 2018,
    title: '東京秋のリサイタル2018',
    date: '2018-11-11',
    venue: '東京文化会館 小ホール',
    program: [
      'ダン・フー・ファク: 主題と変奏（日本初演）',
      'ショパン: ピアノソナタ第2番「葬送」',
      'ラフマニノフ: 楽興の時 Op.16',
    ],
    highlight: 'ダン・フー・ファク氏より献呈作品を日本初演',
  },
  {
    year: 2017,
    title: '東京秋のリサイタル2017',
    date: '2017-11-12',
    venue: '東京文化会館 小ホール',
    program: [
      'シューマン: トロイメライ',
      'ショパン: 夜想曲集',
      'リスト: 愛の夢 全3曲',
    ],
    highlight: 'CD「トロイメライ」発売記念',
  },
  {
    year: 2016,
    title: '東京秋のリサイタル2016',
    date: '2016-11-13',
    venue: '東京文化会館 小ホール',
    program: [
      'バッハ: イタリア協奏曲 BWV971',
      'ベートーヴェン: ピアノソナタ第23番「熱情」',
      'ショパン: 英雄ポロネーズ Op.53',
    ],
  },
  {
    year: 2015,
    title: '東京秋のリサイタル2015',
    date: '2015-11-08',
    venue: '東京文化会館 小ホール',
    program: [
      'モーツァルト: ピアノソナタ第16番 K.545',
      'ショパン: バラード第1番 ト短調 Op.23',
      'プロコフィエフ: ピアノソナタ第7番「戦争ソナタ」',
    ],
  },
  {
    year: 2014,
    title: '東京秋のリサイタル2014',
    date: '2014-11-09',
    venue: '東京文化会館 小ホール',
    program: [
      'カザルス: 鳥の歌（榎田編曲）',
      'バッハ: 無伴奏チェロ組曲より（榎田編曲）',
      'ショパン: ワルツ集',
    ],
    highlight: 'CD「P.カザルスへのオマージュ」発売記念',
  },
  {
    year: 2013,
    title: '東京秋のリサイタル2013',
    date: '2013-11-10',
    venue: '東京文化会館 小ホール',
    program: [
      'ベートーヴェン: ピアノソナタ第21番「ワルトシュタイン」',
      'ショパン: スケルツォ第2番 変ロ短調 Op.31',
      'リスト: メフィスト・ワルツ 第1番',
    ],
    highlight: '東京秋のリサイタルシリーズ開始',
  },
];

// Other notable performances
const otherPerformances = [
  {
    year: 2024,
    events: [
      { date: '2024-10-20', title: '秋の名曲コンサート', venue: '神奈川県立音楽堂' },
      { date: '2024-09-15', title: 'ピアノリサイタル in 宮崎', venue: '宮崎市民文化ホール' },
      { date: '2024-06-08', title: '初夏のサロンコンサート', venue: 'カワイ表参道コンサートサロン' },
    ],
  },
  {
    year: 2023,
    events: [
      { date: '2023-08-20', title: 'サマーコンサート', venue: '大分県立芸術会館' },
      { date: '2023-05-14', title: 'スプリングリサイタル', venue: '紀尾井ホール' },
      { date: '2023-03-12', title: 'ピアノトリオの夕べ', venue: 'すみだトリフォニーホール' },
    ],
  },
  {
    year: 2022,
    events: [
      { date: '2022-07-16', title: '夏のソナタ', venue: 'サントリーホール ブルーローズ' },
      { date: '2022-04-10', title: '春爛漫コンサート', venue: '横浜みなとみらいホール' },
    ],
  },
];

// International performances
const internationalPerformances = [
  { year: 2019, country: 'ポーランド', venue: 'ワルシャワ・フィルハーモニー', event: 'ショパン・フェスティバル', seed: 'intl-poland' },
  { year: 2018, country: 'ベトナム', venue: 'ハノイ国立音楽院', event: '日越文化交流コンサート', seed: 'intl-vietnam' },
  { year: 2017, country: 'イタリア', venue: 'ミラノ・コンセルヴァトーリオ', event: 'アジアン・ピアニスト・シリーズ', seed: 'intl-italy' },
  { year: 2016, country: '中国', venue: '上海コンサートホール', event: '日中友好コンサート', seed: 'intl-china' },
  { year: 2015, country: '韓国', venue: 'ソウル芸術の殿堂', event: '東アジア音楽祭', seed: 'intl-korea' },
  { year: 2014, country: 'タイ', venue: 'バンコク文化センター', event: 'ASEAN音楽祭', seed: 'intl-thailand' },
];

export default function HistoryPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-72 flex items-end pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/history-hero/1600/600)',
            filter: 'brightness(0.4)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/20 to-transparent" />
        <div className="relative z-10 container">
          <h1 className="mb-4">HISTORY</h1>
          <p className="text-taupe max-w-2xl">
            2013年より続く東京秋のリサイタルシリーズを中心に、
            これまでの演奏活動をご覧いただけます。
          </p>
        </div>
      </section>

      {/* Tokyo Autumn Recital Series */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4">東京秋のリサイタルシリーズ</h2>
              <p className="text-taupe">
                2013年より毎年秋に開催している東京文化会館でのリサイタルシリーズ。
                <br />
                毎回テーマを設け、様々な作品をお届けしています。
              </p>
            </div>

            <div className="space-y-8">
              {tokyoAutumnRecitals.map((recital) => (
                <article key={recital.year} className="card p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Year */}
                    <div className="md:w-24 flex-shrink-0">
                      <span className="text-3xl text-burgundy-accent font-light">
                        {recital.year}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <h3 className="text-lg mb-3">{recital.title}</h3>

                      <div className="flex flex-wrap gap-4 text-taupe text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>
                            {new Date(recital.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{recital.venue}</span>
                        </div>
                      </div>

                      {recital.highlight && (
                        <p className="text-burgundy-accent text-sm mb-4">
                          {recital.highlight}
                        </p>
                      )}

                      {recital.note && (
                        <p className="text-taupe text-sm mb-4">※ {recital.note}</p>
                      )}

                      {/* Program */}
                      <div>
                        <div className="flex items-center gap-2 text-xs text-taupe mb-2">
                          <Music size={12} />
                          <span>PROGRAM</span>
                        </div>
                        <ul className="space-y-1">
                          {recital.program.map((item, index) => (
                            <li key={index} className="text-beige text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* International Performances */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">海外公演</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internationalPerformances.map((perf, index) => (
                <div key={index} className="card overflow-hidden group">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={`https://picsum.photos/seed/${perf.seed}/600/338`}
                      alt={`${perf.country} 公演`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-burgundy-accent text-sm font-light">{perf.year}</span>
                      <div>
                        <p className="text-beige font-medium">{perf.country}</p>
                        <p className="text-taupe text-sm">{perf.venue}</p>
                        <p className="text-taupe text-xs mt-1">{perf.event}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Other Performances */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">その他の公演</h2>

            {otherPerformances.map((yearGroup) => (
              <div key={yearGroup.year} className="mb-10 last:mb-0">
                <h3 className="text-burgundy-accent text-lg mb-4">
                  {yearGroup.year}
                </h3>

                <div className="space-y-3">
                  {yearGroup.events.map((event, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-3 border-b border-burgundy-border last:border-0"
                    >
                      <div className="w-20 flex-shrink-0 text-taupe text-sm">
                        {new Date(event.date).toLocaleDateString('ja-JP', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div>
                        <p className="text-beige">{event.title}</p>
                        <p className="text-taupe text-sm">{event.venue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discography */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">ディスコグラフィ</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://picsum.photos/seed/disc-traumerei/500/500"
                    alt="トロイメライ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg mb-2">トロイメライ</h3>
                  <p className="text-taupe text-sm mb-2">2017年リリース</p>
                  <p className="text-beige text-sm">
                    シューマンの名曲「トロイメライ」を中心に、
                    夢見るような美しい作品を収録。
                  </p>
                </div>
              </div>

              <div className="card overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src="https://picsum.photos/seed/disc-casals/500/500"
                    alt="P.カザルスへのオマージュ"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg mb-2">P.カザルスへのオマージュ</h3>
                  <p className="text-taupe text-sm mb-2">2014年リリース</p>
                  <p className="text-beige text-sm">
                    伝説のチェリスト、パブロ・カザルスへの敬意を込めた
                    ピアノ編曲作品集。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-6">今後の公演予定</h2>
            <p className="text-taupe mb-8">
              最新のコンサート情報は、コンサートページをご覧ください。
              <br />
              サポーターズクラブ会員はチケットの先行予約・割引特典があります。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/concerts/" className="btn btn-primary">
                コンサート情報
              </Link>
              <Link href="/supporters/" className="btn btn-outline">
                サポーターズクラブ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
