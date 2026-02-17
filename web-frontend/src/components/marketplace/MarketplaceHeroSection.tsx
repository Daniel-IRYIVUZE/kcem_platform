import { Home, ShoppingBag } from 'lucide-react';

interface MarketplaceHeroSectionProps {
  onBackToHome: () => void;
  totalListings: number;
}

const MarketplaceHeroSection = ({ onBackToHome, totalListings }: MarketplaceHeroSectionProps) => {
  return (
    <section className="bg-gradient-to-r from-cyan-700 to-cyan-600 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-cyan-100 hover:text-white mb-3 text-sm transition-colors"
            >
              <Home size={14} />
              Back to Home
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">EcoTrade  Marketplace</h1>
            <p className="text-cyan-100 text-sm">Discover and trade recyclable materials across Kigali</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <ShoppingBag size={14} />
              <span>{totalListings} active listings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceHeroSection;
