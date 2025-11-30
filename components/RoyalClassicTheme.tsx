import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS, IMAGES, PLACEHOLDERS } from '../constants';

const RoyalClassicTheme: React.FC = () => {
  return (
    <div className="font-serif bg-[#Fdfdfa] text-[#2b2b2b] min-h-screen selection:bg-[#ab966d] selection:text-white">
      
      {/* Sidebar / Vertical Nav */}
      <nav className="fixed right-0 top-0 h-full w-20 md:w-32 py-12 flex flex-col items-center justify-between z-50 border-l border-[#e5e5e5] bg-[#Fdfdfa]/90 backdrop-blur-sm">
        <div className="text-xl font-bold tracking-widest writing-vertical-rl text-[#ab966d]">ME.</div>
        <div className="flex flex-col gap-8 items-center">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.href} 
              href={`#${item.href}`} 
              className="writing-vertical-rl text-xs tracking-[0.3em] uppercase hover:text-[#ab966d] transition-colors duration-500"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="w-[1px] h-24 bg-[#2b2b2b]"></div>
      </nav>

      <main className="pr-20 md:pr-32">
        {/* Hero: No slogans. Just identity. */}
        <section id="home" className="min-h-screen relative flex items-center justify-center p-8">
           <div className="absolute top-12 left-12 md:top-24 md:left-24 z-10">
              <h1 className="text-4xl md:text-6xl font-medium tracking-widest leading-loose writing-vertical-rl h-[60vh]">
                榎田 雅志
              </h1>
           </div>
           
           <div className="w-full max-w-3xl aspect-[3/4] md:aspect-[4/3] relative overflow-hidden shadow-2xl">
              <img src={IMAGES.hero_royal} alt="Piano" className="w-full h-full object-cover grayscale opacity-90" />
           </div>

           <div className="absolute bottom-12 left-12">
              <p className="text-sm tracking-widest">Pianist / 1986</p>
           </div>
        </section>

        {/* Biography: Factual */}
        <section id="biography" className="py-32 px-6 md:px-24 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
             <div className="md:w-1/3 pt-12">
                <h2 className="text-lg font-bold mb-8 border-b border-[#2b2b2b] pb-2 inline-block">Biography</h2>
                <div className="aspect-[3/4] bg-[#f0f0f0]">
                   <img src={PLACEHOLDERS.portrait} alt="Portrait" className="w-full h-full object-cover mix-blend-multiply" />
                </div>
             </div>
             <div className="md:w-2/3">
                <p className="text-lg leading-loose text-justify mb-12 font-light">
                  {PROFILE.bioShort}
                </p>
                <ul className="space-y-4 text-sm font-light border-l border-[#e5e5e5] pl-8">
                  {PROFILE.history.map((h, i) => (
                    <li key={i} className="leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </section>

        {/* Concerts: List style */}
        <section id="concerts" className="py-32 bg-[#f4f4f0] px-6 md:px-24">
           <div className="max-w-4xl mx-auto">
             <h2 className="text-center text-2xl font-medium mb-16 tracking-widest">Performance</h2>
             <div className="space-y-12">
               {UPCOMING_CONCERTS.map((c) => (
                 <div key={c.id} className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 border-b border-[#d4d4d0] pb-8 group">
                    <div className="md:w-32 text-sm font-bold text-[#ab966d]">{c.date}</div>
                    <div className="flex-1">
                       <h3 className="text-xl md:text-2xl font-medium mb-2 group-hover:text-[#ab966d] transition-colors">{c.title}</h3>
                       <p className="text-sm text-[#666]">{c.location}</p>
                    </div>
                    <div>
                       <a href="#" className="text-xs border border-[#2b2b2b] px-6 py-2 hover:bg-[#2b2b2b] hover:text-white transition-colors">Ticket</a>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Blog: Text only */}
        <section id="blog" className="py-32 px-6 md:px-24 max-w-5xl mx-auto">
           <h2 className="text-lg font-bold mb-12 border-b border-[#2b2b2b] pb-2 inline-block">Journal</h2>
           <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
              {RECENT_POSTS.map((post) => (
                 <article key={post.id} className="group cursor-pointer">
                    <div className="text-xs text-[#999] mb-2">{post.date} / {post.category}</div>
                    <h3 className="text-lg font-medium leading-normal group-hover:underline underline-offset-4 decoration-[#ab966d]">
                       {post.title}
                    </h3>
                 </article>
              ))}
           </div>
        </section>

        <footer id="contact" className="py-24 border-t border-[#e5e5e5] text-center">
           <h2 className="text-2xl font-medium mb-8">Contact</h2>
           <p className="text-sm mb-8">info@masashi-enokida.com</p>
           <p className="text-[10px] tracking-widest opacity-50">&copy; Masashi Enokida</p>
        </footer>
      </main>
    </div>
  );
};

export default RoyalClassicTheme;