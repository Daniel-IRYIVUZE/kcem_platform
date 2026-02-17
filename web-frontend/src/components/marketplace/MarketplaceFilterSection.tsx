import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, Package, Check } from 'lucide-react';

interface Filter {
  id: string;
  name: string;
  color: string;
  description: string;
  icon: any;
}

interface MarketplaceFilterSectionProps {
  materialTypes: Filter[];
  sortOptions: Array<{ id: string; label: string; icon: any }>;
  statusOptions: Array<{ id: string; label: string; color: string }>;
  selectedFilters: {
    materials: string[];
    distance: number;
    priceRange: { min: number; max: number };
    sortBy: string;
    status: string;
  };
  searchQuery: string;
  filteredCount: number;
  filtersVisible: boolean;
  onFiltersVisibleChange: (visible: boolean) => void;
  onMaterialToggle: (materialId: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onSortChange: (sort: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  getStatusColor: (status: string) => string;
  children: React.ReactNode;
}

const MarketplaceFilterSection = ({
  materialTypes,
  sortOptions,
  statusOptions,
  selectedFilters,
  searchQuery,
  filteredCount,
  filtersVisible,
  onFiltersVisibleChange,
  onMaterialToggle,
  onPriceChange,
  onSortChange,
  onStatusChange,
  onSearchChange,
  onClearFilters,
  getStatusColor,
  children
}: MarketplaceFilterSectionProps) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search materials, businesses, tags, or descriptions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-300">
              <Package size={14} />
              <span>{filteredCount} results</span>
            </div>
            <button
              onClick={() => onFiltersVisibleChange(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={onClearFilters}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear all
              </button>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Material Type</h4>
              <div className="space-y-1.5">
                {materialTypes.map(material => (
                  <button
                    key={material.id}
                    onClick={() => onMaterialToggle(material.id)}
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors text-sm ${
                      selectedFilters.materials.includes(material.id)
                        ? 'bg-cyan-50 border border-cyan-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        selectedFilters.materials.includes(material.id)
                          ? 'bg-cyan-100 text-cyan-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      >
                        {material.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-gray-700 font-medium">{material.name}</div>
                        <div className="text-xs text-gray-500">{material.description}</div>
                      </div>
                    </div>
                    {selectedFilters.materials.includes(material.id) && (
                      <Check size={14} className="text-cyan-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Status</h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <button
                    key={status.id}
                    onClick={() => onStatusChange(status.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedFilters.status === status.id
                        ? `${getStatusColor(status.id)} border border-current`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Price Range (RWF)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    value={selectedFilters.priceRange.min}
                    onChange={(e) => onPriceChange(parseInt(e.target.value) || 0, selectedFilters.priceRange.max)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={selectedFilters.priceRange.max}
                    onChange={(e) => onPriceChange(selectedFilters.priceRange.min, parseInt(e.target.value) || 5000)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Sort By</h4>
              <div className="space-y-1.5">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => onSortChange(option.id)}
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors text-sm ${
                      selectedFilters.sortBy === option.id
                        ? 'bg-cyan-50 border border-cyan-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {option.icon}
                      </div>
                      <span className="text-gray-700">{option.label}</span>
                    </div>
                    {selectedFilters.sortBy === option.id && (
                      <Check size={14} className="text-cyan-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </div>

      <AnimatePresence>
        {filtersVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => onFiltersVisibleChange(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={() => onFiltersVisibleChange(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-5">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Material Type</h4>
                  <div className="space-y-1.5">
                    {materialTypes.map(material => (
                      <button
                        key={material.id}
                        onClick={() => onMaterialToggle(material.id)}
                        className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors ${
                          selectedFilters.materials.includes(material.id)
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            selectedFilters.materials.includes(material.id)
                              ? 'bg-cyan-100 text-cyan-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          >
                            {material.icon}
                          </div>
                          <div className="text-left">
                            <div className="text-gray-700 font-medium">{material.name}</div>
                            <div className="text-xs text-gray-500">{material.description}</div>
                          </div>
                        </div>
                        {selectedFilters.materials.includes(material.id) && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(status => (
                      <button
                        key={status.id}
                        onClick={() => onStatusChange(status.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedFilters.status === status.id
                            ? `${getStatusColor(status.id)} border border-current`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Price Range (RWF)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.min}
                        onChange={(e) => onPriceChange(parseInt(e.target.value) || 0, selectedFilters.priceRange.max)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none"
                        placeholder="Min"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={selectedFilters.priceRange.max}
                        onChange={(e) => onPriceChange(selectedFilters.priceRange.min, parseInt(e.target.value) || 5000)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 outline-none"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                  <div className="space-y-1.5">
                    {sortOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => onSortChange(option.id)}
                        className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors ${
                          selectedFilters.sortBy === option.id
                            ? 'bg-cyan-50 border border-cyan-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span className="text-gray-700">{option.label}</span>
                        </div>
                        {selectedFilters.sortBy === option.id && (
                          <Check size={16} className="text-cyan-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={onClearFilters}
                      className="py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => onFiltersVisibleChange(false)}
                      className="py-2.5 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MarketplaceFilterSection;
