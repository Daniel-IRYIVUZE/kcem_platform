// components/services/ServicesHero.tsx
import { Sparkles } from 'lucide-react';

const ServicesHero = () => {
  return (
    <section className="relative text-white overflow-hidden" style={{ background: '#0f89ab' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="relative max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center bg-gray-800/10  dark:bg-gray-800/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Tailored Solutions for Every Stakeholder</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl text-white lg:text-6xl font-bold mb-6">
            Services Designed for the{' '}
            <span className="text-yellow-300">
              Circular Economy
            </span>
          </h1>
          
          <p className="text-xl text-cyan-100 mb-10 max-w-3xl mx-auto">
            Whether you're a business looking to monetize waste, a recycler seeking quality materials, 
            or a driver wanting steady income, EcoTrade has the perfect solution for you.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">4+</div>
              <div className="text-sm text-cyan-200">Businesses To be Served</div>
            </div>
            <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-cyan-200">Recyclers To be Partnered</div>
            </div>
            <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">3+</div>
              <div className="text-sm text-cyan-200">Active  Drivers To be recruited</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-current text-white dark:text-gray-950">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default ServicesHero;