'use client';

import Button from '@/components/Button';

export default function DiscographyPage() {
  const albums = [
    {
      id: '1',
      title: 'Nocturne - ショパン: 夜想曲全集',
      year: '2025',
      label: 'Sony Classical',
      coverColor: 'from-[#1a1a2e] to-[#16213e]',
      tracks: [
        'ノクターン 第1番 変ロ短調 Op.9-1',
        'ノクターン 第2番 変ホ長調 Op.9-2',
        'ノクターン 第3番 ロ長調 Op.9-3',
        'ノクターン 第4番 ヘ長調 Op.15-1',
        'ノクターン 第5番 嬰ヘ長調 Op.15-2',
        'ノクターン 第20番 嬰ハ短調「遺作」',
      ],
      description: 'ショパンの夜想曲全21曲を収録した集大成アルバム。静謐な夜の世界を、繊細なタッチで紡ぎ出す。',
      awards: ['レコード芸術 特選盤', '音楽現代 推薦盤'],
      streamingLinks: {
        spotify: '#',
        appleMusic: '#',
        amazon: '#',
      },
    },
    {
      id: '2',
      title: 'ラヴェル: 鏡、夜のガスパール',
      year: '2023',
      label: 'Deutsche Grammophon',
      coverColor: 'from-[#0f3460] to-[#533483]',
      tracks: [
        '鏡 第1曲「蛾」',
        '鏡 第2曲「悲しい鳥たち」',
        '鏡 第3曲「海原の小舟」',
        '鏡 第4曲「道化師の朝の歌」',
        '鏡 第5曲「鐘の谷」',
        '夜のガスパール より「オンディーヌ」',
        '夜のガスパール より「絞首台」',
        '夜のガスパール より「スカルボ」',
      ],
      description: 'ラヴェルの色彩豊かな音世界を、卓越した技巧と深い音楽性で表現。',
      awards: ['グラミー賞 最優秀器楽ソロアルバム部門ノミネート'],
      streamingLinks: {
        spotify: '#',
        appleMusic: '#',
        amazon: '#',
      },
    },
    {
      id: '3',
      title: 'リスト: 巡礼の年',
      year: '2019',
      label: 'Universal Music',
      coverColor: 'from-[#2d4059] to-[#ea5455]',
      tracks: [
        '巡礼の年 第1年「スイス」より',
        '第1曲「ウィリアム・テルの聖堂」',
        '第6曲「オーベルマンの谷」',
        '第9曲「ジュネーヴの鐘」',
        '巡礼の年 第2年「イタリア」より',
        '第1曲「婚礼」',
        '第4曲「ペトラルカのソネット 第47番」',
        '第7曲「ダンテを読んで - ソナタ風幻想曲」',
      ],
      description: 'リストの壮大な巡礼の旅を、豊かな表現力で描き出す。',
      awards: ['レコード芸術 特選盤', '音楽之友社賞'],
      streamingLinks: {
        spotify: '#',
        appleMusic: '#',
        amazon: '#',
      },
    },
    {
      id: '4',
      title: 'ショパン: 夜想曲集',
      year: '2015',
      label: 'Sony Classical',
      coverColor: 'from-[#222831] to-[#393e46]',
      tracks: [
        'ノクターン 第2番 変ホ長調 Op.9-2',
        'ノクターン 第5番 嬰ヘ長調 Op.15-2',
        'ノクターン 第8番 変ニ長調 Op.27-2',
        'ノクターン 第13番 ハ短調 Op.48-1',
        'ノクターン 第20番 嬰ハ短調「遺作」',
        'バラード 第1番 ト短調 Op.23',
      ],
      description: 'デビューアルバム。若き日の情熱と、ショパンへの深い愛情が込められた1枚。',
      awards: ['レコード芸術 特選盤', '新人賞受賞記念アルバム'],
      streamingLinks: {
        spotify: '#',
        appleMusic: '#',
        amazon: '#',
      },
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              DISCOGRAPHY
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            音楽への想いを形にした、珠玉のアルバムたち
          </p>
        </div>
      </section>

      {/* Albums Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto space-y-20">
          {albums.map((album, index) => (
            <div
              key={album.id}
              className="group"
            >
              <div className={`grid md:grid-cols-5 gap-8 md:gap-12 ${
                index % 2 === 1 ? 'md:grid-flow-dense' : ''
              }`}>
                {/* Album Cover */}
                <div className={`md:col-span-2 ${index % 2 === 1 ? 'md:col-start-4' : ''}`}>
                  <div className="relative aspect-square rounded overflow-hidden border-2 border-[#FFD700]/30 group-hover:border-[#FFD700]/60 transition-all duration-500">
                    {/* Gradient placeholder */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${album.coverColor}`} />

                    {/* Album info overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <div className="text-[#FFD700]/80 text-6xl mb-4">♪</div>
                      <div className="text-[#f0f0f0] text-lg font-bold mb-2">
                        {album.title}
                      </div>
                      <div className="text-[#FFD700]/70 text-sm">
                        {album.year}
                      </div>
                    </div>

                    {/* Decorative corners */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#FFD700]/40" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#FFD700]/40" />

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                {/* Album Details */}
                <div className={`md:col-span-3 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                  <div className="velvet-card p-8 md:p-10 h-full">
                    {/* Title & Year */}
                    <div className="mb-6">
                      <h2 className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-3 leading-tight">
                        {album.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#f0f0f0]/70">
                        <span className="text-[#FFA500] font-bold">{album.year}</span>
                        <span className="text-[#FFD700]/50">•</span>
                        <span>{album.label}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[#f0f0f0]/80 leading-relaxed mb-6">
                      {album.description}
                    </p>

                    {/* Awards */}
                    {album.awards && album.awards.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-[#FFA500] tracking-wider mb-3">
                          AWARDS & RECOGNITION
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {album.awards.map((award, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 text-xs bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded"
                            >
                              {award}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Track List */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-[#FFA500] tracking-wider mb-3">
                        TRACK LIST
                      </h4>
                      <ul className="space-y-2">
                        {album.tracks.map((track, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm text-[#f0f0f0]/80"
                          >
                            <span className="text-[#FFD700]/50 font-mono text-xs mt-0.5 min-w-[20px]">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span>{track}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="gold-divider my-6" />

                    {/* Streaming Links */}
                    <div>
                      <h4 className="text-sm font-bold text-[#FFA500] tracking-wider mb-4">
                        LISTEN NOW
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                          Spotify
                        </Button>
                        <Button variant="outline" size="sm">
                          Apple Music
                        </Button>
                        <Button variant="outline" size="sm">
                          Amazon Music
                        </Button>
                        <Button variant="gold" size="sm">
                          購入する
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              {index < albums.length - 1 && (
                <div className="mt-20">
                  <div className="gold-divider" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#FFD700] mb-6 tracking-wider">
            最新情報をチェック
          </h2>
          <p className="text-[#f0f0f0]/80 mb-8 leading-relaxed">
            新譜情報やレコーディング秘話など、<br />
            サポーターズクラブ会員限定コンテンツをお楽しみいただけます。
          </p>
          <Button variant="velvet" size="lg">
            サポーターズクラブについて
          </Button>
        </div>
      </section>
    </div>
  );
}
