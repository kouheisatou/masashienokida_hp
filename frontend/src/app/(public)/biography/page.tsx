import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BIOGRAPHY',
  description: 'ピアニスト榎田雅士のプロフィール。経歴、受賞歴、ディスコグラフィなどをご紹介します。',
};

export default function BiographyPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-center mb-16">BIOGRAPHY</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Profile Image */}
              <div className="md:col-span-1">
                <div className="aspect-[3/4] overflow-hidden rounded">
                  <img
                    src="https://picsum.photos/seed/enokida-profile/600/800"
                    alt="榎田雅士"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Text */}
              <div className="md:col-span-2">
                <h2 className="text-2xl mb-6">榎田 雅士</h2>
                <p className="text-taupe text-sm tracking-[0.2em] mb-8">
                  MASASHI ENOKIDA
                </p>

                <div className="space-y-6 text-beige leading-relaxed">
                  <p>
                    1986年、宮崎県小林市生まれ。
                  </p>
                  <p>
                    大分県立芸術緑丘高等学校音楽科を経て、愛知県立芸術大学音楽学部卒業、同大学大学院音楽研究科修了。
                  </p>
                  <p>
                    その後、カリフォルニア大学ロサンゼルス校（UCLA）にて、世界的ピアニスト
                    ヴィタリー・マルグリス氏に師事。
                  </p>
                  <p>
                    これまでにポーランド、イタリア、中国、韓国、タイ、ベトナムなど
                    国内外でリサイタル、オーケストラとの共演、室内楽で活躍。
                  </p>
                  <p>
                    2014年、CD「P.カザルスへのオマージュ」、2017年、CD「トロイメライ」をリリース。
                  </p>
                  <p>
                    2018年、ベトナムの作曲家ダン・フー・ファク氏より
                    ピアノ作品「主題と変奏」を献呈される。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Photo Gallery */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden group">
            <img
              src="https://picsum.photos/seed/bio-stage-1/800/600"
              alt="演奏風景"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-burgundy-black/30 group-hover:bg-burgundy-black/10 transition-colors duration-500" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden group">
            <img
              src="https://picsum.photos/seed/bio-piano-close/800/600"
              alt="ピアノ演奏"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-burgundy-black/30 group-hover:bg-burgundy-black/10 transition-colors duration-500" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden group">
            <img
              src="https://picsum.photos/seed/bio-bow/800/600"
              alt="カーテンコール"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-burgundy-black/30 group-hover:bg-burgundy-black/10 transition-colors duration-500" />
          </div>
        </div>
      </section>

      {/* English Profile */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center mb-12">Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              <div className="lg:col-span-3 space-y-6 text-beige leading-relaxed">
                <p>
                  Born in 1986 in Kobayashi, Miyazaki Prefecture, Japan.
                </p>
                <p>
                  Masashi Enokida graduated from Oita Prefectural Arts High School,
                  then received his Bachelor&apos;s and Master&apos;s degrees from Aichi
                  Prefectural University of Fine Arts and Music.
                </p>
                <p>
                  He furthered his studies at the University of California, Los Angeles
                  (UCLA), under the guidance of the world-renowned pianist Vitalij Margulis.
                </p>
                <p>
                  Enokida has performed recitals and collaborated with orchestras in
                  Poland, Italy, China, South Korea, Thailand, Vietnam, and throughout Japan.
                </p>
                <p>
                  He released two CDs: &quot;Hommage to Pablo Casals&quot; (2014) and
                  &quot;Träumerei&quot; (2017).
                </p>
                <p>
                  In 2018, Vietnamese composer Đặng Hữu Phúc dedicated the piano work
                  &quot;Theme and Variations&quot; to him.
                </p>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-[3/4] overflow-hidden rounded">
                  <img
                    src="https://picsum.photos/seed/bio-formal/500/667"
                    alt="榎田雅士 フォーマル"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline / Education */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-12">経歴</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                {[
                  { year: '1986', text: '宮崎県小林市に生まれる' },
                  { year: '2005', text: '大分県立芸術緑丘高等学校音楽科 卒業' },
                  { year: '2009', text: '愛知県立芸術大学音楽学部 卒業' },
                  { year: '2011', text: '愛知県立芸術大学大学院音楽研究科 修了' },
                  { year: '2012', text: 'カリフォルニア大学ロサンゼルス校（UCLA）にて研鑽' },
                  { year: '2013', text: '東京秋のリサイタルシリーズ開始' },
                  { year: '2014', text: 'CD「P.カザルスへのオマージュ」リリース' },
                  { year: '2017', text: 'CD「トロイメライ」リリース' },
                  { year: '2018', text: 'ダン・フー・ファク氏より「主題と変奏」献呈' },
                ].map((item) => (
                  <div key={item.year} className="flex gap-6">
                    <div className="w-20 flex-shrink-0 text-burgundy-accent">
                      {item.year}
                    </div>
                    <div className="text-beige">{item.text}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="aspect-[4/5] overflow-hidden rounded">
                  <img
                    src="https://picsum.photos/seed/bio-practice/600/750"
                    alt="練習風景"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src="https://picsum.photos/seed/bio-young/400/400"
                      alt="若き日の榎田雅士"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src="https://picsum.photos/seed/bio-overseas/400/400"
                      alt="海外公演"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">師事</h2>

            <div className="space-y-4 text-center">
              <p className="text-beige">ヴィタリー・マルグリス（UCLA）</p>
              <p className="text-taupe text-sm">
                ウラディミール・ホロヴィッツの系譜を継ぐ世界的ピアニスト
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
