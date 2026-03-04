// components/blog/BlogSearch.tsx
import { Search, X } from 'lucide-react';

interface BlogSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const BlogSearch = ({ searchQuery, setSearchQuery }: BlogSearchProps) => {
  return (
    <div className="relative max-w-2xl mx-auto -mt-8 mb-8">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, topics, or authors..."
          className="w-full px-6 py-4 pr-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
          )}
          <button className="bg-cyan-600 text-white p-3 rounded-xl hover:bg-cyan-700 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Suggestions */}
      {!searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 z-10">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {['UCO', 'Glass Recycling', 'Green Score', 'Sustainability', 'Hotels'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-400 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSearch;