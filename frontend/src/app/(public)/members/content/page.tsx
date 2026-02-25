'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, Lock, Play, Crown } from 'lucide-react';
import { getMemberContent, getGoogleSignInUrl } from '@/lib/api-client';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  tier: string;
  available: boolean;
}

interface ContentData {
  tier: string;
  content: {
    videos: ContentItem[];
    articles: ContentItem[];
  };
}

export default function MembersContentPage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'articles'>('videos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMemberContent();
        setData(result as ContentData);
      } catch {
        window.location.href = getGoogleSignInUrl();
        return;
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/members/" className="btn btn-outline">
            マイページに戻る
          </Link>
        </div>
      </div>
    );
  }

  const isGoldMember = data?.tier === 'MEMBER_GOLD';

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="section-padding pb-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/members/"
              className="inline-flex items-center gap-2 text-taupe hover:text-beige transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              マイページに戻る
            </Link>

            <h1 className="mb-4">限定コンテンツ</h1>
            <p className="text-taupe">
              会員限定の動画・記事をお楽しみください。
              {!isGoldMember && (
                <span className="block mt-2 text-burgundy-accent">
                  ※ ゴールド会員限定コンテンツもあります
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 border-b border-burgundy-border">
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-4 px-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'videos'
                    ? 'text-burgundy-accent border-b-2 border-burgundy-accent'
                    : 'text-taupe hover:text-beige'
                }`}
              >
                <Video size={18} />
                動画
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`pb-4 px-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'articles'
                    ? 'text-burgundy-accent border-b-2 border-burgundy-accent'
                    : 'text-taupe hover:text-beige'
                }`}
              >
                <FileText size={18} />
                記事
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="section-padding pt-0">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.content.videos.map((video) => (
                  <div
                    key={video.id}
                    className={`card overflow-hidden ${!video.available ? 'opacity-60' : ''}`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-burgundy relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {video.available ? (
                          <div className="w-16 h-16 rounded-full bg-burgundy-accent/80 flex items-center justify-center cursor-pointer hover:bg-burgundy-accent transition-colors">
                            <Play size={24} className="text-white ml-1" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-burgundy-light flex items-center justify-center">
                            <Lock size={24} className="text-taupe" />
                          </div>
                        )}
                      </div>
                      {video.tier === 'MEMBER_GOLD' && (
                        <div className="absolute top-3 right-3 bg-burgundy-accent/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Crown size={10} />
                          ゴールド限定
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-base mb-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-taupe text-sm line-clamp-2">{video.description}</p>
                      )}
                      {!video.available && (
                        <p className="text-burgundy-accent text-xs mt-2">
                          ゴールド会員限定コンテンツです
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {data?.content.videos.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Video size={48} className="mx-auto mb-4 text-burgundy-border" />
                    <p className="text-taupe">まだ動画コンテンツがありません</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-4">
                {data?.content.articles.map((article) => (
                  <div
                    key={article.id}
                    className={`card p-6 ${!article.available ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded bg-burgundy flex items-center justify-center flex-shrink-0">
                        {article.available ? (
                          <FileText size={18} className="text-burgundy-accent" />
                        ) : (
                          <Lock size={18} className="text-taupe" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base">{article.title}</h3>
                          {article.tier === 'MEMBER_GOLD' && (
                            <span className="bg-burgundy-accent/20 text-burgundy-accent text-xs px-2 py-0.5 rounded flex items-center gap-1">
                              <Crown size={10} />
                              ゴールド
                            </span>
                          )}
                        </div>
                        {!article.available && (
                          <p className="text-burgundy-accent text-xs">
                            ゴールド会員限定コンテンツです
                          </p>
                        )}
                      </div>
                      {article.available && (
                        <button className="btn btn-outline text-sm py-2 px-4 h-auto">
                          読む
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {data?.content.articles.length === 0 && (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto mb-4 text-burgundy-border" />
                    <p className="text-taupe">まだ記事コンテンツがありません</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Upgrade CTA (for non-gold members) */}
      {!isGoldMember && (
        <section className="section-padding bg-burgundy">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <Crown size={32} className="mx-auto mb-4 text-burgundy-accent" />
              <h2 className="mb-4">すべてのコンテンツを楽しむ</h2>
              <p className="text-taupe mb-8">
                ゴールド会員になると、すべての限定コンテンツにアクセスできます。
                <br />
                年会費3,000円で、インタビューや舞台裏映像など特別なコンテンツをお届けします。
              </p>
              <Link href="/supporters/" className="btn btn-primary">
                ゴールド会員になる
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
