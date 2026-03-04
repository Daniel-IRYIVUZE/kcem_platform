// components/blog/BlogCategories.tsx
import { ChevronRight } from 'lucide-react';

interface BlogCategoriesProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const categories = [
  { name: 'All', count: 50 },
  { name: 'Circular Economy', count: 15 },
  { name: 'Success Stories', count: 12 },
  { name: 'Technology', count: 8 },
  { name: 'Policy & Regulation', count: 6 },
  { name: 'Tips & Guides', count: 5 },
  { name: 'Interviews', count: 3 },
  { name: 'Research', count: 1 }
];

const BlogCategories = ({ activeCategory, setActiveCategory }: BlogCategoriesProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
      
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
              activeCategory === category.name
                ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="font-medium">{category.name}</span>
            <div className="flex items-center">
              <span className={`text-sm ${
                activeCategory === category.name ? 'text-cyan-600' : 'text-gray-400 dark:text-gray-500'
              }`}>
                ({category.count})
              </span>
              <ChevronRight className={`w-4 h-4 ml-2 ${
                activeCategory === category.name ? 'text-cyan-600' : 'text-gray-300'
              }`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlogCategories;