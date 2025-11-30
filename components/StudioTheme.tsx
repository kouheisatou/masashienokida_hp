import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS, IMAGES, PLACEHOLDERS } from '../constants';
import { ArrowUpRight } from 'lucide-react';

const StudioTheme: React.FC = () => {
  return (
    <div className="font-sans bg-[#f2f2f2] text-[#111] min-h-screen">
      
      {/* Header: Sticky Grid */}
      <header className="fixed top-0 w-full z-40 bg-[#f2f2f2] border-b border-[#ccc] h-16 flex items-center justify-between px-6 font-mono text-xs">
         <div>{SITE_NAME} [PIANIST]</div>
         <nav className="flex gap-8">
            {NAV_ITEMS.map(item => (
               <a key={item.href} href={`#${item.href}`} className="hover:bg-black hover:text-white px-2 py-1 transition-colors">
                  {item.label}
               </a>
            ))}
         </nav>
      </header>

      <main className="pt-16">
        {/* Hero: Split Screen Data */}
        <section id="home" className="min-h-[90vh] grid md:grid-cols-2 border-b border-[#ccc]">
           <div className="p-12 md:p-24 flex flex-col justify-end border-r border-[#ccc]">
              <div className="font-mono text-xs mb-8 space-y-1 text-gray-500">
                 <p>ID: ME-1986</p>
                 <p>LOC: TOKYO/WORLDWIDE</p>
                 <p>INST: PIANO</p>
              </div>
              <h1 className="text-6xl font-bold tracking-tighter leading-none mb-12">
                 Masashi<br/>Enokida
              </h1>
              <div className="w-full h-[1px] bg-black mb-4"></div>
              <p className="font-mono text-xs">
                 SCROLL FOR DATA &darr;
              </p>
           </div>
           <div className="bg-gray-300 relative">
              <img src={IMAGES.hero_studio} alt="Studio" className="w-full h-full object-cover grayscale opacity-80" />
           </div>
        </section>

        {/* Bio: Spec Sheet */}
        <section id="biography" className="border-b border-[#ccc]">
           <div className="grid md:grid-cols-4 min-h-[50vh]">
              <div className="p-6 border-r border-[#ccc] font-mono text-xs font-bold uppercase">
                 01. Profile
              </div>
              <div className="md:col-span-3 p-12 md:p-24 bg-white">
                 <p className="text-xl leading-relaxed mb-12 max-w-3xl">
                    {PROFILE.bioShort}
                 </p>
                 <div className="grid md:grid-cols-2 gap-8 font-mono text-xs text-gray-600">
                    <div>
                       <strong className="block text-black mb-4 border-b border-gray-200 pb-2">EDUCATION</strong>
                       <ul className="space-y-2">
                          {PROFILE.history.filter(h => h.includes('大学') || h.includes('高校') || h.includes('UCLA')).map((h, i) => (
                             <li key={i}>{h}</li>
                          ))}
                       </ul>
                    </div>
                    <div>
                       <strong className="block text-black mb-4 border-b border-gray-200 pb-2">WORKS</strong>
                       <ul className="space-y-2">
                          {PROFILE.history.filter(h => h.includes('リリース') || h.includes('献呈') || h.includes('招聘')).map((h, i) => (
                             <li key={i}>{h}</li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Concerts: Table */}
        <section id="concerts" className="border-b border-[#ccc]">
           <div className="grid md:grid-cols-4">
              <div className="p-6 border-r border-[#ccc] font-mono text-xs font-bold uppercase bg-[#f2f2f2]">
                 02. Schedule
              </div>
              <div className="md:col-span-3 bg-white">
                 {UPCOMING_CONCERTS.map((c, i) => (
                    <div key={c.id} className="border-b border-[#ccc] last:border-0 p-8 flex flex-col md:flex-row gap-8 hover:bg-[#f9f9f9] transition-colors">
                       <div className="font-mono text-xs w-32 pt-2">{c.date}</div>
                       <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                          <p className="font-mono text-xs text-gray-500">{c.location}</p>
                       </div>
                       <div className="pt-2">
                          <ArrowUpRight size={16} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Blog: Index */}
        <section id="blog" className="min-h-[50vh]">
           <div className="grid md:grid-cols-4 h-full">
              <div className="p-6 border-r border-[#ccc] font-mono text-xs font-bold uppercase">
                 03. Log
              </div>
              <div className="md:col-span-3 p-6 md:p-12">
                 <div className="grid md:grid-cols-3 gap-6">
                    {RECENT_POSTS.map(post => (
                       <div key={post.id} className="bg-white p-6 border border-[#ccc] hover:shadow-lg transition-shadow">
                          <div className="font-mono text-[10px] text-gray-500 mb-4">{post.date}</div>
                          <h3 className="font-bold text-sm mb-4 min-h-[3rem]">{post.title}</h3>
                          <div className="inline-block px-2 py-1 bg-[#f2f2f2] text-[10px] font-mono uppercase">{post.category}</div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        <footer id="contact" className="bg-[#111] text-white p-12 font-mono text-xs flex justify-between">
           <div>
              <p className="mb-2">MASASHI ENOKIDA</p>
              <p className="text-gray-500">ARCHIVE 2025</p>
           </div>
           <div className="text-right">
              <a href="#" className="block hover:text-gray-400">INFO@MASASHI-ENOKIDA.COM</a>
           </div>
        </footer>
      </main>
    </div>
  );
};

export default StudioTheme;