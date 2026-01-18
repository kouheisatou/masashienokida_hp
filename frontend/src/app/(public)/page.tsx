import Link from 'next/link';
import { Calendar, MapPin, Music, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image Placeholder */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero.jpg)',
            filter: 'brightness(0.6)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy-black/50 to-burgundy-black" />

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

      {/* Latest News Section */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <h2 className="text-center mb-16">LATEST NEWS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* News Card 1 */}
            <article className="card p-6">
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
            </article>

            {/* News Card 2 */}
            <article className="card p-6">
              <div className="flex items-center gap-2 text-taupe text-sm mb-3">
                <Music size={14} />
                <time>2024.11.20</time>
              </div>
              <h3 className="text-lg mb-3">ラジオ出演情報</h3>
              <p className="text-taupe text-sm leading-relaxed">
                NHK-FM「クラシックカフェ」に出演します。
                新作CDの曲目を中心にお話しします。
              </p>
            </article>

            {/* News Card 3 */}
            <article className="card p-6">
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
            </article>
          </div>

          <div className="text-center mt-12">
            <Link href="/blog/" className="btn btn-outline">
              すべてのお知らせを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Concerts Section */}
      <section className="section-padding">
        <div className="container">
          <h2 className="text-center mb-16">UPCOMING CONCERTS</h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Concert Item */}
            <div className="card p-8 flex flex-col md:flex-row gap-6">
              <div className="text-center md:text-left md:w-32 flex-shrink-0">
                <div className="text-3xl text-white">15</div>
                <div className="text-taupe text-sm">DEC 2024</div>
              </div>
              <div className="flex-grow">
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
              <div className="aspect-square bg-burgundy-light img-overlay">
                {/* Album cover placeholder */}
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
              <div className="aspect-square bg-burgundy-light img-overlay">
                {/* Album cover placeholder */}
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
      <section className="section-padding">
        <div className="container">
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
