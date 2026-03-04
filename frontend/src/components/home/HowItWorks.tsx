// components/home/HowItWorks.tsx
import { ClipboardList, MapPin, Truck, Wallet } from 'lucide-react';

const steps = [
  {
    icon: ClipboardList,
    title: 'List Waste',
    description: 'Post your available recyclables with type, volume, and quality details',
    color: 'bg-blue-600'
  },
  {
    icon: MapPin,
    title: 'System Clusters',
    description: 'PostGIS groups nearby pickups for optimal collection efficiency',
    color: 'bg-cyan-600'
  },
  {
    icon: Truck,
    title: 'Driver Collects',
    description: 'Optimized routes generated for maximum efficiency',
    color: 'bg-yellow-700'
  },
  {
    icon: Wallet,
    title: 'Payment Released',
    description: 'Instant mobile money transfer upon collection confirmation',
    color: 'bg-purple-600'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How <span className="text-cyan-600">EcoTrade</span> Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From waste listing to payment receipt in four simple steps
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines (visible on desktop) */}
          <div className="hidden lg:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-cyan-300 dark:bg-cyan-700"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${step.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10" />
                </div>
                
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-600 rounded-full text-white flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Efficiency Metric */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-cyan-50 dark:bg-cyan-900/20 rounded-full px-6 py-3">
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;