import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS, IMAGES } from '../constants';

const StageTheme: React.FC = () => {
  return (
    <div className="font-serif bg-[#1a0000] text-[#e0e0e0] min-h-screen">
      
      {/* Nav */}
      <nav className="absolute top-0 w-full z-50 p-8 flex justify-center">
         <div className="flex gap-12 text-xs uppercase tracking-[0.2em] font-light text-[#cc9999]">
            {NAV_ITEMS.map(item => (
               <a key={item.href} href={`#${item.href}`} className="hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
                  {item.label}
               </a>
            ))}
         </div>
      </nav>

      {/* Hero */}
      <section id="home" className="h-screen flex flex-col items-center justify-center relative shadow-[inset_0_0_100px_#000]">
         <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-white mb-6 drop-shadow-xl">
               Enokida
            </h1>
            <div className="w-16 h-[2px] bg-[#800] mx-auto mb-6"></div>
            <p className="text-sm tracking-widest uppercase text-[#cc9999]">Pianist</p>
         </div>
         <div className="absolute inset-0 z-0 opacity-40">
             <img src={IMAGES.hero_stage} alt="Hall" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-[#1a0000] opacity-80 mix-blend-multiply"></div>
         </div>
      </section>

      {/* Bio */}
      <section id="biography" className="py-32 px-6">
         <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xs font-bold text-[#800] uppercase tracking-widest mb-12">Artist Profile</h2>
            <div className="text-xl md:text-2xl leading-relaxed text-[#d0d0d0] mb-16 font-light">
               {PROFILE.bioShort}
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-left border-t border-[#330a0a] pt-12">
               <div className="md:text-right text-[#cc9999] text-sm">History</div>
               <div className="text-sm font-sans text-[#a0a0a0] space-y-2">
                  {PROFILE.history.slice(0, 5).map((h, i) => (
                     <div key={i}>{h}</div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Concerts: Program Style */}
      <section id="concerts" className="py-32 bg-[#260505] px-6">
         <div className="max-w-4xl mx-auto border-4 double border-[#500] p-8 md:p-16 bg-[#1a0000]">
            <h2 className="text-center text-3xl font-medium mb-12 italic text-white">Concert Schedule</h2>
            <div className="space-y-8">
               {UPCOMING_CONCERTS.map(c => (
                  <div key={c.id} className="flex flex-col md:flex-row justify-between items-center text-center md:text-left pb-8 border-b border-[#330a0a] last:border-0">
                     <div className="mb-4 md:mb-0">
                        <div className="text-lg text-white font-medium mb-1">{c.title}</div>
                        <div className="text-sm text-[#884444]">{c.location}</div>
                     </div>
                     <div className="flex flex-col items-center md:items-end">
                        <div className="text-xl font-bold text-[#cc9999] mb-2">{c.date}</div>
                        <button className="text-[10px] uppercase tracking-widest border border-[#500] px-4 py-1 hover:bg-[#500] hover:text-white transition-colors">
                           Inquiry
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* News */}
      <section id="blog" className="py-32 px-6 text-center">
         <h2 className="text-xs font-bold text-[#800] uppercase tracking-widest mb-12">Updates</h2>
         <div className="max-w-2xl mx-auto space-y-6">
            {RECENT_POSTS.slice(0,4).map(post => (
               <a key={post.id} href="#" className="block hover:bg-[#260505] p-4 transition-colors border-l-2 border-transparent hover:border-[#800]">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-white">{post.title}</span>
                     <span className="text-[#666] text-xs font-sans">{post.date}</span>
                  </div>
               </a>
            ))}
         </div>
      </section>

      <footer id="contact" className="py-12 text-center text-[#552222] text-xs">
         <p>&copy; Masashi Enokida</p>
      </footer>
    </div>
  );
};

export default StageTheme;