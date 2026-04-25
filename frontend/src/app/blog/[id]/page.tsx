'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Lock, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { api, getGoogleSignInUrl, type components } from '@/lib/api';

type BlogPost = components['schemas']['BlogPost'];

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    api.GET('/auth/me').then(({ data }) => setIsAuthenticated(!!data)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      const { data: result } = await api.GET('/blog/{id}', { params: { path: { id } } });
      if (!result) {
        setError('記事が見つかりません');
      } else {
        setPost(result);
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

  const isLocked = post.membersOnly && post.isLocked;

  const dateStr = new Date(post.publishedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="pt-20">
      {/* Content */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          <Link
            href="/blog/"
            className="inline-flex items-center gap-2 text-taupe hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            ブログ一覧に戻る
          </Link>

          {isLocked ? (
            <div className="text-center max-w-2xl mx-auto">
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
                    <a href={getGoogleSignInUrl()} className="btn btn-primary">
                      ログイン
                    </a>
                    <Link href="/supporters/" className="btn btn-outline">
                      会員登録について
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:gap-12">
              {/* Left: Thumbnail */}
              <div className="md:w-1/2 flex-shrink-0">
                {post.thumbnail?.url ? (
                  <img
                    src={post.thumbnail.url}
                    alt={post.title}
                    className="w-full h-auto object-contain rounded"
                  />
                ) : (
                  <div className="relative w-full min-h-[300px] flex items-center justify-center rounded overflow-hidden">
                    <img
                      src="/images/textures/header-blog.jpeg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-burgundy-black/40" />
                    <h2 className="relative z-10 text-2xl md:text-3xl text-white text-center px-8">{post.title}</h2>
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="md:w-1/2 pt-8 md:pt-0">
                <h2 className="text-2xl mb-4">{post.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-taupe text-sm mb-8">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="flex-shrink-0" />
                    <time dateTime={post.publishedAt}>{dateStr}</time>
                  </div>
                  {post.category && (
                    <span className="text-burgundy-accent">
                      {post.category.name}
                    </span>
                  )}
                  {post.membersOnly && (
                    <span className="flex items-center gap-1 text-burgundy-accent">
                      <Lock size={12} />
                      会員限定
                    </span>
                  )}
                </div>

                <div className="prose prose-invert prose-burgundy max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      img: ({ src, alt }) => (
                        <img
                          src={src}
                          alt={alt || ''}
                          className="w-full rounded my-4"
                          loading="lazy"
                        />
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-burgundy-accent hover:text-white transition-colors underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {post.content || ''}
                  </ReactMarkdown>
                </div>

                {/* Share */}
                <div className="mt-8 pt-6 border-t border-burgundy-border">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-taupe hover:text-beige transition-colors text-sm"
                  >
                    <Share2 size={16} />
                    この記事をシェア
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
