'use client';

import Button from '@/components/Button';
import Card from '@/components/Card';

export default function SupportersPage() {
  const membershipTiers = [
    {
      id: 'free',
      name: '無料会員',
      nameEn: 'FREE MEMBER',
      price: '無料',
      priceDetail: '登録無料',
      color: 'from-[#4a5568] to-[#2d3748]',
      borderColor: 'border-[#718096]',
      features: [
        'メールマガジン配信',
        'コンサート情報の先行案内',
        'バースデーメッセージ',
        'メンバー限定ブログ記事の閲覧',
        'ファンクラブ限定グッズの購入権',
      ],
      cta: '無料登録',
      recommended: false,
    },
    {
      id: 'gold',
      name: 'ゴールド会員',
      nameEn: 'GOLD MEMBER',
      price: '¥5,000',
      priceDetail: '年会費（税込）',
      color: 'from-[#d4af37] to-[#b8860b]',
      borderColor: 'border-[#8b4545]',
      features: [
        '無料会員の全特典',
        'チケット先行予約（最優先）',
        '会員限定コンサート招待',
        'リハーサル見学権',
        'アーティストとの交流イベント参加権',
        'サイン入りCDプレゼント（年1回）',
        '会報誌の送付（年4回）',
        'オンラインサロンへのアクセス',
        '限定動画・音源コンテンツ',
        '会員証（ゴールドカード）発行',
      ],
      cta: '入会する',
      recommended: true,
    },
  ];

  const benefits = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      title: 'チケット優先予約',
      description: 'ゴールド会員は一般発売より早く、お好きな座席を優先予約できます。',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '限定コンテンツ',
      description: '会員限定の演奏動画や、レコーディング秘話など、ここでしか見られないコンテンツをお届けします。',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: '交流イベント',
      description: 'ゴールド会員限定の交流会やリハーサル見学など、アーティストとの貴重な時間をお楽しみいただけます。',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      title: '限定グッズ',
      description: 'サイン入りCDやオリジナルグッズなど、会員限定の特別なアイテムをご用意しています。',
    },
  ];

  const faqs = [
    {
      question: '入会方法を教えてください',
      answer: 'Webサイトの入会フォームからお申し込みいただけます。クレジットカード決済またはコンビニ決済が可能です。',
    },
    {
      question: '年会費の支払い方法は？',
      answer: 'クレジットカード決済、銀行振込、コンビニ決済からお選びいただけます。クレジットカード決済の場合、自動更新も可能です。',
    },
    {
      question: '無料会員からゴールド会員へのアップグレードは可能ですか？',
      answer: 'はい、マイページからいつでもアップグレードしていただけます。差額のお支払いで即座に切り替わります。',
    },
    {
      question: '退会する場合は？',
      answer: 'マイページの退会手続きページから、いつでも退会可能です。年会費の返金は原則として行っておりません。',
    },
    {
      question: '会員証はいつ届きますか？',
      answer: 'ゴールド会員の方には、入会手続き完了後、約2週間でお手元に届きます。',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              SUPPORTERS CLUB
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed mb-8">
            音楽を共に愛する仲間として、<br />
            特別なひとときを共有しませんか
          </p>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {membershipTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative ${
                  tier.recommended ? 'md:scale-105 z-10' : ''
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-block px-6 py-2 bg-white text-black text-sm font-bold tracking-wider rounded-full shadow-lg">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div className={`velvet-card p-8 md:p-10 h-full border-2 ${tier.borderColor} ${
                  tier.recommended ? 'shadow-[0_0_40px_rgba(255,215,0,0.3)]' : ''
                }`}>
                  {/* Tier Name */}
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-[#d4c4b0] tracking-[0.2em]">
                      {tier.nameEn}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8 pb-8 border-b border-[#8b4545]/20">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {tier.price}
                    </div>
                    <p className="text-sm text-[#f0f0f0]/60">
                      {tier.priceDetail}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-[#f0f0f0]/90"
                      >
                        <svg
                          className="w-5 h-5 text-white flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="text-center">
                    <Button
                      variant={tier.recommended ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full"
                    >
                      {tier.cta}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[1200px] mx-auto">
          <div className="ornament mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
              会員特典
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <Card
                key={idx}
                title={benefit.title}
                description={benefit.description}
              >
                <div className="text-white mb-4">
                  {benefit.icon}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="ornament mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
              よくあるご質問
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="velvet-card p-6 md:p-8"
              >
                <h3 className="text-lg font-bold text-white mb-3 flex items-start gap-3">
                  <span className="text-[#d4c4b0] flex-shrink-0">Q.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-[#f0f0f0]/80 leading-relaxed pl-8">
                  <span className="text-[#d4c4b0] mr-2">A.</span>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 theater-frame">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="velvet-card p-12">
            <h2 className="text-3xl font-bold text-white mb-6 tracking-wider">
              今すぐ入会する
            </h2>
            <p className="text-[#f0f0f0]/80 mb-8 leading-relaxed">
              音楽を愛する仲間として、<br />
              特別な体験を一緒に創りあげていきましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                ゴールド会員に入会
              </Button>
              <Button variant="outline" size="lg">
                無料会員登録
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
