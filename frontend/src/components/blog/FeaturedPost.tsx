// components/blog/FeaturedPost.tsx
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { blogPosts, featuredPostId, type BlogPost } from './blogData';

interface FeaturedPostProps {
  onReadMore: (post: BlogPost) => void;
}

const FeaturedPost = ({ onReadMore }: FeaturedPostProps) => {
  const featuredPost = blogPosts.find((post) => post.id === featuredPostId) ?? blogPosts[0];

  if (!featuredPost) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="grid lg:grid-cols-2 bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <img
            src={featuredPost.image}
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
              {featuredPost.date}
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {featuredPost.author}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {featuredPost.readTime} read
            </span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {featuredPost.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {featuredPost.excerpt}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            {featuredPost.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm"
              >
                {tag}
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