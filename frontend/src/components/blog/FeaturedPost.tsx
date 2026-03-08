// components/blog/FeaturedPost.tsx
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import type { BlogPost } from '../../services/api';

interface FeaturedPostProps {
  onReadMore: (post: BlogPost) => void;
  posts: BlogPost[];
  loading: boolean;
}

const FeaturedPost = ({ onReadMore, posts, loading }: FeaturedPostProps) => {
  const featuredPost = posts.find((post) => post.is_featured) ?? posts[0];

  if (loading) {
    return (
      <div className="relative group bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden animate-pulse">
        <div className="grid lg:grid-cols-2">
          <div className="h-64 lg:h-96 bg-gray-200 dark:bg-gray-800" />
          <div className="p-8 lg:p-12 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!featuredPost) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="grid lg:grid-cols-2 bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <img
            src={featuredPost.featured_image || '/images/placeholder-image.svg'}
            alt={featuredPost.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
          />
          <div className="absolute top-4 left-4">
            <span className="bg-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Featured
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {featuredPost.author_name}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {featuredPost.view_count} views
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {featuredPost.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {featuredPost.excerpt}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            {featuredPost.tags?.split(',').map((tag) => (
              <span
                key={tag.trim()}
                className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm"
              >
                {tag.trim()}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onReadMore(featuredPost)}
            className="inline-flex items-center text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400 group w-fit"
          >
            Read Full Article
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;