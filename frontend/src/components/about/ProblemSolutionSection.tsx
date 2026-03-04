// components/about/ProblemSolutionSection.tsx
import { AlertTriangle, CheckCircle, XCircle, TrendingDown, Truck, BarChart3 } from 'lucide-react';

interface AboutReadMorePayload {
  title: string;
  description: string;
  details?: string[];
}

interface ProblemSolutionSectionProps {
  onReadMore?: (payload: AboutReadMorePayload) => void;
}

const ProblemSolutionSection = ({ onReadMore }: ProblemSolutionSectionProps) => {
  const handleReadMore = () => {
    onReadMore?.({
      title: 'From Linear to Circular',
      description:
        'EcoTrade addresses Kigali’s waste challenge by creating verified marketplaces for recyclables and optimizing logistics.',
      details: [
        'Onboarding for hotels and recyclers with verified profiles.',
        'Route optimization with geospatial clustering and pickup scheduling.',
        'Impact reporting that supports compliance and sustainability goals.'
      ]
    });
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The <span className="text-cyan-600">Challenge</span> We're Solving
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Kigali's waste management crisis demands innovative solutions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Problem Side */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full opacity-50"></div>
            <div className="relative bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 shadow-xl border border-red-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">The Linear Problem</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">800 tons daily to Nduba landfill</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Kigali generates 800-1,000 tons of waste daily, overwhelming existing infrastructure</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 dark:text-red-400 font-bold">2%</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Negligible recycling rate</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Only 2% of non-organic waste is recycled - a systemic failure in resource recovery</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">RWF 50M+ lost value annually</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Valuable materials like UCO and glass are discarded instead of monetized</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Inefficient logistics</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Fragmented collection routes make recycling economically unviable</p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="mt-8 bg-red-600/5 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">174M</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">tons Sub-Saharan waste (2016)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">516M</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">tons projected by 2050</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Side */}
          <div className="relative">
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-100 dark:bg-cyan-900/20 rounded-full opacity-50"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-cyan-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">Our Circular Solution</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Direct recycler connections</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">B2B marketplace linking hotels with certified recyclers</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue from waste</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Hotels earn from materials previously discarded at a cost</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Optimized collection routes</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">PostGIS clustering reduces travel distance by 40%</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Verified Green Scores</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Automated sustainability metrics for corporate reporting</p>
                  </div>
                </div>
              </div>

              {/* Impact Preview */}
              <div className="mt-8 bg-cyan-600 rounded-xl p-4 text-white">
                <p className="text-sm font-medium mb-2">Expected Impact</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-bold">50%</div>
                    <div className="text-xs opacity-90">Landfill diversion</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">40%</div>
                    <div className="text-xs opacity-90">Route optimization</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Callout */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-6 py-3">
            <AlertTriangle className="w-5 h-5 text-yellow-700 dark:text-yellow-700 mr-2" />
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">The "Pay-to-Dump Paradox":</span> Hotels pay to discard valuable materials due to lack of marketplace
            </span>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleReadMore}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition-colors"
            >
              Read the full solution
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;