'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

export default function BlogDetailPage() {
  const params = useParams();
  const postId = params?.id as string;

  // Mock data - 後でAPIから取得
  const post = {
    id: postId,
    title: '2025年春 リサイタルツアー開催決定',
    date: '2025-01-15',
    category: 'コンサート',
    membersOnly: false,
    imageGradient: 'from-[#8B0000] to-[#4a0e0e]',
    content: `
全国5都市でのリサイタルツアーが決定いたしました。

今回のツアーでは、ショパン、リスト、そしてラヴェルという、私が最も愛する作曲家たちの作品をお届けします。それぞれの都市で異なるプログラムをご用意しておりますので、複数の公演にお越しいただければ、より多彩な音楽体験をお楽しみいただけます。

## ツアースケジュール

**東京公演**
2025年2月20日（木）19:00開演
会場：東京文化会館 小ホール

**大阪公演**
2025年3月10日（月）19:00開演
会場：いずみホール

**名古屋公演**
2025年3月15日（土）18:00開演
会場：三井住友海上しらかわホール

**福岡公演**
2025年4月5日（土）18:30開演
会場：アクロス福岡シンフォニーホール

**札幌公演**
2025年4月20日（日）15:00開演
会場：札幌コンサートホール Kitara

## プログラムについて

今回のツアーのテーマは「夜想曲」です。新アルバム「Nocturne」のリリースを記念し、ショパンの夜想曲を中心に、夜の静寂と美しさを表現した作品を選びました。

ショパンの夜想曲は、彼の最も詩的で内省的な側面を表現した作品群です。一つ一つの音符に込められた繊細な感情を、皆様にお届けできることを心より楽しみにしております。

## チケット情報

チケットは各公演の2ヶ月前から一般発売を開始いたします。サポーターズクラブのゴールド会員の方には、一般発売に先駆けて先行予約の機会をご用意しております。

詳細につきましては、各公演のページをご覧ください。

皆様とホールでお会いできることを、心より楽しみにしております。
    `,
  };

  const relatedPosts = [
    {
      id: '2',
      title: '新アルバム「Nocturne」リリースに寄せて',
      date: '2025-01-10',
      category: 'レコーディング',
    },
    {
      id: '4',
      title: 'NHK「クラシック音楽館」出演のお知らせ',
      date: '2024-12-28',
      category: 'メディア',
    },
    {
      id: '5',
      title: 'リハーサルの日々',
      date: '2024-12-20',
      category: 'コンサート',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Back button */}
          <Link href="/blog">
            <Button variant="outline" size="sm" className="mb-8">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              ブログ一覧に戻る
            </Button>
          </Link>

          {/* Category & Date */}
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded">
              {post.category}
            </span>
            <span className="text-[#f0f0f0]/60">
              {new Date(post.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {post.membersOnly && (
              <span className="px-3 py-1.5 text-xs font-bold tracking-wider rounded bg-[#FFD700] text-black flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                会員限定
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-8 leading-tight">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-6 mb-12">
        <div className="max-w-[900px] mx-auto">
          <div className="relative aspect-[16/9] rounded overflow-hidden border-2 border-[#FFD700]/30">
            <div className={`absolute inset-0 bg-gradient-to-br ${post.imageGradient}`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[#FFD700]/30 text-8xl">♪</div>
            </div>
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#FFD700]/40" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#FFD700]/40" />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 mb-20">
        <div className="max-w-[900px] mx-auto">
          <article className="velvet-card p-8 md:p-12">
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-[#FFD700] prose-headings:font-bold prose-headings:tracking-wide
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-[#FFD700]/20
                prose-p:text-[#f0f0f0]/80 prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-[#FFD700] prose-strong:font-bold
                prose-ul:text-[#f0f0f0]/80 prose-li:my-2
                prose-a:text-[#FFD700] prose-a:no-underline hover:prose-a:text-[#FFA500] prose-a:transition-colors"
              dangerouslySetInnerHTML={{ __html: post.content.split('\n').map(line => {
                if (line.startsWith('## ')) {
                  return `<h2>${line.substring(3)}</h2>`;
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`;
                } else if (line.trim() === '') {
                  return '<br />';
                } else {
                  return `<p>${line}</p>`;
                }
              }).join('') }}
            />
          </article>

          {/* Share buttons */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-[#f0f0f0]/60 text-sm">この記事をシェア：</span>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button className="w-10 h-10 rounded border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#FFD700] mb-8 text-center tracking-wider">
            関連記事
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                <div className="velvet-card p-6 cursor-pointer group transition-all duration-300 hover:border-[#FFD700]/40">
                  <div className="mb-3">
                    <span className="text-xs px-2.5 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded">
                      {relatedPost.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#FFD700] mb-2 group-hover:text-[#FFA500] transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-[#f0f0f0]/60">
                    {new Date(relatedPost.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
