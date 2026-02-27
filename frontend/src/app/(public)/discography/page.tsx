'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { api, type components } from '@/lib/api';

type DiscographyItem = components['schemas']['DiscographyItem'];

export default function DiscographyPage() {
  const [discography, setDiscography] = useState<DiscographyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.GET('/discography')
      .then(({ data }) => { if (data) setDiscography(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-80 flex items-end pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/discography-hero/1600/600)',
            filter: 'brightness(0.45)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/20 to-transparent" />
        <div className="relative z-10 container">
          <h1 className="mb-4">DISCOGRAPHY</h1>
          <p className="text-taupe max-w-2xl">
            榎田まさしの音源作品をご紹介します。
          </p>
        </div>
      </section>

      {/* Discography Grid */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-taupe">読み込み中...</p>
            </div>
          ) : discography.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-taupe">ディスコグラフィ情報をお待ちください</p>
              <Link href="/" className="btn btn-outline mt-6 inline-block">
                ホームに戻る
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {discography.map((album) => (
                <div key={album.id} className="card overflow-hidden group hover:shadow-card transition-shadow">
                  <Link href={`/discography/${album.id}/`} className="block">
                    {album.image_url ? (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={album.image_url}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-burgundy flex items-center justify-center">
                        <span className="text-taupe text-5xl">♪</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-6">
                    <Link href={`/discography/${album.id}/`}>
                      <h3 className="text-lg mb-2 group-hover:text-burgundy-accent transition-colors">
                        {album.title}
                      </h3>
                    </Link>
                    <p className="text-taupe text-sm mb-4">{album.release_year}年発売</p>
                    {album.description && (
                      <p className="text-sm text-taupe line-clamp-3">{album.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link href={`/discography/${album.id}/`} className="text-sm text-burgundy-accent hover:text-white transition-colors">
                        詳細を見る →
                      </Link>
                      {album.purchase_url && (
                        <a
                          href={album.purchase_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary text-sm py-2 px-4 inline-flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ShoppingCart size={14} />
                          CDを購入する
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
