// components/marketplace/MarketplaceHero.tsx
import { Search } from 'lucide-react';

interface MarketplaceHeroProps {
  searchQuery: string;
  onSearch: (q: string) => void;
}

const MarketplaceHero = ({ searchQuery, onSearch }: MarketplaceHeroProps) => {
  return (
    <section className="bg-cyan-900 text-white py-12">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl text-white font-bold mb-4">
            Waste <span className="text-yellow-300">Marketplace</span>
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
            Browse available recyclables from Kigali's top hotels. Place bids and win collection contracts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by waste type, hotel, or location..."
              className="w-full px-6 py-4 pr-24 bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-cyan-200 focus:ring-2 focus:ring-white outline-none"
            />
            <button
              type="button"
              onClick={() => onSearch(searchQuery)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800/10 dark:bg-gray-900 text-cyan-600 px-6 py-2 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <span className="text-sm text-cyan-200">Popular:</span>
            {['UCO', 'Glass', 'Cardboard', 'Near me', 'High volume'].map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSearch(term)}
                className="px-3 py-1 bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-full text-sm hover:bg-white dark:bg-gray-800/20 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceHero;