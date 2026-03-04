// components/blog/CategoryFilter.tsx
interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const categories = [
  'All',
  'Circular Economy',
  'Success Stories',
  'Technology',
  'Policy & Regulation',
  'Tips & Guides',
  'Interviews',
  'Research'
];

const CategoryFilter = ({ activeCategory, setActiveCategory }: CategoryFilterProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === category
                ? 'bg-cyan-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:bg-cyan-900/20 hover:text-cyan-700 dark:text-cyan-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;