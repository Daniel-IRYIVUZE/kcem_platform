// components/blog/BlogGrid.tsx
import { Calendar, Clock, ArrowRight, Bookmark, Share2, Heart, MessageCircle, Check } from 'lucide-react';
import { useState } from 'react';
import type { BlogPost } from './blogData';
import { blogPosts } from './blogData';

interface BlogGridProps {
  activeCategory: string;
  searchQuery: string;
  onReadMore: (post: BlogPost) => void;
  onTagClick: (tag: string) => void;
  onClearFilters: () => void;
}
const BlogGrid = ({ activeCategory, searchQuery, onReadMore, onTagClick, onClearFilters }: BlogGridProps) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
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
              src={post.image}
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
                  src={post.authorAvatar}
                  alt={post.author}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.svg'; }}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                {post.date}
              </div>
            </div>

            {/* Title & Excerpt */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-400 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Meta & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.readTime}
                </span>
                <button 
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-3 h-3 mr-1 ${
                    likedPosts.includes(post.id) ? 'fill-red-500 text-red-500' : ''
                  }`} />
                  {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                </button>
                <span className="flex items-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {post.comments}
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