// components/services/PricingCalculator.tsx
import { useState, useCallback } from 'react';
import { Calculator, RefreshCw, TrendingUp } from 'lucide-react';

const PricingCalculator = () => {
  const [wasteType, setWasteType] = useState('UCO');
  const [volume, setVolume] = useState(100);
  const [distance, setDistance] = useState(5);
  const [quality, setQuality] = useState('A');

  const calculatePrice = () => {
    const basePrices = {
      UCO: 350,
      Glass: 80,
      Cardboard: 120,
      Mixed: 60
    };

    const qualityMultipliers = {
      A: 1.2,
      B: 1.0,
      C: 0.8
    };

    const basePrice = basePrices[wasteType as keyof typeof basePrices] || 0;
    const qualityMultiplier = qualityMultipliers[quality as keyof typeof qualityMultipliers] || 1;
    const distanceCost = distance * 10; // RWF 10 per km

    const pricePerKg = basePrice * qualityMultiplier;
    const totalValue = volume * pricePerKg;
    const collectionCost = distanceCost;
    const netRevenue = totalValue - collectionCost;

    return {
      pricePerKg: Math.round(pricePerKg),
      totalValue: Math.round(totalValue),
      collectionCost: Math.round(collectionCost),
      netRevenue: Math.round(netRevenue)
    };
  };

  const [showResults, setShowResults] = useState(false);
  const prices = calculatePrice();

  const handleCalculate = useCallback(() => {
    setShowResults(true);
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Revenue <span className="text-cyan-600">Calculator</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Estimate how much you can earn from your waste
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Calculator className="w-6 h-6 text-cyan-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enter Details</h3>
            </div>

            <div className="space-y-6">
              {/* Waste Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waste Type
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="UCO">Used Cooking Oil</option>
                  <option value="Glass">Glass Bottles</option>
                  <option value="Cardboard">Cardboard/Paper</option>
                  <option value="Mixed">Mixed Recyclables</option>
                </select>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Volume (kg)
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full accent-cyan-600"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">10 kg</span>
                  <span className="font-semibold text-cyan-600">{volume} kg</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">1000 kg</span>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Distance from Recycler (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="w-full accent-cyan-600"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">1 km</span>
                  <span className="font-semibold text-cyan-600">{distance} km</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">50 km</span>
                </div>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality Grade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['A', 'B', 'C'].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setQuality(grade)}
                      className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                        quality === grade
                          ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:border-cyan-700'
                      }`}
                    >
                      Grade {grade}
                      <span className="block text-xs font-normal mt-1">
                        {grade === 'A' ? '+20%' : grade === 'B' ? 'Base' : '-20%'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleCalculate} className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Calculate Revenue
              </button>
            </div>
          </div>

          {/* Results */}
          <div className={`bg-cyan-600 rounded-2xl shadow-xl p-8 text-white transition-all duration-500 ${showResults ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Estimated Revenue
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-cyan-100 text-sm mb-1">Price per kg</p>
                <p className="text-3xl font-bold">RWF {prices.pricePerKg}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-cyan-100 text-xs mb-1">Total Value</p>
                  <p className="text-xl font-bold">RWF {prices.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-cyan-100 text-xs mb-1">Collection Cost</p>
                  <p className="text-xl font-bold">- RWF {prices.collectionCost.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/20 rounded-xl p-6">
                <p className="text-cyan-100 text-sm mb-2">Estimated Net Revenue</p>
                <p className="text-4xl font-bold">RWF {prices.netRevenue.toLocaleString()}</p>
                <p className="text-cyan-100 text-xs mt-2">after collection costs</p>
              </div>

              <div className="border-t border-white/20 pt-4">
                <p className="text-sm text-cyan-100">
                  * Estimates based on current market rates. Actual prices may vary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;