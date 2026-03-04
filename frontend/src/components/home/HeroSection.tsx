// components/home/HeroSection.tsx
import { ArrowRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-cyan-900 text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=80)',
            filter: 'brightness(0.3)'
          }}
        />
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white dark:bg-gray-900 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className=" gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Award className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Kigali's First Circular Economy Marketplace</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white">
              Transform Waste into{' '}
              <span className="text-yellow-300">
                Revenue
              </span>
            </h1>

            <p className="text-xl text-cyan-50 max-w-md">
              Connect with recyclers, optimize collections, and earn from your commercial waste. 
              Join Kigali's HORECA circular economy today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group bg-white dark:bg-gray-900 text-cyan-800 dark:text-cyan-300 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
              >
                Join as Hotel
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/login"
                className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-cyan-500 transform hover:-translate-y-1 transition-all duration-300 border border-cyan-400"
              >
                Partner as Recycler
              </Link>
            </div>

            {/* Quick Stats Preview */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-cyan-500/30">
              <div>
                <p className="text-2xl lg:text-3xl text-white font-bold">4+</p>
                <p className="text-cyan-200 text-sm">Hotels Registered</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl text-white font-bold">2</p>
                <p className="text-cyan-200 text-sm">Active Recyclers</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl text-white font-bold">0.1t</p>
                <p className="text-cyan-200 text-sm">Monthly Volume</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;