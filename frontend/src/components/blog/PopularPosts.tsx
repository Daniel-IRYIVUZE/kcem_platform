// components/blog/PopularPosts.tsx
import { TrendingUp, Eye } from 'lucide-react';
import { blogPosts } from './blogData';
import type { BlogPost } from './blogData';

interface PopularPostsProps {
  onReadMore: (post: BlogPost) => void;
}

const PopularPosts = ({ onReadMore }: PopularPostsProps) => {
  const popularPosts = [...blogPosts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-5 h-5 text-cyan-600 mr-2" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular This Week</h3>
      </div>

      <div className="space-y-4">
        {popularPosts.map((post, index) => (
          <button
            key={post.id}
            type="button"
            onClick={() => onReadMore(post)}
            className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900 p-2 rounded-xl transition-colors"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 text-center">
              <span className={`text-sm font-bold ${
                index < 3 ? 'text-cyan-600' : 'text-gray-400 dark:text-gray-500'
              }`}>
                #{index + 1}
              </span>
            </div>

            {/* Image */}
            <img
              src={post.image}
              alt={post.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-cyan-600 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <Eye className="w-3 h-3 mr-1" />
                {post.views.toLocaleString()} views
                <span className="mx-2">•</span>
                {post.date}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularPosts;