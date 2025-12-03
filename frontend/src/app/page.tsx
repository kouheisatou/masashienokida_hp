export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 relative overflow-hidden">
      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none shadow-vignette z-10" />

      {/* Hero Content */}
      <div className="z-20 text-center space-y-8">
        <h1 className="text-8xl font-serif font-medium tracking-tighter text-text-primary">
          Masashi Enokida
        </h1>
        <div className="w-16 h-[2px] bg-line-main mx-auto" />
        <p className="text-xl font-serif italic text-text-accent">
          Grand Stage
        </p>
      </div>

      {/* Decorative Background (Placeholder) */}
      <div className="absolute inset-0 bg-bg-secondary opacity-50 -z-10" />
    </main>
  );
}
