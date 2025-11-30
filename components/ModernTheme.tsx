import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS } from '../constants';
import { ArrowRight, Instagram, Youtube } from 'lucide-react';

const ModernTheme: React.FC = () => {
  return (
    <div className="font-sans bg-white text-black min-h-screen selection:bg-black selection:text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 lg:h-screen lg:sticky lg:top-0 p-8 flex flex-col justify-between border-r border-gray-100 bg-white z-40">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter leading-none mb-1">{SITE_NAME.split(' ')[0]}<br/>{SITE_NAME.split(' ')[1]}</h1>
            <p className="text-sm text-gray-500 mb-12">Pianist / Educator</p>
            <nav className="space-y-4">
              {NAV_ITEMS.map((item, idx) => (
                <a key={item.href} href={`#${item.href}`} className="block text-lg font-medium hover:pl-2 transition-all duration-300 flex items-center group">
                  <span className="text-xs text-gray-300 mr-3 opacity-0 group-hover:opacity-100 font-mono">0{idx + 1}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex gap-4">
             <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-colors"><Instagram size={18} /></a>
             <a href="#" className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-colors"><Youtube size={18} /></a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9">
          
          {/* Hero Image */}
          <section id="home" className="h-[70vh] relative overflow-hidden">
             <img src="https://picsum.photos/1600/900?piano" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50" />
             <div className="absolute bottom-8 left-8 bg-white p-6 max-w-sm shadow-sm">
                <p className="font-mono text-xs text-gray-400 mb-2">LATEST PERFORMANCE</p>
                <h2 className="text-xl font-bold leading-tight">Chopin: Raindrop Prelude</h2>
                <a href="#" className="inline-flex items-center text-sm font-bold mt-4 hover:underline">Watch on YouTube <ArrowRight size={14} className="ml-1"/></a>
             </div>
          </section>

          {/* Intro Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-100">
             {['Concerts', 'Lessons', 'Media', 'Blog'].map((item) => (
               <div key={item} className="p-8 border-r border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                  <h3 className="font-bold text-lg">{item}</h3>
                  <span className="text-xs text-gray-400 font-mono">EXPLORE &rarr;</span>
               </div>
             ))}
          </div>

          {/* Content Grid */}
          <div className="p-8 lg:p-16">
            
            {/* Bio Section */}
            <section id="biography" className="mb-32">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="md:w-1/3">
                  <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold mb-4">PROFILE</span>
                  <h2 className="text-4xl font-bold tracking-tight mb-6">Touching Souls<br/>Through Sound</h2>
                </div>
                <div className="md:w-2/3">
                  <p className="text-xl leading-relaxed text-gray-800 mb-8">{PROFILE.bioShort}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {PROFILE.history.slice(0,4).map((h, i) => (
                       <div key={i} className="p-4 bg-gray-50 rounded-lg">
                         <span className="block w-2 h-2 bg-blue-600 rounded-full mb-2"></span>
                         <p className="text-sm font-medium">{h}</p>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Concerts List - Minimal */}
            <section id="concerts" className="mb-32">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight">Schedule</h2>
                <a href="#" className="text-sm font-bold border-b-2 border-black pb-1">VIEW ALL</a>
              </div>
              
              <div className="divide-y divide-gray-100">
                {UPCOMING_CONCERTS.map(c => (
                  <div key={c.id} className="py-8 group flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-xl">
                    <div className="md:w-1/4 mb-2 md:mb-0">
                      <span className="font-mono text-sm text-gray-500">{c.date}</span>
                    </div>
                    <div className="md:w-1/2 mb-2 md:mb-0">
                      <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">{c.title}</h3>
                      <p className="text-gray-500">{c.location}</p>
                    </div>
                    <div className="md:w-1/4 text-right">
                       <button className="px-6 py-2 rounded-full border border-gray-200 text-sm font-bold hover:bg-black hover:text-white transition-colors">Ticket Info</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Blog Masonry-ish */}
            <section id="blog" className="mb-32">
              <h2 className="text-4xl font-bold tracking-tight mb-12">Journal</h2>
              <div className="grid md:grid-cols-3 gap-8">
                 {RECENT_POSTS.slice(0,5).map((post, i) => (
                   <article key={post.id} className={`flex flex-col ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                      <div className={`bg-gray-100 overflow-hidden mb-4 rounded-2xl ${i===0 ? 'aspect-video' : 'aspect-square'}`}>
                        <img src={`https://picsum.photos/800/600?random=${i+10}`} alt="Blog" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">{post.category}</span>
                        <span className="text-xs text-gray-400 py-1">{post.date}</span>
                      </div>
                      <h3 className={`font-bold hover:text-blue-600 transition-colors ${i===0 ? 'text-2xl' : 'text-lg'}`}>{post.title}</h3>
                   </article>
                 ))}
              </div>
            </section>

             {/* Footer Area */}
             <footer id="contact" className="bg-black text-white p-12 rounded-3xl text-center md:text-left">
                <div className="grid md:grid-cols-2 gap-12">
                   <div>
                     <h2 className="text-3xl font-bold mb-6">Let's Create Music</h2>
                     <p className="text-gray-400 mb-8 max-w-md">コンサートの出演依頼、レッスン、その他お問い合わせはお気軽にどうぞ。</p>
                     <a href="mailto:contact@example.com" className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-blue-600 hover:text-white transition-colors">
                        CONTACT ME
                     </a>
                   </div>
                   <div className="flex flex-col justify-between items-end">
                      <div className="flex space-x-4 mb-8 md:mb-0">
                        <Instagram />
                        <Youtube />
                      </div>
                      <p className="text-xs text-gray-600 uppercase">© 2025 Masashi Enokida</p>
                   </div>
                </div>
             </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernTheme;