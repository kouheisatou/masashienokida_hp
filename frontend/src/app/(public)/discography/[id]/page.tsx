'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, ShoppingCart } from 'lucide-react';
import { api, type components } from '@/lib/api';

type DiscographyItem = components['schemas']['DiscographyItem'];

export default function DiscographyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [album, setAlbum] = useState<DiscographyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      const { data } = await api.GET('/discography/{id}', { params: { path: { id } } });
      if (!data) {
        setError('作品が見つかりません');
      } else {
        setAlbum(data);
      }

      setLoading(false);
    };

    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-taupe mb-4">{error || '作品が見つかりません'}</p>
          <Link href="/discography/" className="btn btn-outline">
            DISCOGRAPHY一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-end pb-16 overflow-hidden">
        {album.image_url ? (
          <>
            <img
              src={album.image_url}
              alt={album.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/60 to-burgundy-black/30" />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: 'url(https://picsum.photos/seed/discography-detail/1600/600)',
              filter: 'brightness(0.45)',
            }}
          >
            <span className="relative z-10 text-taupe text-8xl opacity-50">♪</span>
          </div>
        )}
        <div className="relative z-10 container">
          <Link
            href="/discography/"
            className="inline-flex items-center gap-2 text-taupe hover:text-white transition-colors text-sm mb-6"
          >
            <ArrowLeft size={16} />
            DISCOGRAPHY一覧に戻る
          </Link>
          <h1 className="mb-2">{album.title}</h1>
          <div className="flex items-center gap-3 text-taupe">
            <Music size={18} className="flex-shrink-0" />
            <span>{album.release_year}年発売</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <article className="card overflow-hidden">
              {album.image_url && (
                <div className="relative aspect-square max-h-96 overflow-hidden">
                  <img
                    src={album.image_url}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-transparent to-transparent" />
                </div>
              )}

              <div className="p-8 md:p-12">
                <h2 className="text-2xl mb-8">{album.title}</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <Music size={20} className="flex-shrink-0 mt-0.5 text-burgundy-accent" />
                    <div>
                      <p className="text-sm text-taupe mb-1">発売年</p>
                      <p className="text-beige">{album.release_year}年</p>
                    </div>
                  </div>
                </div>

                {album.description && (
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-lg text-white mb-4">ABOUT</h3>
                    <p className="text-beige leading-relaxed whitespace-pre-wrap">
                      {album.description}
                    </p>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-burgundy-border flex flex-wrap gap-4">
                  <Link href="/discography/" className="btn btn-outline">
                    一覧に戻る
                  </Link>
                  {album.purchase_url && (
                    <a
                      href={album.purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      CDを購入する
                    </a>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
