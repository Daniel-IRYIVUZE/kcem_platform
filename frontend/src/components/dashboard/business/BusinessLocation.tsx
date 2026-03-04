// components/dashboard/business/BusinessLocation.tsx
import { MapPin } from 'lucide-react';
import { hotelProfile } from './_shared';

export default function BusinessLocation() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Location</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-72 flex items-center justify-center mb-6">
          <div className="text-center text-gray-500 dark:text-gray-400"><MapPin size={48} className="mx-auto mb-2 opacity-50" /><p className="text-sm">Map View — {hotelProfile.location}</p><p className="text-xs text-gray-400 dark:text-gray-500">Interactive map showing hotel location and nearby recyclers</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Location Details</h3>
            <div className="space-y-2">
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Address</p><p className="font-medium">{hotelProfile.location}</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">District</p><p className="font-medium">Nyarugenge, Kigali</p></div>
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Coordinates</p><p className="font-medium font-mono text-sm">-1.9536, 29.8728</p></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Nearby Recyclers</h3>
            {[
              { name: 'Green Energy Ltd', distance: '3.2 km', rating: 4.8 },
              { name: 'EcoRecycle Rwanda', distance: '4.5 km', rating: 4.3 },
              { name: 'CleanTech Kigali', distance: '5.1 km', rating: 4.5 },
            ].map(r => (
              <div key={r.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">📍 {r.distance}</p></div>
                <span className="text-sm text-yellow-700 dark:text-yellow-700 font-semibold">⭐ {r.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
