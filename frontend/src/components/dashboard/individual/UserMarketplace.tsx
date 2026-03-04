import { useState } from 'react';
import { Search, Package, Star } from 'lucide-react';
import { marketplaceListings } from './_shared';

export default function UserMarketplace() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const filtered = marketplaceListings.filter(l => {
    const matchSearch = l.item.toLowerCase().includes(search.toLowerCase()) || l.seller.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || l.category === categoryFilter;
    return matchSearch && matchCategory;
  });
  const categories = [...new Set(marketplaceListings.map(l => l.category))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Eco Marketplace</h1>
          <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-medium">{marketplaceListings.filter(l => l.inStock).length} items available</span>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" /></div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-36 bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><Package size={36} className="text-cyan-300" /></div>
            <div className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.seller}</p>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{item.item}</h3>
              <div className="flex items-center gap-1 mt-2"><Star size={12} className="text-yellow-700 fill-yellow-700" /><span className="text-xs text-gray-600 dark:text-gray-400">{item.rating}</span><span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{item.category}</span></div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-cyan-600">{item.price}</span>
                {item.inStock ? <button className="px-3 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 font-medium">Add to Cart</button> : <span className="text-xs text-red-500 font-medium">Out of Stock</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">No products match your search.</p>}
    </div>
  );
}
