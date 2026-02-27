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
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-end pb-16 overflow-hidden">
        {concert.image_url ? (
          <>
            <img
              src={concert.image_url}
              alt={concert.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/60 to-burgundy-black/30" />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://picsum.photos/seed/concert-detail/1600/600)',
              filter: 'brightness(0.45)',
            }}
          />
        )}
        <div className="relative z-10 container">
          <Link
            href="/concerts/"
            className="inline-flex items-center gap-2 text-taupe hover:text-white transition-colors text-sm mb-6"
          >
            <ArrowLeft size={16} />
            コンサート一覧に戻る
          </Link>
          <h1 className="mb-2">{concert.title}</h1>
          <div className="flex items-center gap-3 text-taupe">
            <Calendar size={18} className="flex-shrink-0" />
            <time dateTime={concert.date}>{dateStr}</time>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <article className="card overflow-hidden">
              {concert.image_url && (
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={concert.image_url}
                    alt={concert.venue}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-transparent to-transparent" />
                </div>
              )}

              <div className="p-8 md:p-12">
                <h2 className="text-2xl mb-8">{concert.title}</h2>

                <div className="space-y-4 mb-8">
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

                <div className="flex flex-wrap gap-4">
                  {concert.ticket_url && (
                    <a href={concert.ticket_url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                      チケットを購入する
                    </a>
                  )}
                  <Link href="/supporters/" className="btn btn-outline">
                    会員割引について
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
