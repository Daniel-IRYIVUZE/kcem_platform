import { TrendingUp, ChevronRight } from 'lucide-react';

interface BlogSidebarSectionProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const BlogSidebarSection = ({
  categories,
  activeCategory,
  onCategoryChange
}: BlogSidebarSectionProps) => {
  return (
    <div className="hidden lg:block sticky top-28">
      <div className="bg-white rounded-xl border border-gray-300 p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors text-sm ${
                activeCategory === cat
                  ? 'bg-cyan-50 border border-cyan-200 text-cyan-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-medium">{cat}</span>
              {activeCategory === cat && (
                <ChevronRight size={14} />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-cyan-600" size={16} />
            <span className="font-bold text-gray-900 text-sm">Weekly Stats</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>12 new articles this week</div>
            <div>8.4k total views</div>
            <div>156 comments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSidebarSection;
