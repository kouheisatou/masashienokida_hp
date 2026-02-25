'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { type BlogPost, getBlogPosts } from '@/lib/api-client';

// Categories for filtering
const categories = [
  { id: '', name: 'すべて' },
  { id: 'concert', name: 'コンサート' },
  { id: 'daily', name: '日常' },
  { id: 'practice', name: '練習・レッスン' },
  { id: 'travel', name: '旅' },
  { id: 'members', name: '会員限定' },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getBlogPosts({ page: currentPage, category: selectedCategory || undefined });
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }

      setLoading(false);
    };

    fetchPosts();
  }, [currentPage, selectedCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container">
          <h1 className="text-center mb-6">BLOG</h1>
          <p className="text-taupe text-center max-w-2xl mx-auto">
            コンサートの舞台裏、日々の練習、旅の記録など、
            <br />
            演奏活動の様子をお伝えします。
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-8">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-burgundy-accent text-white'
                    : 'bg-burgundy-light text-taupe hover:text-beige'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-taupe">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-400">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-taupe">記事がありません</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article key={post.id} className="card overflow-hidden group">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-burgundy-light relative">
                      {post.thumbnail?.url ? (
                        <img
                          src={post.thumbnail.url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-burgundy-border text-4xl">♪</span>
                        </div>
                      )}
                      {post.membersOnly && (
                        <div className="absolute top-3 right-3 bg-burgundy-accent/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Lock size={10} />
                          会員限定
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {post.category && (
                        <span className="text-burgundy-accent text-xs mb-2 block">
                          {post.category.name}
                        </span>
                      )}

                      <h2 className="text-lg mb-3 group-hover:text-burgundy-accent transition-colors line-clamp-2">
                        <Link href={`/blog/${post.id}/`}>{post.title}</Link>
                      </h2>

                      {post.excerpt && (
                        <p className="text-taupe text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-taupe text-xs">
                        <Calendar size={12} />
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded bg-burgundy-light text-taupe hover:text-beige disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="前のページ"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <span className="text-taupe text-sm">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded bg-burgundy-light text-taupe hover:text-beige disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="次のページ"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Members CTA */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Lock size={32} className="mx-auto mb-4 text-burgundy-accent" />
            <h2 className="mb-4">会員限定コンテンツ</h2>
            <p className="text-taupe mb-8">
              サポーターズクラブ会員になると、
              <br />
              限定記事やインタビュー、舞台裏の様子をご覧いただけます。
            </p>
            <Link href="/supporters/" className="btn btn-primary">
              サポーターズクラブについて
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
