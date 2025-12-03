'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { BlogPost } from '@/lib/microcms';
import Image from 'next/image';

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories from posts or define static ones if preferred
  // Here, assuming categories are dynamic from posts or we keep the static list for now matching CMS IDs
  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'concert', label: 'コンサート' },
    { id: 'recording', label: 'レコーディング' },
    { id: 'daily', label: '日常' },
    { id: 'media', label: 'メディア' },
  ];

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(post => {
        const catId = typeof post.category === 'object' ? post.category?.id : post.category;
        return catId === selectedCategory;
    });

  return (
    <>
      {/* Category Filter */}
      <section className="py-8 px-6 border-b border-[#8b4545]/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
               const categoryLabel = typeof post.category === 'object' ? post.category?.name : post.category || 'その他';
               const imageGradient = 'from-[#1a1a2e] to-[#16213e]'; // Default fallback

               return (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <div className="velvet-card overflow-hidden cursor-pointer group h-full flex flex-col">
                  {/* Image placeholder */}
                  <div className="relative h-48 overflow-hidden">
                    {post.thumbnail ? (
                        <Image 
                            src={post.thumbnail.url} 
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${imageGradient} transition-transform duration-700 group-hover:scale-110`} />
                    )}
                    
                    {/* Members only badge */}
                    {post.membersOnly && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1.5 text-xs font-bold tracking-wider rounded bg-white text-black flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          会員限定
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="px-2.5 py-1 bg-white/10 border border-[#8b4545]/30 text-white rounded">
                        {categoryLabel}
                      </span>
                      <span className="text-[#f0f0f0]/50">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#d4c4b0] transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[#f0f0f0]/80 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Read more */}
                    <div className="mt-4 flex items-center gap-2 text-white text-sm font-bold group-hover:gap-3 transition-all duration-300">
                      <span>続きを読む</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#8b4545]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#8b4545]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
