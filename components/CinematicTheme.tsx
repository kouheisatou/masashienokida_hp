import React from 'react';
import { SITE_NAME, PROFILE, RECENT_POSTS, UPCOMING_CONCERTS, NAV_ITEMS } from '../constants';
import { Play, Calendar, MapPin, ArrowRight } from 'lucide-react';

const CinematicTheme: React.FC = () => {
  return (
    <div className="font-sans bg-dark-bg text-gray-100 min-h-screen relative overflow-x-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center space-x-6 shadow-2xl">
        <span className="font-bold text-white tracking-widest mr-4 hidden md:block">{SITE_NAME}</span>
        {NAV_ITEMS.map(item => (
          <a key={item.href} href={`#${item.href}`} className="text-xs md:text-sm text-gray-300 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">
            {item.label}
          </a>
        ))}
      </nav>

      {/* Immersive Hero */}
      <section id="home" className="relative h-screen flex items-center justify-center z-10 px-6">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border border-amber-500/50 text-amber-500 text-xs tracking-[0.2em] uppercase bg-amber-900/10 backdrop-blur-md">
            The Official Portfolio
          </div>
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 mb-8 drop-shadow-2xl">
            ENOKIDA
          </h1>
          <p className="max-w-xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
            {PROFILE.bioShort}
          </p>
          <div className="flex justify-center gap-4">
             <button className="group relative px-8 py-3 bg-white text-black rounded-full font-semibold overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-amber-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">Listen Now <Play size={16} fill="black" /></span>
             </button>
             <button className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                Upcoming Live
             </button>
          </div>
        </div>
      </section>

      {/* Cards Overlay Section */}
      <section id="concerts" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Live Experience</h2>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent flex-1 mx-8" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {UPCOMING_CONCERTS.map((concert, idx) => (
              <div key={concert.id} className="group relative bg-dark-surface/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:bg-dark-surface/80 transition-all hover:-translate-y-2 duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white/10 group-hover:text-amber-500/20 transition-colors">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{concert.title}</h3>
                <div className="space-y-2 text-sm text-gray-400 mb-6">
                   <div className="flex items-center gap-2"><Calendar size={14} /> {concert.date}</div>
                   <div className="flex items-center gap-2"><MapPin size={14} /> {concert.location}</div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {concert.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Blog */}
      <section id="blog" className="py-32 relative z-10 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
           <div>
              <h2 className="text-3xl font-bold text-white mb-2">Latest Updates</h2>
              <p className="text-gray-500">Behind the scenes & news</p>
           </div>
           <button className="flex items-center text-amber-500 text-sm font-semibold hover:text-amber-400 transition-colors">
              View All Posts <ArrowRight size={16} className="ml-2" />
           </button>
        </div>
        
        <div className="flex overflow-x-auto space-x-6 pb-8 px-6 md:px-[calc((100vw-80rem)/2)] no-scrollbar">
           {RECENT_POSTS.map((post) => (
             <div key={post.id} className="min-w-[300px] md:min-w-[400px] bg-dark-surface border border-white/5 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow group">
                <div className="h-48 relative overflow-hidden">
                   <img src={`https://picsum.photos/600/400?random=${post.id}`} alt="Blog" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                   <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold rounded text-white border border-white/10">
                      {post.category}
                   </div>
                </div>
                <div className="p-6">
                   <div className="text-xs text-amber-500 mb-2 font-mono">{post.date}</div>
                   <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
                   <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      <section id="contact" className="py-32 relative z-10">
         <div className="max-w-2xl mx-auto text-center px-6">
            <h2 className="text-4xl font-bold text-white mb-8">Get In Touch</h2>
            <div className="p-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-2xl">
               <div className="bg-dark-surface rounded-2xl p-12 backdrop-blur-xl">
                  <p className="text-gray-300 mb-8">
                    詳しいプロフィール、演奏依頼、またはファンクラブに関するお問い合わせはこちら。
                  </p>
                  <button className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                    CONTACT FORM
                  </button>
               </div>
            </div>
         </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-gray-600 text-xs relative z-10">
        DESIGN CONCEPT - CINEMATIC DARK
      </footer>
    </div>
  );
};

export default CinematicTheme;