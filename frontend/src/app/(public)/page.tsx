import Link from 'next/link';
import { Calendar, MapPin, Music, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/hero-piano/1920/1080)',
            filter: 'brightness(0.5)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy-black/40 to-burgundy-black" />

        <div className="relative container text-center z-10 pt-20">
          <h1 className="text-hero text-white mb-6 animate-fade-in">
            榎田雅士
          </h1>
          <p className="text-2xl text-beige tracking-[0.3em] mb-8 animate-fade-in">
            PIANIST
          </p>
          <p className="text-taupe max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in">
            音楽は言葉を超えて心に響く。
            <br />
            一音一音に魂を込めて、皆様の心に届く演奏を。
          </p>
          <div className="flex justify-center gap-4 animate-fade-in">
            <Link href="/concerts/" className="btn btn-primary">
              コンサート情報
            </Link>
            <Link href="/biography/" className="btn btn-outline">
              プロフィール
            </Link>
          </div>
        </div>
      </section>

      {/* Artist Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Photo */}
            <div className="relative">
              <img
                src="https://picsum.photos/seed/pianist-portrait/700/875"
                alt="榎田雅士"
                className="w-full aspect-[4/5] object-cover rounded"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-burgundy-accent opacity-40 rounded" />
            </div>

            {/* Text */}
            <div>
              <p className="text-taupe tracking-[0.3em] text-sm mb-4">PIANIST</p>
              <h2 className="mb-8">榎田雅士</h2>
              <div className="space-y-4 text-beige leading-relaxed">
                <p>
                  1986年、宮崎県小林市生まれ。愛知県立芸術大学を経て、
                  カリフォルニア大学ロサンゼルス校（UCLA）にてヴィタリー・マルグリス氏に師事。
                </p>
                <p>
                  ポーランド、イタリア、ベトナムなど国内外で演奏活動を展開。
                  繊細で深みのある音楽表現で聴衆を魅了し続けている。
                </p>
              </div>
              <Link href="/biography/" className="btn btn-outline mt-8 inline-block">
                プロフィールを読む →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <h2 className="text-center mb-16">LATEST NEWS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card 1 */}
            <article className="card overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="https://picsum.photos/seed/news-concert/600/338"
                  alt="東京秋のリサイタル2024"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-taupe text-sm mb-3">
                  <Calendar size={14} />
                  <time>2024.12.15</time>
                </div>
                <h3 className="text-lg mb-3">
                  東京秋のリサイタル2024 開催決定
                </h3>
                <p className="text-taupe text-sm leading-relaxed">
                  2024年秋のリサイタルシリーズ「甘い想い出」の開催が決定しました。
                  チケットは会員先行予約を開始しています。
                </p>
              </div>
            </article>

            {/* News Card 2 */}
            <article className="card overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="https://picsum.photos/seed/news-radio/600/338"
                  alt="ラジオ出演"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-taupe text-sm mb-3">
                  <Music size={14} />
                  <time>2024.11.20</time>
                </div>
                <h3 className="text-lg mb-3">ラジオ出演情報</h3>
                <p className="text-taupe text-sm leading-relaxed">
                  NHK-FM「クラシックカフェ」に出演します。
                  新作CDの曲目を中心にお話しします。
                </p>
              </div>
            </article>

            {/* News Card 3 */}
            <article className="card overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img
                  src="https://picsum.photos/seed/news-supporters/600/338"
                  alt="サポーターズクラブ"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-taupe text-sm mb-3">
                  <Users size={14} />
                  <time>2024.10.01</time>
                </div>
                <h3 className="text-lg mb-3">
                  サポーターズクラブ会員募集中
                </h3>
                <p className="text-taupe text-sm leading-relaxed">
                  榎田雅士の活動を応援してくださる
                  サポーターズクラブ会員を募集しています。
                </p>
              </div>
            </article>
          </div>

          <div className="text-center mt-12">
            <Link href="/blog/" className="btn btn-outline">
              すべてのお知らせを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Photo Gallery Strip */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { seed: 'gallery-piano-1', label: 'コンサート' },
            { seed: 'gallery-stage', label: 'ステージ' },
            { seed: 'gallery-piano-2', label: 'リサイタル' },
            { seed: 'gallery-backstage', label: '演奏後' },
          ].map((item) => (
            <div key={item.seed} className="relative aspect-square overflow-hidden group">
              <img
                src={`https://picsum.photos/seed/${item.seed}/600/600`}
                alt={item.label}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-burgundy-black/40 group-hover:bg-burgundy-black/20 transition-colors duration-500" />
              <span className="absolute bottom-4 left-4 text-white text-sm tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Concerts Section */}
      <section className="section-padding">
        <div className="container">
          <h2 className="text-center mb-16">UPCOMING CONCERTS</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Concert Item */}
            <div className="card overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://picsum.photos/seed/concert-hall-tokyo/900/400"
                  alt="東京文化会館"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-burgundy-black/80 to-transparent" />
                <div className="absolute inset-0 p-8 flex items-center">
                  <div className="text-center">
                    <div className="text-4xl text-white font-light">15</div>
                    <div className="text-taupe text-sm">DEC 2024</div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl mb-2">
                  東京秋のリサイタル2024 「甘い想い出」
                </h3>
                <div className="flex items-center gap-2 text-taupe text-sm mb-4">
                  <MapPin size={14} />
                  <span>東京文化会館 小ホール</span>
                </div>
                <p className="text-sm text-taupe mb-4">
                  ショパン: ノクターン / リスト: 愛の夢 / ドビュッシー: 月の光 他
                </p>
                <Link
                  href="/concerts/"
                  className="text-sm text-burgundy-accent hover:text-white transition-colors"
                >
                  詳細を見る →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/concerts/" className="btn btn-outline">
              すべてのコンサートを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Discography Section */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <h2 className="text-center mb-16">DISCOGRAPHY</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Album 1 */}
            <div className="card overflow-hidden group">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://picsum.photos/seed/album-traumerei/500/500"
                  alt="トロイメライ"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg mb-2">トロイメライ</h3>
                <p className="text-taupe text-sm mb-4">2017年発売</p>
                <p className="text-sm text-taupe">
                  シューマン、ブラームス、リストの珠玉の小品集
                </p>
              </div>
            </div>

            {/* Album 2 */}
            <div className="card overflow-hidden group">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://picsum.photos/seed/album-casals/500/500"
                  alt="カザルスへのオマージュ"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg mb-2">カザルスへのオマージュ</h3>
                <p className="text-taupe text-sm mb-4">2014年発売</p>
                <p className="text-sm text-taupe">
                  チェロの巨匠に捧げるピアノ作品集
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supporters CTA Section */}
      <section className="relative section-padding overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/supporters-bg/1600/800)',
            filter: 'brightness(0.3)',
          }}
        />
        <div className="relative z-10 container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">SUPPORTERS CLUB</h2>
            <p className="text-taupe leading-relaxed mb-8">
              榎田雅士の音楽活動を応援してくださるサポーターを募集しています。
              <br />
              会員限定の特典やイベントをご用意しております。
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/supporters/" className="btn btn-primary">
                詳しく見る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
