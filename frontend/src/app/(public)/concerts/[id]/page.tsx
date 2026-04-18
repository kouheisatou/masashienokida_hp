'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Ticket, ArrowLeft } from 'lucide-react';
import { api, type components } from '@/lib/api';

type Concert = components['schemas']['Concert'];

export default function ConcertDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [concert, setConcert] = useState<Concert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConcert = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      const { data } = await api.GET('/concerts/{id}', { params: { path: { id } } });
      if (!data) {
        setError('コンサートが見つかりません');
      } else {
        setConcert(data);
      }

      setLoading(false);
    };

    fetchConcert();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    );
  }

  if (error || !concert) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-taupe mb-4">{error || 'コンサートが見つかりません'}</p>
          <Link href="/concerts/" className="btn btn-outline">
            コンサート一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = new Date(concert.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="pt-20">
      {/* Content */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <Link
            href="/concerts/"
            className="inline-flex items-center gap-2 text-taupe hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            コンサート一覧に戻る
          </Link>

          <div className="flex flex-col md:flex-row md:gap-12">
            {/* Left: Image */}
            <div className="md:w-1/2 flex-shrink-0">
              {concert.image_url ? (
                <img
                  src={concert.image_url}
                  alt={concert.title}
                  className="w-full h-auto object-contain rounded"
                />
              ) : (
                <div className="relative w-full min-h-[300px] flex items-center justify-center rounded overflow-hidden">
                  <img
                    src="/images/textures/header-contact.jpeg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-burgundy-black/40" />
                  <h2 className="relative z-10 text-2xl md:text-3xl text-white text-center px-8">{concert.title}</h2>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="md:w-1/2 pt-8 md:pt-0">
                <h2 className="text-2xl mb-8">{concert.title}</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <Calendar size={20} className="flex-shrink-0 mt-0.5 text-burgundy-accent" />
                    <div>
                      <p className="text-sm text-taupe mb-1">日程</p>
                      <time dateTime={concert.date} className="text-beige">{dateStr}</time>
                    </div>
                  </div>
                  {concert.time && (
                    <div className="flex items-start gap-4">
                      <Clock size={20} className="flex-shrink-0 mt-0.5 text-burgundy-accent" />
                      <div>
                        <p className="text-sm text-taupe mb-1">開演</p>
                        <p className="text-beige">{concert.time}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <MapPin size={20} className="flex-shrink-0 mt-0.5 text-burgundy-accent" />
                    <div>
                      <p className="text-sm text-taupe mb-1">会場</p>
                      <p className="text-beige">{concert.venue}</p>
                      {concert.address && (
                        <p className="text-taupe text-sm mt-2">{concert.address}</p>
                      )}
                    </div>
                  </div>
                  {concert.price && (
                    <div className="flex items-start gap-4">
                      <Ticket size={20} className="flex-shrink-0 mt-0.5 text-burgundy-accent" />
                      <div>
                        <p className="text-sm text-taupe mb-1">料金</p>
                        <p className="text-beige">{concert.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {concert.program && concert.program.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg text-white mb-4">PROGRAM</h3>
                    <ul className="space-y-2">
                      {concert.program.map((item, index) => (
                        <li key={index} className="text-beige flex gap-3">
                          <span className="text-taupe text-sm w-8">{index + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {concert.note && (
                  <p className="text-burgundy-accent text-sm mb-8">※ {concert.note}</p>
                )}

                {concert.is_upcoming && concert.ticket_url && (
                  <a
                    href={concert.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Ticket size={18} />
                    チケット購入
                  </a>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Ticket Button (upcoming only) */}
      {concert.is_upcoming && (
        concert.ticket_url ? (
          <a
            href={concert.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-40 btn btn-primary flex items-center gap-2 shadow-lg shadow-burgundy-black/50"
          >
            <Ticket size={18} />
            チケット購入
          </a>
        ) : (
          <span className="fixed bottom-8 right-8 z-40 btn btn-primary flex items-center gap-2 shadow-lg shadow-burgundy-black/50 opacity-50 cursor-not-allowed">
            <Ticket size={18} />
            チケット準備中
          </span>
        )
      )}
    </div>
  );
}
