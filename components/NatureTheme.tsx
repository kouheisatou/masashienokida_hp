import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS, IMAGES } from '../constants';

const NatureTheme: React.FC = () => {
  return (
    <div className="font-serif bg-[#e6e2dd] text-[#4a4744] min-h-screen">
      
      {/* Header */}
      <header className="py-8 px-8 md:px-16 flex justify-between items-baseline">
         <div className="font-bold text-lg tracking-tight">masashi enokida</div>
         <nav className="hidden md:flex gap-8 text-sm font-sans text-[#787572]">
            {NAV_ITEMS.map(item => (
               <a key={item.href} href={`#${item.href}`} className="hover:text-black transition-colors">{item.label}</a>
            ))}
         </nav>
      </header>

      {/* Hero: Raw collage */}
      <section id="home" className="px-8 md:px-16 py-12 md:py-24">
         <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
               <img src={IMAGES.hero_nature} alt="Piano" className="w-full aspect-square object-cover rounded-sm shadow-xl" />
            </div>
            <div className="order-1 md:order-2 relative">
               <h1 className="text-5xl md:text-7xl font-medium leading-tight mb-8 text-[#2c2a28]">
                  Enokida<br/>Masashi
               </h1>
               <div className="text-sm font-sans text-[#787572] leading-relaxed max-w-sm">
                  <p className="mb-4">Pianist born in 1986, Miyazaki.</p>
                  <p>{PROFILE.history[PROFILE.history.length-1]}</p>
               </div>
            </div>
         </div>
      </section>

      {/* Bio: Simple Text */}
      <section id="biography" className="py-24 px-8 md:px-16 bg-[#dedad5]">
         <div className="max-w-3xl">
            <h2 className="text-sm font-sans font-bold uppercase tracking-widest mb-12 text-[#999]">01. Profile</h2>
            <p className="text-xl md:text-2xl leading-relaxed text-[#3a3836] mb-12">
               {PROFILE.bioShort}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-[#666]">
               {PROFILE.history.map((h, i) => (
                  <div key={i} className="border-b border-[#ccc] pb-2">{h}</div>
               ))}
            </div>
         </div>
      </section>

      {/* Concerts: Simple Grid */}
      <section id="concerts" className="py-24 px-8 md:px-16">
         <h2 className="text-sm font-sans font-bold uppercase tracking-widest mb-12 text-[#999]">02. Live</h2>
         <div className="grid md:grid-cols-3 gap-8">
            {UPCOMING_CONCERTS.map(c => (
               <div key={c.id} className="bg-white p-8 rounded-sm hover:shadow-lg transition-shadow duration-500">
                  <div className="text-xs font-sans text-[#999] mb-4">{c.date}</div>
                  <h3 className="text-xl font-medium mb-4 text-[#2c2a28]">{c.title}</h3>
                  <div className="text-sm text-[#787572]">{c.location}</div>
               </div>
            ))}
         </div>
      </section>

      {/* Blog: Text List */}
      <section id="blog" className="py-24 px-8 md:px-16 bg-[#3a3836] text-[#e6e2dd]">
         <h2 className="text-sm font-sans font-bold uppercase tracking-widest mb-12 opacity-50">03. Updates</h2>
         <div className="max-w-4xl space-y-8">
            {RECENT_POSTS.slice(0, 5).map(post => (
               <div key={post.id} className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b border-[#555] pb-8 group cursor-pointer hover:border-[#888] transition-colors">
                  <h3 className="text-xl font-medium group-hover:translate-x-2 transition-transform">{post.title}</h3>
                  <div className="text-xs font-sans opacity-50">{post.date}</div>
               </div>
            ))}
         </div>
      </section>

      <footer id="contact" className="py-12 px-8 md:px-16 text-xs font-sans text-[#999] flex justify-between">
         <div>&copy; Masashi Enokida</div>
         <div>Contact</div>
      </footer>
    </div>
  );
};

export default NatureTheme;