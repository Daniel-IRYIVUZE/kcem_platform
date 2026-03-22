// components/home/HeroSection.tsx
import { ArrowRight, Award, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    const map: Record<string, string> = {
      admin: '/dashboard/admin', business: '/dashboard/business',
      recycler: '/dashboard/recycler', driver: '/dashboard/driver', individual: '/dashboard/individual',
    };
    return map[user?.role || ''] || '/dashboard';
  };

  return (
    <section className="relative overflow-hidden" style={{ background: '#0f89ab' }}>
      {/* Background photo — <img> lets the browser preload-scan and prioritize this for LCP */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&q=75"
          alt=""
          fetchPriority="high"
          decoding="sync"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.18)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="space-y-8 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-white border border-white/20">
            <Award className="w-5 h-5 mr-2 text-cyan-300" />
            <span className="text-sm font-medium">Kigali's First Circular Economy Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Transform Waste into{' '}
            <span className="text-yellow-300">Revenue</span>
            <br />
            <span className="text-cyan-300 text-3xl lg:text-4xl font-semibold">Kigali's B2B Circular Economy</span>
          </h1>

          <p className="text-xl text-cyan-100 max-w-xl leading-relaxed">
            Connecting Hotels, Recyclers, and Drivers for a Sustainable Future.
            Turn commercial waste into verified income while reducing Kigali's landfill load.
          </p>

          {/* CTA ButKilograms */}
          <div className="flex flex-wrap gap-4">
            {user ? (
              <>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="group bg-white text-cyan-800 px-7 py-4 rounded-xl font-semibold hover:shadow-2xl hover:bg-cyan-50 transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                >
                  <LayoutDashboard className="mr-2 w-5 h-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/marketplace"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-7 py-4 rounded-xl font-semibold transform hover:-translate-y-1 transition-all duration-300 border border-cyan-400"
                >
                  Browse Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group bg-white text-cyan-800 px-7 py-4 rounded-xl font-semibold hover:shadow-2xl hover:bg-cyan-50 transform hover:-translate-y-1 transition-all duration-300 flex items-center"
                >
                  Join as Hotel
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-7 py-4 rounded-xl font-semibold transform hover:-translate-y-1 transition-all duration-300 border border-cyan-400"
                >
                  Partner as Recycler
                </Link>
              </>
            )}
          </div>

          {/* Live Counters */}
          {/* <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white tabular-nums">
                {counts.waste.toLocaleString()} Kg
              </p>
              <p className="text-cyan-200 text-sm mt-1">Tonnes Diverted</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white tabular-nums">
                {counts.co2} Kg
              </p>
              <p className="text-cyan-200 text-sm mt-1">CO₂ Saved</p>
            </div>
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white tabular-nums">
                RWF {counts.revenue}K
              </p>
              <p className="text-cyan-200 text-sm mt-1">Revenue Generated</p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
