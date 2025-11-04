export default function LandingPage({ onStart }) {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-white relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute -top-28 -right-24 h-80 w-80 rounded-full bg-yellow-200/50 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-yellow-300/40 blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=1600&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
          See it on. <span className="text-yellow-500">Before</span> you buy it.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Experience the future of fashion. Try on our collection of sarees, kurtas, and sherwanis using your own photo.
        </p>
        <div className="mt-10">
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-4 shadow-lg shadow-yellow-400/40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            aria-label="Start Your Virtual Try-On"
          >
            Start Your Virtual Try-On
          </button>
        </div>
        <p className="mt-8 text-sm text-gray-500">For best results, use a full-body photo with good lighting.</p>
      </div>
    </section>
  );
}
