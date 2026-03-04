// components/services/ServiceTabs.tsx
import { Building2, Factory, Truck } from 'lucide-react';

interface ServiceTabsProps {
  activeTab: 'hotels' | 'recyclers' | 'drivers';
  setActiveTab: (tab: 'hotels' | 'recyclers' | 'drivers') => void;
}

const ServiceTabs = ({ activeTab, setActiveTab }: ServiceTabsProps) => {
  const tabs = [
    {
      id: 'hotels',
      label: 'Hotels & Restaurants',
      icon: Building2,
      color: 'bg-cyan-600',
      count: 156
    },
    {
      id: 'recyclers',
      label: 'Recyclers',
      icon: Factory,
      color: 'bg-blue-600',
      count: 23
    },
    {
      id: 'drivers',
      label: 'Drivers',
      icon: Truck,
      color: 'bg-yellow-700',
      count: 47
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'hotels' | 'recyclers' | 'drivers')}
            className={`relative p-6 rounded-xl transition-all duration-300 group ${
              activeTab === tab.id
                ? `${tab.color} text-white shadow-lg transform scale-105`
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                activeTab === tab.id
                  ? 'bg-bg-gray-800/20 dark:bg-gray-800/20'
                  : `${tab.color} bg-opacity-10`
              }`}>
                <tab.icon className={`w-6 h-6 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <div className="text-left">
                <p className="font-semibold">{tab.label}</p>
                <p className={`text-sm ${
                  activeTab === tab.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {tab.count} active
                </p>
              </div>
            </div>

            {/* Active Indicator */}
            {activeTab === tab.id && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceTabs;