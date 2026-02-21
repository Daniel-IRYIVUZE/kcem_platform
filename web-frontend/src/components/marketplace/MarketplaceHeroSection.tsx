import { Home, ShoppingBag } from 'lucide-react';

interface MarketplaceHeroSectionProps {
  onBackToHome: () => void;
  totalListings: number;
}

const MarketplaceHeroSection = ({ onBackToHome, totalListings }: MarketplaceHeroSectionProps) => {
  return (
    <section className="relative overflow-hidden text-white py-12">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1920" 
          alt="Marketplace and Trading" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/80 to-cyan-700/80"></div>
      </div>

      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
