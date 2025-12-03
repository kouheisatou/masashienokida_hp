import Link from 'next/link';
import Button from '@/components/Button';
import { client, BlogPost } from '@/lib/microcms';
import BlogList from './BlogList';

// Re-validate every hour
export const revalidate = 3600;

async function getPosts(): Promise<BlogPost[]> {
  if (!client) return [];
  
  try {
    const data = await client.getList<BlogPost>({
      endpoint: 'posts',
      queries: { limit: 100 }, // Fetch 100 posts max for now
    });
    return data.contents;
  } catch (error) {
    console.error('Failed to fetch posts', error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 theater-frame spotlight">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="ornament mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-[0.2em]">
              BLOG
            </h1>
          </div>
          <p className="text-[#f0f0f0]/80 text-lg leading-relaxed">
            日々の想い、音楽への情熱を綴ります
          </p>
        </div>
      </section>

      {/* Blog List (Filter + Grid) */}
      <BlogList posts={posts} />

      {/* CTA Section */}
      <section className="py-20 px-6 stage-gradient">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-wider">
            会員限定コンテンツ
          </h2>
          <p className="text-[#f0f0f0]/80 mb-8 leading-relaxed">
            サポーターズクラブ会員の方は、<br />
            会員限定の記事や動画など、特別なコンテンツをお楽しみいただけます。
          </p>
          <Button variant="outline" size="lg">
            サポーターズクラブについて
          </Button>
        </div>
      </section>
    </div>
  );
}