'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: '', label: '選択してください' },
    { value: 'concert', label: 'コンサートについて' },
    { value: 'media', label: 'メディア・取材について' },
    { value: 'collaboration', label: '共演・コラボレーションについて' },
    { value: 'fanclub', label: 'サポーターズクラブについて' },
    { value: 'other', label: 'その他' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: API呼び出し
    setTimeout(() => {
      alert('お問い合わせを受け付けました。ありがとうございます。');
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      content: 'info@masashienokida.com',
      link: 'mailto:info@masashienokida.com',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Office',
      content: '〒150-0001 東京都渋谷区神宮前1-1-1',
      link: null,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: '営業時間',
      content: '平日 10:00 - 18:00',
      link: null,
    },
  ];

  const faqs = [
    {
      question: 'お問い合わせへの返信はどのくらいかかりますか？',
      answer: '通常、3営業日以内にご返信させていただきます。お急ぎの場合は、その旨をメッセージ本文にご記載ください。',
    },
    {
      question: 'コンサートの出演依頼はこちらから可能ですか？',
      answer: 'はい、可能です。カテゴリで「共演・コラボレーションについて」を選択し、詳細をお書き添えください。',
    },
    {
      question: 'メディア取材の申し込みについて',
      answer: 'メディア・取材についてのお問い合わせは、所属事務所の広報担当が対応させていただきます。',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              CONTACT
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            お問い合わせは下記フォームよりお願いいたします
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, idx) => (
              <div
                key={idx}
                className="velvet-card p-6 text-center"
              >
                <div className="text-white mb-4 flex justify-center">
                  {info.icon}
                </div>
                <h3 className="text-sm font-bold text-[#d4c4b0] tracking-wider mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-[#f0f0f0]/80 hover:text-white transition-colors"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="text-[#f0f0f0]/80">{info.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="velvet-card p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center tracking-wider">
              お問い合わせフォーム
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[#d4c4b0] mb-2 tracking-wider">
                  お名前 <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#8b4545]/30 rounded text-[#f0f0f0] focus:outline-none focus:border-[#8b4545] transition-colors"
                  placeholder="山田 太郎"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#d4c4b0] mb-2 tracking-wider">
                  メールアドレス <span className="text-white">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#8b4545]/30 rounded text-[#f0f0f0] focus:outline-none focus:border-[#8b4545] transition-colors"
                  placeholder="example@email.com"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-[#d4c4b0] mb-2 tracking-wider">
                  お問い合わせ種別 <span className="text-white">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#8b4545]/30 rounded text-[#f0f0f0] focus:outline-none focus:border-[#8b4545] transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-[#d4c4b0] mb-2 tracking-wider">
                  件名 <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#8b4545]/30 rounded text-[#f0f0f0] focus:outline-none focus:border-[#8b4545] transition-colors"
                  placeholder="お問い合わせの件名"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-[#d4c4b0] mb-2 tracking-wider">
                  お問い合わせ内容 <span className="text-white">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-[#8b4545]/30 rounded text-[#f0f0f0] focus:outline-none focus:border-[#8b4545] transition-colors resize-none"
                  placeholder="お問い合わせ内容をご記入ください"
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-[#8B0000]/10 border border-[#8b4545]/20 rounded p-4">
                <p className="text-xs text-[#f0f0f0]/70 leading-relaxed">
                  お送りいただいた個人情報は、お問い合わせへの回答および関連する連絡のためにのみ使用し、適切に管理いたします。
                </p>
              </div>

              {/* Submit Button */}
              <div className="text-center pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 stage-gradient">
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
    </div>
  );
}
