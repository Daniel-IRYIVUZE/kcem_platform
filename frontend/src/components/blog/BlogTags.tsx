// components/blog/BlogTags.tsx
import { Leaf, Recycle, Building2, Factory } from 'lucide-react';

const tags = [
  'UCO',
  'Glass Recycling',
  'Green Score',
  'Hotels',
  'Sustainability',
  'Biodiesel',
  'EPR',
  'PostGIS',
  'Circular Economy',
  'Carbon Footprint',
  'REMA',
  'Drivers',
  'Revenue',
  'Technology',
  'Policy'
];

interface BlogTagsProps {
  onTagClick: (tag: string) => void;
}

const BlogTags = ({ onTagClick }: BlogTagsProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Popular Tags</h3>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <button
            key={index}
            onClick={() => onTagClick(tag)}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-400 transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Tag Cloud Visualization */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-wrap gap-1 justify-center opacity-50">
          <span className="text-xs">UCO</span>
          <Recycle className="w-5 h-5" />
          <span className="text-base">Glass</span>
          <span className="text-sm">Recycling</span>
          <Leaf className="w-5 h-5" />
          <span className="text-xs">Green</span>
          <span className="text-lg">Score</span>
          <Building2 className="w-5 h-5" />
          <Factory className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default BlogTags;