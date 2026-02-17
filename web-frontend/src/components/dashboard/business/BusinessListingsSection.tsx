import { Edit2, Trash2, Eye, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const BusinessListingsSection = () => {
  const [listings] = useState([
    { id: 1, material: 'UCO', quantity: '50kg', price: 25000, status: 'active', date: '2024-02-10', buyer: 'Green Recyclers' },
    { id: 2, material: 'Glass', quantity: '200kg', price: 30000, status: 'pending', date: '2024-02-10', buyer: null },
    { id: 3, material: 'Paper', quantity: '80kg', price: 12000, status: 'sold', date: '2024-02-09', buyer: 'Plastic Solutions' },
    { id: 4, material: 'Plastic', quantity: '150kg', price: 45000, status: 'active', date: '2024-02-09', buyer: null },
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'sold': return 'bg-cyan-100 text-cyan-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
        <button className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
          <Plus size={18} />
          New Listing
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Material</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Buyer</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <motion.tr key={listing.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{listing.material}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{listing.quantity}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Rwf {listing.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{listing.buyer || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{listing.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-200 rounded"><Eye size={16} className="text-gray-600" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded"><Edit2 size={16} className="text-gray-600" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded"><Trash2 size={16} className="text-red-600" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BusinessListingsSection;
