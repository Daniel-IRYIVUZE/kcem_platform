// components/home/InteractiveMap.tsx
import { useRef } from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // This would be replaced with actual Leaflet.js implementation
  // For now, we'll create a placeholder with sample data

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Live <span className="text-cyan-600">Marketplace Map</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              See real-time waste listings and collection activity across Kigali
            </p>
          </div>
          
          <button onClick={() => navigate('/marketplace')} className="mt-4 lg:mt-0 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center">
            <Maximize2 className="w-5 h-5 mr-2" />
            View Full Map
          </button>
        </div>

        {/* Map Placeholder with Interactive Elements */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div ref={mapRef} className="h-[500px] bg-gray-100 dark:bg-gray-700 relative">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
              <button className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Sample Map Content */}
            <div className="absolute inset-0">
              {/* Grid Background */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}></div>

              {/* Sample Markers */}
              <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 group">
                <div className="relative">
                  <MapPin className="w-8 h-8 text-cyan-600 fill-cyan-600/30 animate-bounce" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium">Mille Collines Hotel</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">50kg UCO Available</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group">
                <div className="relative">
                  <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400 fill-blue-600/30" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium">GreenEnergy Recycler</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Accepting UCO & Glass</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 group">
                <div className="relative">
                  <MapPin className="w-8 h-8 text-yellow-700 dark:text-yellow-700 fill-yellow-700/30" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-3 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium">Driver Jean</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">En Route - 3 stops left</p>
                  </div>
                </div>
              </div>

              {/* Route Line */}
              <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                <path
                  d="M 300,150 L 500,250 L 400,350"
                  stroke="#00aac4"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  className="animate-dash"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Map Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-cyan-600 mr-2" />
                  <span className="text-sm">Hotels (waste generators)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm">Recyclers</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-yellow-700 dark:text-yellow-700 mr-2" />
                  <span className="text-sm">Active Drivers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-5 h-0.5 bg-cyan-500 mr-2"></div>
                  <span className="text-sm">Optimized Routes</span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <p className="text-sm font-medium">📍 Kigali, Rwanda</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Nyarugenge • Gasabo • Kicukiro</p>
            </div>
          </div>

          {/* Map Footer */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></span>
                  47 Active Listings
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  12 Recyclers Online
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-700 rounded-full mr-2"></span>
                  23 Drivers on Route
                </span>
              </div>
              <span className="text-cyan-600 font-medium">Updated live</span>
            </div>
          </div>
        </div>

        {/* "See Live Marketplace" Link */}
        <div className="text-center mt-8">
          <button onClick={() => navigate('/marketplace')} className="text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400 inline-flex items-center group">
            Explore full marketplace
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;