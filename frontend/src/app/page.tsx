import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-primary text-primary-foreground font-sans">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Placeholder for Hero Image - using a dark gradient for now */}
          <div className="w-full h-full bg-gradient-to-b from-black/70 to-primary" />
        </div>

        <div className="relative z-10 text-center space-y-8 px-4">
          <h1 className="text-4xl md:text-6xl lg:text-[64px] font-bold tracking-wider text-accent drop-shadow-lg">
            MASASHI ENOKIDA
          </h1>
          <p className="text-lg md:text-xl tracking-[0.2em] text-gray-300">
            PIANIST
          </p>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 md:py-[120px] px-6 max-w-[1200px] mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-accent mb-12 text-center tracking-widest">
          NEWS
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder News Items */}
          {[1, 2, 3].map((item) => (
            <article key={item} className="glass p-6 rounded-card hover-glow cursor-pointer">
              <div className="aspect-video bg-gray-800 rounded-sm mb-4"></div>
              <time className="text-sm text-gray-400 block mb-2">2025.12.03</time>
              <h3 className="text-lg font-medium mb-2">Concert Announcement</h3>
              <p className="text-sm text-gray-300 line-clamp-2">
                Details about the upcoming concert at Suntory Hall...
              </p>
            </article>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="border border-accent text-accent px-8 py-3 rounded-full hover:bg-accent hover:text-primary transition-all duration-300">
            VIEW ALL
          </button>
        </div>
      </section>

      {/* Pickup Section */}
      <section className="py-20 md:py-[120px] bg-[#1a0505]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl md:text-4xl font-bold text-accent mb-12 text-center tracking-widest">
            PICK UP
          </h2>
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2 aspect-square bg-gray-800 rounded-card shadow-2xl relative">
              {/* Placeholder for Album Art */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Album Art
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl font-bold">New Album "Resonance"</h3>
              <p className="text-gray-300 leading-relaxed">
                A collection of masterpieces that resonate with the soul.
                Experience the profound depth of sound.
              </p>
              <button className="bg-maroon text-white px-8 py-3 rounded-full hover:bg-red-900 transition-all duration-300 shadow-lg">
                DISCOVER MORE
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
