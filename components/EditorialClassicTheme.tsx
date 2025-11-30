import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS, IMAGES, PLACEHOLDERS } from '../constants';

const EditorialClassicTheme: React.FC = () => {
  return (
    <div className="font-sans bg-white text-black min-h-screen overflow-x-hidden">
      
      {/* Navigation: Minimal Top */}
      <nav className="fixed top-0 w-full z-50 mix-blend-difference text-white px-6 md:px-12 py-6 flex justify-between items-center">
         <div className="text-sm font-bold tracking-tighter">ME.</div>
         <div className="flex gap-6 md:gap-12">
            {NAV_ITEMS.map(item => (
               <a key={item.href} href={`#${item.href}`} className="text-[10px] md:text-xs uppercase tracking-widest hover:underline decoration-1 underline-offset-4">
                  {item.label}
               </a>
            ))}
         </div>
      </nav>

      {/* Hero: Name as Graphic */}
      <section id="home" className="h-screen relative pt-32 px-6 md:px-12 flex flex-col justify-between pb-12">
         <div className="relative z-10">
            <h1 className="text-[15vw] leading-[0.8] font-bold tracking-tighter mix-blend-exclusion text-black select-none">
               MASASHI<br/>ENOKIDA
            </h1>
         </div>
         <div className="absolute right-0 top-0 w-1/2 h-full z-0">
            <img src={IMAGES.hero_editorial} alt="Pianist" className="w-full h-full object-cover grayscale contrast-125" />
         </div>
         <div className="relative z-10 flex justify-between items-end mix-blend-difference text-white">
            <div className="text-xs md:text-sm font-mono max-w-xs">
               {PROFILE.history[0]}<br/>
               {PROFILE.history[PROFILE.history.length - 1]}
            </div>
            <div className="text-xs uppercase tracking-widest animate-pulse">
               Scroll
            </div>
         </div>
      </section>

      {/* Bio: Asymmetric Layout */}
      <section id="biography" className="py-32 px-6 md:px-12">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 md:col-start-2">
               <img src={PLACEHOLDERS.portrait} alt="Portrait" className="w-full grayscale" />
               <p className="mt-4 text-[10px] font-mono uppercase text-gray-400">Portrait 2024</p>
            </div>
            <div className="md:col-span-5 md:col-start-7 pt-12 md:pt-32">
               <p className="text-xl md:text-2xl font-serif leading-relaxed mb-12">
                  {PROFILE.bioShort}
               </p>
               <div className="font-mono text-xs space-y-2 text-gray-600">
                  {PROFILE.history.map((h, i) => (
                     <div key={i} className="flex gap-4">
                        <span>{h}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Concerts: Big Typography */}
      <section id="concerts" className="py-32 border-t border-black">
         <div className="px-6 md:px-12">
            {UPCOMING_CONCERTS.map((c, index) => (
               <div key={c.id} className="group border-b border-black py-12 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-black hover:text-white transition-colors duration-300 -mx-6 px-6 md:-mx-12 md:px-12 cursor-pointer">
                  <div className="text-6xl md:text-8xl font-bold tracking-tighter opacity-10 group-hover:opacity-100 transition-opacity mb-4 md:mb-0">
                     {c.date.split('-')[1] || c.date.split('.')[1] || '12'}
                  </div>
                  <div className="flex-1 md:pl-12">
                     <div className="font-mono text-xs mb-2">{c.date}</div>
                     <h3 className="text-3xl md:text-5xl font-serif italic mb-2">{c.title}</h3>
                     <p className="font-mono text-xs uppercase">{c.location}</p>
                  </div>
                  <div className="mt-8 md:mt-0">
                     <span className="text-xs border border-current px-4 py-2 rounded-full uppercase">Details</span>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Blog/News: Brutalist Grid */}
      <section id="blog" className="py-32 px-6 md:px-12 bg-gray-50">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 md:col-span-1 border-t border-black pt-2">
               <h2 className="font-bold text-sm uppercase tracking-widest">Journal</h2>
            </div>
            {RECENT_POSTS.slice(0, 5).map((post) => (
               <div key={post.id} className="border-t border-black pt-2 hover:bg-gray-200 transition-colors h-48 flex flex-col justify-between p-2 cursor-pointer">
                  <h3 className="font-serif text-lg leading-tight">{post.title}</h3>
                  <div className="text-[10px] font-mono flex justify-between">
                     <span>{post.date}</span>
                     <span>{post.category}</span>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <footer id="contact" className="py-12 px-6 md:px-12 flex justify-between items-end border-t border-black">
         <div className="text-[10vw] leading-none font-bold tracking-tighter">
            CONTACT
         </div>
         <div className="text-right font-mono text-xs">
            <a href="mailto:info@masashi-enokida.com" className="block hover:underline mb-2">info@masashi-enokida.com</a>
            <p>&copy; 2025</p>
         </div>
      </footer>
    </div>
  );
};

export default EditorialClassicTheme;