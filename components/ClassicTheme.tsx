import React from 'react';
import { SITE_NAME, SITE_ROLE, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS } from '../constants';
import { Calendar, ChevronRight, Music, Mail } from 'lucide-react';

const ClassicTheme: React.FC = () => {
  return (
    <div className="font-serif bg-classic-cream text-classic-text min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-stone-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl tracking-widest uppercase font-display border-2 border-classic-text px-2 py-1">
            M.E.
          </div>
          <nav className="hidden md:flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={`#${item.href}`} className="text-sm uppercase tracking-widest hover:text-classic-gold transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-classic-gold tracking-[0.2em] mb-4 uppercase text-sm">Official Website</p>
          <h1 className="text-5xl md:text-7xl font-display mb-6">{SITE_NAME}</h1>
          <p className="text-xl italic text-stone-600 mb-12">{SITE_ROLE}</p>
          <div className="relative w-full aspect-[21/9] overflow-hidden rounded-sm shadow-xl">
             <img 
               src="https://picsum.photos/1200/600?grayscale" 
               alt="Piano performance" 
               className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
             />
          </div>
        </div>
      </section>

      {/* Biography */}
      <section id="biography" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
             <div className="absolute -top-4 -left-4 w-full h-full border-2 border-classic-gold" />
             <img src="https://picsum.photos/500/600?people" alt="Portrait" className="relative z-10 w-full shadow-lg" />
          </div>
          <div>
            <h2 className="text-3xl font-display mb-6 border-b border-classic-gold pb-2 inline-block">Biography</h2>
            <h3 className="text-xl mb-4">{PROFILE.name}</h3>
            <p className="leading-loose text-stone-600 mb-6 text-justify">
              {PROFILE.bioShort}
            </p>
            <ul className="space-y-2 mb-8 text-sm text-stone-500">
              {PROFILE.history.map((h, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-classic-gold mr-2">✦</span> {h}
                </li>
              ))}
            </ul>
            <button className="px-8 py-3 bg-classic-text text-white text-sm tracking-widest hover:bg-classic-gold transition-colors">
              VIEW FULL PROFILE
            </button>
          </div>
        </div>
      </section>

      {/* Concerts */}
      <section id="concerts" className="py-24 bg-classic-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-classic-gold text-4xl mb-4 block"><Music size={40} className="mx-auto" /></span>
          <h2 className="text-3xl font-display mb-12">Upcoming Concerts</h2>
          
          <div className="space-y-6">
            {UPCOMING_CONCERTS.map((concert) => (
              <div key={concert.id} className="bg-white p-8 shadow-sm hover:shadow-md transition-shadow border-l-4 border-classic-gold text-left flex flex-col md:flex-row justify-between items-center group">
                <div className="mb-4 md:mb-0">
                  <p className="text-classic-gold font-bold mb-1">{concert.date}</p>
                  <h3 className="text-xl font-display group-hover:text-classic-gold transition-colors">{concert.title}</h3>
                  <p className="text-stone-500 text-sm">{concert.location}</p>
                </div>
                <button className="text-xs uppercase tracking-widest border border-stone-300 px-6 py-2 hover:bg-classic-text hover:text-white transition-colors">
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog/News */}
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 border-b border-stone-200 pb-4">
            <h2 className="text-3xl font-display">Latest News</h2>
            <a href="#" className="text-sm italic hover:text-classic-gold flex items-center">
              View All <ChevronRight size={14} className="ml-1" />
            </a>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {RECENT_POSTS.slice(0, 3).map((post) => (
              <div key={post.id} className="group cursor-pointer">
                <div className="overflow-hidden mb-4 h-48 bg-stone-100">
                  <img src={`https://picsum.photos/400/300?random=${post.id}`} alt="Blog" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex items-center text-xs text-stone-400 mb-2">
                  <Calendar size={12} className="mr-1" /> {post.date}
                  <span className="mx-2">|</span>
                  <span className="uppercase tracking-wider text-classic-gold">{post.category}</span>
                </div>
                <h3 className="text-lg leading-tight group-hover:underline decoration-classic-gold underline-offset-4 mb-2">
                  {post.title}
                </h3>
                <p className="text-stone-500 text-sm line-clamp-2">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-stone-900 text-stone-300">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Mail size={48} className="mx-auto mb-6 text-classic-gold" />
          <h2 className="text-3xl font-display text-white mb-6">Contact</h2>
          <p className="mb-8 font-light">
            演奏のご依頼、レッスンのお問い合わせはこちらからお願いいたします。
          </p>
          <a href="mailto:info@masashi-enokida.com" className="inline-block border border-classic-gold text-classic-gold px-10 py-4 hover:bg-classic-gold hover:text-white transition-colors uppercase tracking-widest">
            Send Message
          </a>
        </div>
      </section>

      <footer className="bg-black text-stone-500 py-8 text-center text-xs tracking-widest">
        &copy; 2025 Masashi Enokida. All Rights Reserved.
      </footer>
    </div>
  );
};

export default ClassicTheme;