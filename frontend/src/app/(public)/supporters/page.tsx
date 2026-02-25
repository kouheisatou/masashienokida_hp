import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SUPPORTERS',
  description:
    '榎田まさしサポーターズクラブのご案内。メール会員（無料）、ゴールド会員（年会費3,000円）をご用意しています。',
};

const freeBenefits = [
  'コンサート情報の優先配信',
  'チケット先行予約（一般発売より1週間前）',
  '会員限定動画の視聴',
  '季刊会報誌（PDF配信）',
];

const goldBenefits = [
  'メール会員の全特典',
  '主催公演チケット10%OFF',
  '年1回の主催公演無料招待',
  '年1回のリハーサル見学',
  '限定コンテンツ（インタビュー、写真等）',
  'サイン入りグッズの優先購入',
  '会員限定交流会への参加',
];

export default function SupportersPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">SUPPORTERS CLUB</h1>
            <p className="text-taupe leading-relaxed">
              榎田まさしの音楽活動を応援してくださるサポーターを募集しています。
              <br />
              皆様のご支援が、より良い音楽を届ける力となります。
            </p>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <h2 className="text-center mb-16">会員種別</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Member */}
            <div className="card p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl mb-2">メール会員</h3>
                <p className="text-taupe text-sm mb-4">無料</p>
                <p className="text-3xl text-white">¥0</p>
              </div>

              <ul className="space-y-4 mb-8">
                {freeBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="text-burgundy-accent flex-shrink-0 mt-0.5"
                    />
                    <span className="text-beige text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/google`}
                className="btn btn-outline w-full justify-center"
              >
                無料で登録する
              </a>
            </div>

            {/* Gold Member */}
            <div className="card p-8 border-burgundy-accent relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-burgundy-accent text-white text-xs px-4 py-1 rounded-full flex items-center gap-1">
                <Star size={12} />
                おすすめ
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl mb-2">ゴールド会員</h3>
                <p className="text-taupe text-sm mb-4">年会費（税込）</p>
                <p className="text-3xl text-white">¥3,000</p>
                <p className="text-taupe text-xs mt-1">入会金なし</p>
              </div>

              <ul className="space-y-4 mb-8">
                {goldBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="text-burgundy-accent flex-shrink-0 mt-0.5"
                    />
                    <span className="text-beige text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/google`}
                className="btn btn-primary w-full justify-center"
              >
                ゴールド会員になる
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">入会方法</h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-burgundy-light flex items-center justify-center flex-shrink-0">
                  <span className="text-burgundy-accent">1</span>
                </div>
                <div>
                  <h3 className="text-lg mb-2">アカウント登録</h3>
                  <p className="text-taupe text-sm">
                    Googleアカウントで簡単に登録できます。
                    メールアドレスをご登録いただくとメール会員として登録されます。
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-burgundy-light flex items-center justify-center flex-shrink-0">
                  <span className="text-burgundy-accent">2</span>
                </div>
                <div>
                  <h3 className="text-lg mb-2">会員種別を選択</h3>
                  <p className="text-taupe text-sm">
                    メール会員のまま活動を応援いただくか、
                    ゴールド会員にアップグレードするかをお選びください。
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-burgundy-light flex items-center justify-center flex-shrink-0">
                  <span className="text-burgundy-accent">3</span>
                </div>
                <div>
                  <h3 className="text-lg mb-2">お支払い（ゴールド会員のみ）</h3>
                  <p className="text-taupe text-sm">
                    クレジットカードで安全にお支払いいただけます。
                    年会費は毎年自動更新となります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-12">よくあるご質問</h2>

            <div className="space-y-6">
              {[
                {
                  q: '会員の更新はどのように行われますか？',
                  a: 'ゴールド会員の年会費は、ご登録日の1年後に自動更新されます。更新前にメールでお知らせします。',
                },
                {
                  q: '退会はできますか？',
                  a: 'マイページからいつでも退会手続きが可能です。退会後も会員期間中は特典をご利用いただけます。',
                },
                {
                  q: '領収書は発行できますか？',
                  a: 'マイページから領収書をダウンロードいただけます。',
                },
                {
                  q: '海外からも入会できますか？',
                  a: 'はい、世界中どこからでもご入会いただけます。',
                },
              ].map((faq) => (
                <div key={faq.q} className="card p-6">
                  <h3 className="text-base mb-3">{faq.q}</h3>
                  <p className="text-taupe text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">お問い合わせ</h2>
            <p className="text-taupe mb-4">
              サポーターズクラブに関するご質問は、
              <br />
              下記までお問い合わせください。
            </p>
            <p className="text-beige">エトワール・ミュージック</p>
            <p className="text-taupe text-sm">横浜市西区</p>
            <div className="mt-8">
              <Link href="/contact/" className="btn btn-outline">
                お問い合わせフォーム
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
