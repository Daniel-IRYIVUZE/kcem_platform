// components/blog/BlogGrid.tsx
import { Calendar, ArrowRight, Bookmark, Share2, Heart, MessageCircle, Check } from 'lucide-react';
import { useState } from 'react';
import type { BlogPost } from '../../services/api';

interface BlogGridProps {
  posts: BlogPost[];
  loading: boolean;
  activeCategory: string;
  searchQuery: string;
  onReadMore: (post: BlogPost) => void;
  onTagClick: (tag: string) => void;
  onClearFilters: () => void;
}

const BlogGrid = ({ posts, loading, activeCategory, searchQuery, onReadMore, onTagClick, onClearFilters }: BlogGridProps) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.tags && post.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const toggleSave = (postId: number) => {
    setSavedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleShare = async (post: BlogPost) => {
    const shareText = `${post.title} - ${post.category}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: shareText });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch {
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-800" />
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl">
        <p className="text-gray-500 dark:text-gray-400">No articles found matching your criteria.</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-cyan-600 font-semibold hover:text-cyan-700 dark:text-cyan-400"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {filteredPosts.map((post) => (
        <article
          key={post.id}
          className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.featured_image || '/images/placeholder-image.svg'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
            />
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => toggleSave(post.id)}
                className={`p-2 rounded-full transition-all ${
                  savedPosts.includes(post.id)
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-white dark:bg-gray-900'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleShare(post)}
                className="p-2 bg-white dark:bg-gray-800/90 rounded-full hover:bg-white dark:bg-gray-900 transition-all"
                aria-label="Share article"
              >
                {copiedPostId === post.id ? (
                  <Check className="w-4 h-4 text-cyan-600" />
                ) : (
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {post.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Author & Date */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  src="/images/default-avatar.svg"
                  alt={post.author_name}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg'; }}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{post.author_name}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Title & Excerpt */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.split(',').slice(0, 3).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onTagClick(tag.trim())}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-cyan-100 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
                  >
                    #{tag.trim()}
                  </button>
                ))}
              </div>
            )}

            {/* Meta & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-3 h-3 mr-1 ${
                    likedPosts.includes(post.id) ? 'fill-red-500 text-red-500' : ''
                  }`} />
                  {likedPosts.includes(post.id) ? 1 : 0}
                </button>
                <span className="flex items-center" title={`${post.view_count} views`}>
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {post.view_count}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => onReadMore(post)}
                className="text-cyan-600 text-sm font-semibold hover:text-cyan-700 dark:text-cyan-400 flex items-center group"
              >
                Read more
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default BlogGrid;