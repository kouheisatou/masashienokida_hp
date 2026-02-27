'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Lock, ChevronLeft, ChevronRight, Crown, LogIn } from 'lucide-react';
import { api, getGoogleSignInUrl, type components } from '@/lib/api';

type BlogPost = components['schemas']['BlogPostSummary'];
type BlogCategory = components['schemas']['BlogCategory'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    api.GET('/auth/me').then(({ data }) => {
      if (data) {
        setIsAuthenticated(true);
        setUserRole(data.user.role);
      }
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));

    api.GET('/blog/categories').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.GET('/blog', {
          params: { query: { page: currentPage, category: selectedCategory || undefined } },
        });
        if (data) {
          setPosts(data.posts);
          setTotalPages(data.totalPages);
        }
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

  const hasMembersOnlyPosts = posts.some((p) => p.membersOnly);
  const isGoldMember = userRole === 'MEMBER_GOLD';

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-80 flex items-end pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/blog-hero/1600/600)',
            filter: 'brightness(0.45)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-black via-burgundy-black/20 to-transparent" />
        <div className="relative z-10 container">
          <h1 className="mb-4">BLOG</h1>
          <p className="text-taupe max-w-2xl">
            コンサートの舞台裏、日々の練習、旅の記録など、
            <br />
            演奏活動の様子をお伝えします。
          </p>
        </div>
      </section>

      {/* Blog Content Section */}
      <section className="section-padding bg-burgundy">
        <div className="container">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                selectedCategory === ''
                  ? 'bg-burgundy-accent text-white'
                  : 'bg-burgundy-light text-taupe hover:text-beige'
              }`}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-burgundy-accent text-white'
                    : 'bg-burgundy-light text-taupe hover:text-beige'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Login Banner — shown for non-authenticated users */}
          {authChecked && !isAuthenticated && (
            <div className="max-w-3xl mx-auto mb-12">
              <div className="card px-6 py-4 flex flex-col sm:flex-row items-center gap-4 border-burgundy-accent/40">
                <div className="flex items-center gap-3 flex-grow text-center sm:text-left">
                  <Lock size={18} className="text-burgundy-accent hidden sm:block flex-shrink-0" />
                  <p className="text-taupe text-sm">
                    <span className="text-beige">ログイン</span>すると会員限定の記事をお読みいただけます。
                    初めての方は自動的に無料会員として登録されます。
                  </p>
                </div>
                <a
                  href={getGoogleSignInUrl()}
                  className="btn btn-primary text-sm py-2 px-6 flex items-center gap-2 flex-shrink-0"
                >
                  <LogIn size={14} />
                  ログイン
                </a>
              </div>
            </div>
          )}

          {/* Upgrade Banner — shown for authenticated non-gold members when viewing member-only content */}
          {authChecked && isAuthenticated && !isGoldMember && (
            <div className="max-w-3xl mx-auto mb-12">
              <div className="card px-6 py-4 flex flex-col sm:flex-row items-center gap-4 border-burgundy-accent/40">
                <div className="flex items-center gap-3 flex-grow text-center sm:text-left">
                  <Crown size={18} className="text-burgundy-accent hidden sm:block flex-shrink-0" />
                  <p className="text-taupe text-sm">
                    <span className="text-beige">ゴールド会員</span>になると、すべての限定記事をお読みいただけます。
                  </p>
                </div>
                <Link
                  href="/supporters/"
                  className="btn btn-primary text-sm py-2 px-6 flex items-center gap-2 flex-shrink-0"
                >
                  <Crown size={14} />
                  詳しく見る
                </Link>
              </div>
            </div>
          )}

          {/* Blog Posts Grid */}
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
                          <span className="text-burgundy-border text-4xl">&#9834;</span>
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

      {/* Members CTA — contextual based on auth state */}
      {authChecked && !isGoldMember && (
        <section className="section-padding">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <Lock size={32} className="mx-auto mb-4 text-burgundy-accent" />
              <h2 className="mb-4">会員限定コンテンツ</h2>
              {!isAuthenticated ? (
                <>
                  <p className="text-taupe mb-8">
                    ログインすると会員限定の記事をお読みいただけます。
                    <br />
                    Googleアカウントで簡単にログインできます。
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a href={getGoogleSignInUrl()} className="btn btn-primary">
                      ログインして読む
                    </a>
                    <Link href="/supporters/" className="btn btn-outline">
                      サポーターズクラブについて
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-taupe mb-8">
                    ゴールド会員になると、すべての限定記事や
                    <br />
                    インタビュー、舞台裏の様子をご覧いただけます。
                  </p>
                  <Link href="/supporters/" className="btn btn-primary">
                    ゴールド会員になる
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
