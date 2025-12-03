'use client';

export default function HistoryPage() {
  const timeline = [
    {
      year: '2003',
      title: 'ピアノとの出会い',
      description: '7歳でピアノを始める。地元の音楽教室にて基礎を学ぶ。',
      category: 'beginning',
    },
    {
      year: '2006',
      title: '初めてのコンクール入賞',
      description: '全日本学生音楽コンクール 小学生部門 第3位入賞',
      category: 'award',
    },
    {
      year: '2009',
      title: '日本音楽コンクール第1位',
      description: '日本音楽コンクール ピアノ部門にて第1位を受賞。併せて聴衆賞、審査員特別賞も受賞。',
      category: 'award',
    },
    {
      year: '2010',
      title: '東京藝術大学音楽学部卒業',
      description: 'ピアノ科を首席で卒業。卒業時に藝大賞を受賞。',
      category: 'education',
    },
    {
      year: '2011',
      title: 'ショパン国際ピアノコンクール',
      description: 'ショパン国際ピアノコンクール セミファイナリスト。ポーランド批評家賞を受賞。',
      category: 'award',
    },
    {
      year: '2012',
      title: '修士課程修了',
      description: '東京藝術大学大学院修士課程修了。室内楽、伴奏法を専攻。学長賞を受賞。',
      category: 'education',
    },
    {
      year: '2013',
      title: 'パリへ留学',
      description: 'パリ国立高等音楽院に留学。ピエール・ローラン教授に師事。',
      category: 'education',
    },
    {
      year: '2014',
      title: 'ロン=ティボー国際コンクール 第2位',
      description: 'ロン=ティボー国際コンクール 第2位入賞。フランス音楽最優秀演奏賞も受賞。',
      category: 'award',
    },
    {
      year: '2015',
      title: 'ファーストアルバム リリース',
      description: 'デビューアルバム「ショパン: 夜想曲集」をリリース。レコード芸術誌で特選盤に選出。',
      category: 'release',
    },
    {
      year: '2016',
      title: 'ヨーロッパツアー',
      description: 'パリ、ベルリン、ウィーンなど欧州5都市でリサイタルツアーを開催。',
      category: 'concert',
    },
    {
      year: '2017',
      title: 'オーケストラとの初共演',
      description: 'NHK交響楽団とラフマニノフ ピアノ協奏曲第2番を共演。',
      category: 'concert',
    },
    {
      year: '2018',
      title: '芸術選奨文部科学大臣新人賞',
      description: '芸術選奨文部科学大臣新人賞を音楽部門にて受賞。',
      category: 'award',
    },
    {
      year: '2019',
      title: 'セカンドアルバム リリース',
      description: 'アルバム「リスト: 巡礼の年」をリリース。',
      category: 'release',
    },
    {
      year: '2020',
      title: 'オンラインコンサート開催',
      description: 'パンデミック下で自宅からのオンラインコンサートを複数回開催。',
      category: 'concert',
    },
    {
      year: '2021',
      title: '全国ツアー',
      description: '日本全国12都市でのリサイタルツアーを開催。',
      category: 'concert',
    },
    {
      year: '2022',
      title: 'ベートーヴェン・チクルス',
      description: 'ベートーヴェン ピアノ・ソナタ全曲演奏会を1年かけて完遂。',
      category: 'concert',
    },
    {
      year: '2023',
      title: 'サードアルバム リリース',
      description: 'アルバム「ラヴェル: 鏡、夜のガスパール」をリリース。',
      category: 'release',
    },
    {
      year: '2024',
      title: 'デビュー15周年記念公演',
      description: 'サントリーホールにてデビュー15周年記念リサイタルを開催。',
      category: 'concert',
    },
    {
      year: '2025',
      title: '最新アルバム リリース',
      description: 'アルバム「Nocturne - ショパン: 夜想曲全集」をリリース。',
      category: 'release',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'award':
        return 'text-white border-[#8b4545]';
      case 'education':
        return 'text-[#87CEEB] border-[#87CEEB]';
      case 'release':
        return 'text-[#d4c4b0] border-[#8b4545]';
      case 'concert':
        return 'text-[#DDA0DD] border-[#DDA0DD]';
      default:
        return 'text-[#f0f0f0] border-[#f0f0f0]';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'award':
        return '受賞';
      case 'education':
        return '学歴';
      case 'release':
        return 'リリース';
      case 'concert':
        return '公演';
      case 'beginning':
        return '原点';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              HISTORY
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            音楽家としての歩み、その軌跡
          </p>
        </div>
      </section>

      {/* Legend Section */}
      <section className="py-8 px-6 border-b border-[#8b4545]/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white" />
              <span className="text-[#f0f0f0]/80">受賞</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#87CEEB]" />
              <span className="text-[#f0f0f0]/80">学歴</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8b4545]" />
              <span className="text-[#f0f0f0]/80">リリース</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#DDA0DD]" />
              <span className="text-[#f0f0f0]/80">公演</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[60px] md:left-[120px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/50 via-white/20 to-transparent" />

            <div className="space-y-12">
              {timeline.map((event, index) => (
                <div
                  key={index}
                  className="relative flex gap-8 group"
                >
                  {/* Year */}
                  <div className="w-[60px] md:w-[120px] flex-shrink-0 text-right pt-1">
                    <div className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                      {event.year}
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-[52px] md:left-[112px] top-2 w-4 h-4 md:w-5 md:h-5">
                    <div
                      className={`w-full h-full rounded-full border-4 ${getCategoryColor(
                        event.category
                      )} bg-[#0a0a0a] transition-transform duration-300 group-hover:scale-125`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="velvet-card p-6 md:p-8 transition-all duration-300 group-hover:border-[#8b4545]/40">
                      {/* Category badge */}
                      <div className="mb-3">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold tracking-wider rounded border ${getCategoryColor(
                            event.category
                          )} bg-[#0a0a0a]/50`}
                        >
                          {getCategoryLabel(event.category)}
                        </span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#d4c4b0] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-[#f0f0f0]/80 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#8b4545]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom ornament */}
            <div className="mt-12 text-center">
              <div className="inline-block text-white text-2xl">◆</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="velvet-card p-12">
            <p className="text-xl md:text-2xl text-[#f0f0f0]/90 leading-relaxed mb-6">
              これまでの歩みすべてが、今この瞬間の演奏へと繋がっています。<br />
              そして、これからも音楽と共に歩み続けます。
            </p>
            <div className="divider my-6" />
            <p className="text-white tracking-widest">
              — MASASHI ENOKIDA
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
