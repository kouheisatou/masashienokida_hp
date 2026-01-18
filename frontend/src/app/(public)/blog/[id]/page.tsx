'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Lock, Share2 } from 'lucide-react';
import { blogApi, authApi, type BlogPost } from '@/lib/api-client';

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated());
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      const result = await blogApi.getPost(id);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setPost(result.data);
      }

      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p className="text-taupe">読み込み中...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || '記事が見つかりません'}</p>
          <Link href="/blog/" className="btn btn-outline">
            ブログ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // Check if content is locked
  const isLocked = post.membersOnly && post.isLocked;

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="section-padding pb-8">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
              href="/blog/"
              className="inline-flex items-center gap-2 text-taupe hover:text-beige transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              ブログ一覧に戻る
            </Link>

            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {post.category && (
                <span className="text-burgundy-accent text-sm">
                  {post.category.name}
                </span>
              )}
              <div className="flex items-center gap-2 text-taupe text-sm">
                <Calendar size={14} />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              {post.membersOnly && (
                <span className="flex items-center gap-1 text-burgundy-accent text-sm">
                  <Lock size={12} />
                  会員限定
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl mb-8">{post.title}</h1>

            {/* Thumbnail */}
            {post.thumbnail?.url && (
              <div className="aspect-video bg-burgundy-light rounded overflow-hidden mb-8">
                <img
                  src={post.thumbnail.url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding pt-0">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {isLocked ? (
              /* Locked Content */
              <div className="card p-12 text-center">
                <Lock size={48} className="mx-auto mb-6 text-burgundy-accent" />
                <h2 className="text-xl mb-4">会員限定コンテンツです</h2>
                <p className="text-taupe mb-8">
                  この記事はサポーターズクラブ会員限定です。
                  <br />
                  ログインするか、会員登録をお願いします。
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {isAuthenticated ? (
                    <Link href="/supporters/" className="btn btn-primary">
                      会員にアップグレード
                    </Link>
                  ) : (
                    <>
                      <Link href="/api/auth/signin" className="btn btn-primary">
                        ログイン
                      </Link>
                      <Link href="/supporters/" className="btn btn-outline">
                        会員登録について
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Post Content */
              <article
                className="prose prose-invert prose-burgundy max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Share & Navigation */}
      {!isLocked && (
        <section className="section-padding bg-burgundy">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              {/* Share */}
              <div className="flex justify-center mb-12">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-taupe hover:text-beige transition-colors"
                >
                  <Share2 size={18} />
                  この記事をシェア
                </button>
              </div>

              {/* Author */}
              <div className="card p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-burgundy-light flex-shrink-0">
                    {/* Author image placeholder */}
                  </div>
                  <div>
                    <p className="text-beige font-medium mb-1">榎田 雅士</p>
                    <p className="text-taupe text-sm">
                      ピアニスト。宮崎県小林市出身。UCLA にてヴィタリー・マルグリス氏に師事。
                    </p>
                    <Link
                      href="/biography/"
                      className="text-burgundy-accent text-sm hover:text-white transition-colors mt-2 inline-block"
                    >
                      プロフィールを見る →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="mb-6">コンサート情報</h2>
            <p className="text-taupe mb-8">
              最新のコンサート情報をチェックして、
              <br />
              ぜひ生の演奏をお聴きください。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/concerts/" className="btn btn-primary">
                コンサート情報
              </Link>
              <Link href="/blog/" className="btn btn-outline">
                ブログ一覧
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
