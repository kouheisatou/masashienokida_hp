'use client';

import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useSnackbar } from '@/components/SnackBar';

const categories = [
  'リサイタル依頼',
  'コンサート依頼',
  'ボランティア公演',
  '取材・メディア',
  'サポーターズクラブ',
  'その他',
];

export default function ContactPage() {
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error: apiError } = await api.POST('/contact', { body: formData });
      if (apiError) throw new Error('送信に失敗しました');
      setStatus('success');
      showSnackbar('お問い合わせを送信しました。');
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'エラーが発生しました'
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pt-20 relative">
      {/* Hero Section */}
      <section className="relative h-80 flex items-end pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/contact-hero/1600/600)',
            filter: 'brightness(0.45)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/20 to-transparent" />
        <div className="relative z-10 container">
          <h1 className="mb-4">CONTACT</h1>
          <p className="text-taupe max-w-2xl">
            コンサートのご依頼、取材のお申し込み、
            <br />
            その他お問い合わせはこちらからどうぞ。
          </p>
        </div>
      </section>

      {/* Concert Types & Outreach Performance */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Concert Types */}
            <div className="mb-24">
              <h2 className="text-center mb-12 text-2xl text-white tracking-widest">コンサート依頼の目安</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'リサイタル', duration: '90分', note: 'フルプログラム' },
                  { name: '名曲ピアノコンサート', duration: '60分', note: '人気曲中心' },
                  { name: 'ミニコンサート', duration: '45分', note: '学校・施設向け' },
                  { name: 'ボランティア公演', duration: '45-60分', note: '福祉施設等' },
                ].map((item) => (
                  <div key={item.name} className="p-8 text-center border border-burgundy-border/30">
                    <h3 className="text-xl mb-3 text-beige">{item.name}</h3>
                    <p className="text-taupe text-sm">
                      {item.duration} / {item.note}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-taupe text-center text-sm mt-8">
                ※ 日本全国47都道府県、どこでも参ります
              </p>
            </div>

            {/* Outreach Performance Carousel */}
            <div>
              <h3 className="text-center mb-8 text-xl text-white tracking-widest">出張公演の様子</h3>
              <div className="relative overflow-hidden w-full">
                {/* 左右のグラデーションでフェードアウト効果 (bg-burgundy-black) */}
                <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-burgundy-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-burgundy-black to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex w-max animate-marquee hover:pause">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-4 px-2">
                      {[
                        { seed: 'outreach-1', alt: '学校でのコンサート' },
                        { seed: 'outreach-2', alt: '福祉施設での演奏' },
                        { seed: 'outreach-3', alt: '企業イベント' },
                        { seed: 'outreach-4', alt: 'サロンコンサート' },
                        { seed: 'outreach-5', alt: '地域イベント' },
                      ].map((item, index) => (
                        <div key={`${i}-${index}`} className="relative w-64 md:w-80 aspect-[4/3] rounded-sm overflow-hidden flex-shrink-0 group cursor-pointer">
                          <img
                            src={`https://picsum.photos/seed/${item.seed}/600/450`}
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-burgundy-black/20 group-hover:bg-transparent transition-colors duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-burgundy-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-sm tracking-wider">{item.alt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section (Full width accent background) */}
      <section className="bg-burgundy py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <h2 className="text-center mb-10 text-2xl text-white tracking-widest">コンサート依頼 / お問い合わせ</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              {status === 'error' && (
                <div className="bg-red-900/20 border border-red-800 p-4 rounded flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm mb-2 text-taupe">
                    お名前 <span className="text-burgundy-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-burgundy-border py-2 text-beige focus:outline-none focus:border-burgundy-accent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm mb-2 text-taupe">
                    メールアドレス <span className="text-burgundy-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-burgundy-border py-2 text-beige focus:outline-none focus:border-burgundy-accent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="phone" className="block text-sm mb-2 text-taupe">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-burgundy-border py-2 text-beige focus:outline-none focus:border-burgundy-accent transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm mb-2 text-taupe">
                    カテゴリ
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-burgundy-border py-2 text-beige focus:outline-none focus:border-burgundy-accent transition-colors"
                  >
                    <option value="" className="bg-burgundy-black text-taupe">選択してください</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-burgundy-black text-beige">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm mb-2 text-taupe">
                  件名 <span className="text-burgundy-accent">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-burgundy-border py-2 text-beige focus:outline-none focus:border-burgundy-accent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm mb-2 text-taupe">
                  お問い合わせ内容 <span className="text-burgundy-accent">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={8}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-burgundy-border py-2 text-beige focus:outline-none focus:border-burgundy-accent transition-colors resize-none"
                />
              </div>

              <p className="text-taupe text-xs text-center">
                ※ 個人情報は適切に管理し、お問い合わせへの対応以外の目的には使用しません。
              </p>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {status === 'loading' ? (
                    '送信中...'
                  ) : (
                    <>
                      <Send size={16} />
                      送信する
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            {/* Agency Info */}
            <div className="text-center">
              <h2 className="text-xl mb-6 text-white tracking-widest">所属事務所</h2>
              <div className="px-8 py-8 h-full flex flex-col justify-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-burgundy-accent"></div>
                <p className="text-beige text-lg mb-4">エトワール・ミュージック</p>
                <p className="text-taupe text-sm leading-relaxed mb-4">
                  〒220-0004<br />
                  神奈川県横浜市西区北幸二丁目<br />
                  10番48号 むつみビル３階
                </p>
                <p className="text-taupe text-sm">
                  Tel: 0465-20-3615
                </p>
              </div>
            </div>

            {/* Supporter's Info */}
            <div className="text-center">
              <h2 className="text-xl mb-6 text-white tracking-widest">お問い合わせ</h2>
              <div className="px-8 py-8 h-full flex flex-col justify-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-burgundy-accent"></div>
                <p className="text-beige text-lg mb-4">MasashiEnokida Suppoter&apos;s</p>
                <p className="text-taupe text-sm leading-relaxed">
                  Email: etoilepiano.concert@gmail.com<br />
                  Web: <a href="http://www.masashi-enokida.com" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">http://www.masashi-enokida.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
