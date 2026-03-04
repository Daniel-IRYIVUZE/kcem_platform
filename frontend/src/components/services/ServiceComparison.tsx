// components/services/ServiceComparison.tsx
import { Check, X } from 'lucide-react';

const ServiceComparison = () => {
  const features = [
    {
      name: 'Waste Valuation Engine',
      hotels: true,
      recyclers: true,
      drivers: false
    },
    {
      name: 'Automated Pickup Scheduling',
      hotels: true,
      recyclers: true,
      drivers: true
    },
    {
      name: 'Revenue Dashboard',
      hotels: true,
      recyclers: true,
      drivers: true
    },
    {
      name: 'Green Score Calculator',
      hotels: true,
      recyclers: false,
      drivers: false
    },
    {
      name: 'Digital Certificates',
      hotels: true,
      recyclers: true,
      drivers: false
    },
    {
      name: 'Competitive Bidding',
      hotels: true,
      recyclers: true,
      drivers: false
    },
    {
      name: 'Route Optimization',
      hotels: false,
      recyclers: true,
      drivers: true
    },
    {
      name: 'Fleet Tracking',
      hotels: false,
      recyclers: true,
      drivers: true
    },
    {
      name: 'Offline Navigation',
      hotels: false,
      recyclers: false,
      drivers: true
    },
    {
      name: 'Quality Verification',
      hotels: true,
      recyclers: true,
      drivers: true
    },
    {
      name: 'Instant Payments',
      hotels: true,
      recyclers: true,
      drivers: true
    },
    {
      name: '24/7 Support',
      hotels: true,
      recyclers: true,
      drivers: true
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Service <span className="text-cyan-600">Comparison</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See what's included for each user type
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 font-bold text-gray-900 dark:text-white">Feature</th>
                <th className="text-center py-4 px-6 font-bold text-cyan-600">Hotels</th>
                <th className="text-center py-4 px-6 font-bold text-blue-600 dark:text-blue-400">Recyclers</th>
                <th className="text-center py-4 px-6 font-bold text-yellow-700">Drivers</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900">
                  <td className="py-4 px-6 text-gray-800 dark:text-gray-200">{feature.name}</td>
                  <td className="text-center py-4 px-6">
                    {feature.hotels ? (
                      <Check className="w-5 h-5 text-cyan-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-6">
                    {feature.recyclers ? (
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="text-center py-4 px-6">
                    {feature.drivers ? (
                      <Check className="w-5 h-5 text-yellow-700 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ServiceComparison;