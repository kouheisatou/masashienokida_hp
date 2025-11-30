import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS, IMAGES } from '../constants';

const NocturneTheme: React.FC = () => {
  return (
    <div className="bg-[#0a0a0a] text-[#a0a0a0] min-h-screen font-serif selection:bg-[#333] selection:text-white">
      
      {/* Fixed Nav: Tiny dots */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-6">
        {NAV_ITEMS.map(item => (
          <a key={item.href} href={`#${item.href}`} className="group flex items-center gap-4 flex-row-reverse">
             <div className="w-1.5 h-1.5 bg-[#333] rounded-full group-hover:bg-white transition-colors"></div>
             <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               {item.label}
             </span>
          </a>
        ))}
      </nav>

      {/* Hero: Fade in image, centered small text */}
      <section id="home" className="h-screen flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 z-0">
            <img src={IMAGES.hero_nocturne} alt="Atmosphere" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>
         </div>
         <div className="relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-light tracking-[0.5em] text-[#e0e0e0] mb-8">
               {SITE_NAME}
            </h1>
            <p className="text-xs uppercase tracking-[0.3em] text-[#555]">
               Pianist
            </p>
         </div>
      </section>

      {/* Bio: Floating text in void */}
      <section id="biography" className="min-h-screen flex items-center py-24 px-8 md:px-32">
         <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl leading-loose font-light text-[#ccc] mb-16 text-center">
               {PROFILE.bioShort}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-xs font-sans text-[#666] tracking-wide">
               {PROFILE.history.map((h, i) => (
                  <div key={i} className="border-l border-[#333] pl-4 py-1">
                     {h}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Concerts: Tracklist style */}
      <section id="concerts" className="py-32 px-8 md:px-32 max-w-5xl mx-auto">
         <div className="mb-16 text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#555]">Upcoming</span>
         </div>
         <div className="space-y-1">
            {UPCOMING_CONCERTS.map((c, i) => (
               <div key={c.id} className="flex items-center gap-8 py-6 border-b border-[#222] hover:bg-[#111] transition-colors group cursor-pointer px-4">
                  <div className="text-xs font-mono text-[#444] w-8">0{i+1}</div>
                  <div className="text-xs font-mono text-[#888] w-24">{c.date}</div>
                  <div className="flex-1 text-base md:text-xl text-[#d0d0d0] font-light group-hover:text-white transition-colors">
                     {c.title}
                  </div>
                  <div className="hidden md:block text-xs text-[#555] w-32 text-right">
                     {c.location}
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Blog: Cards in the dark */}
      <section id="blog" className="py-32 px-8 md:px-32">
         <div className="grid md:grid-cols-3 gap-8 md:gap-16">
            {RECENT_POSTS.slice(0, 3).map(post => (
               <div key={post.id} className="group cursor-pointer">
                  <div className="border-l border-[#333] pl-4 transition-all group-hover:border-white duration-500">
                     <div className="text-[10px] text-[#555] mb-4 uppercase tracking-wider">{post.date}</div>
                     <h3 className="text-lg font-light text-[#bbb] leading-relaxed group-hover:text-white mb-4">
                        {post.title}
                     </h3>
                     <span className="text-[10px] text-[#444] group-hover:text-[#888] transition-colors">Read entry &rarr;</span>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <footer id="contact" className="py-24 text-center text-xs text-[#444]">
         <div className="w-12 h-[1px] bg-[#333] mx-auto mb-8"></div>
         <p className="tracking-widest mb-4">INFO@MASASHI-ENOKIDA.COM</p>
         <div className="flex justify-center gap-6 opacity-50">
            <span>Instagram</span>
            <span>YouTube</span>
         </div>
      </footer>
    </div>
  );
};

export default NocturneTheme;