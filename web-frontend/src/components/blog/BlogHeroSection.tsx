const BlogHeroSection = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1920" 
          alt="Blog and Articles Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Insights & <span className="text-cyan-300">Stories</span>
        </h1>
        <p className="text-gray-100 max-w-3xl mx-auto mb-6 text-sm sm:text-base">
          Discover the latest in circular economy, sustainable waste management, and technology innovations
        </p>
      </div>
    </section>
  );
};

export default BlogHeroSection;
