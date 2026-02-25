'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitContact } from '@/lib/api-client';

const categories = [
  'リサイタル依頼',
  'コンサート依頼',
  'ボランティア公演',
  '取材・メディア',
  'サポーターズクラブ',
  'その他',
];

export default function ContactPage() {
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
      await submitContact(formData);
      setStatus('success');
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

  if (status === 'success') {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="container">
          <div className="max-w-lg mx-auto text-center">
            <CheckCircle size={64} className="text-burgundy-accent mx-auto mb-6" />
            <h1 className="text-2xl mb-4">送信完了</h1>
            <p className="text-taupe mb-8">
              お問い合わせありがとうございます。
              <br />
              確認メールをお送りしましたのでご確認ください。
              <br />
              内容を確認の上、折り返しご連絡いたします。
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="btn btn-outline"
            >
              新しいお問い合わせ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-center mb-6">CONTACT</h1>
            <p className="text-taupe text-center mb-12">
              コンサートのご依頼、取材のお申し込み、
              <br />
              その他お問い合わせはこちらからどうぞ。
            </p>

            {/* Concert Types */}
            <div className="bg-burgundy p-8 rounded mb-12">
              <h2 className="text-lg mb-6 text-center">依頼内容の目安</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'リサイタル', duration: '90分', note: 'フルプログラム' },
                  { name: '名曲ピアノコンサート', duration: '60分', note: '人気曲中心' },
                  { name: 'ミニコンサート', duration: '45分', note: '学校・施設向け' },
                  { name: 'ボランティア公演', duration: '45-60分', note: '福祉施設等' },
                ].map((item) => (
                  <div key={item.name} className="card p-4">
                    <h3 className="text-sm mb-1">{item.name}</h3>
                    <p className="text-taupe text-xs">
                      {item.duration} / {item.note}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-taupe text-center text-sm mt-6">
                ※ 日本全国47都道府県、どこでも参ります
              </p>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-900/20 border border-red-800 p-4 rounded flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm mb-2">
                    お名前 <span className="text-burgundy-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-burgundy-light border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm mb-2">
                    メールアドレス <span className="text-burgundy-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-burgundy-light border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-burgundy-light border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm mb-2">
                    カテゴリ
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-burgundy-light border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent"
                  >
                    <option value="">選択してください</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm mb-2">
                  件名 <span className="text-burgundy-accent">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-burgundy-light border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm mb-2">
                  お問い合わせ内容 <span className="text-burgundy-accent">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={8}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-burgundy-light border border-burgundy-border rounded px-4 py-3 text-beige focus:outline-none focus:border-burgundy-accent resize-none"
                />
              </div>

              <p className="text-taupe text-xs">
                ※ 個人情報は適切に管理し、お問い合わせへの対応以外の目的には使用しません。
              </p>

              <div className="text-center">
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

            {/* Agency Info */}
            <div className="mt-16 pt-16 border-t border-burgundy-border text-center">
              <h2 className="text-lg mb-4">所属事務所</h2>
              <p className="text-beige">エトワール・ミュージック</p>
              <p className="text-taupe text-sm mt-2">横浜市西区</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
