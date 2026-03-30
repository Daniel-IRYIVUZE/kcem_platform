// components/blog/BlogHero.tsx
import { BookOpen } from 'lucide-react';

const BlogHero = () => {
  return (
    <section className="relative text-white overflow-hidden" style={{ background: '#0f89ab' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="relative max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Blog Label */}
          <div className="inline-flex items-center bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">EcoTrade Blog</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl text-white lg:text-6xl font-bold mb-6">
            Insights on{' '}
            <span className="text-yellow-300">
              Circular Economy
            </span>
          </h1>
          
          <p className="text-xl text-cyan-100 mb-10 max-w-3xl mx-auto">
            Explore the latest trends, success stories, and expert insights on waste management, 
            sustainability, and the circular economy in Rwanda and beyond.
          </p>

          {/* Blog Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-xs text-cyan-200">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12k</div>
              <div className="text-xs text-cyan-200">Monthly Readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-cyan-200">Expert Authors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs text-cyan-200">Categories</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-current text-gray-50 dark:text-gray-950">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default BlogHero;