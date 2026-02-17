import { motion } from 'framer-motion';
import { Clock, BookOpen, Star, ThumbsUp, BookmarkCheck, Bookmark, ChevronRight } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  date: string;
  views: string;
  likes: number;
  comments: number;
  featured: boolean;
  tags: string[];
}

interface BlogArticleGridSectionProps {
  articles: Article[];
  filteredArticles: Article[];
  activeCategory: string;
  bookmarkedArticles: number[];
  likedArticles: number[];
  onArticleSelect: (article: Article) => void;
  onBookmark: (id: number) => void;
  onLike: (id: number) => void;
  onClearSearch: () => void;
}

const FeaturedArticleCard = ({ article, onClick, onBookmark, onLike, isBookmarked, isLiked }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-300 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-cyan-600 text-white rounded text-xs font-bold">
            {article.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {article.readTime}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-cyan-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {article.authorAvatar}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{article.author}</p>
              <p className="text-xs text-gray-500">{article.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`p-1.5 rounded transition-colors ${
                isLiked ? 'text-rose-500 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-500 hover:bg-gray-100'
              }`}
              aria-label="Like article"
            >
              <ThumbsUp size={14} className={isLiked ? 'fill-rose-500' : ''} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className={`p-1.5 rounded transition-colors ${
                isBookmarked ? 'text-cyan-500 hover:bg-cyan-50' : 'text-gray-400 hover:text-cyan-500 hover:bg-gray-100'
              }`}
              aria-label="Bookmark article"
            >
              {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ArticleCard = ({ article, onClick, onBookmark, onLike, isBookmarked, isLiked }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-300 overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-bold">
            {article.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={10} />
            {article.readTime}
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-sm mb-2 hover:text-cyan-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{article.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-700 text-xs">
              {article.authorAvatar}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{article.author.split(' ')[0]}</p>
              <p className="text-xs text-gray-500">{article.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`p-1 rounded transition-colors ${
                isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
              }`}
              aria-label="Like article"
            >
              <ThumbsUp size={12} className={isLiked ? 'fill-rose-500' : ''} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className={`p-1 rounded transition-colors ${
                isBookmarked ? 'text-cyan-500' : 'text-gray-400 hover:text-cyan-500'
              }`}
              aria-label="Bookmark article"
            >
              {isBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const BlogArticleGridSection = ({
  articles,
  filteredArticles,
  activeCategory,
  bookmarkedArticles,
  likedArticles,
  onArticleSelect,
  onBookmark,
  onLike,
  onClearSearch
}: BlogArticleGridSectionProps) => {
  const featuredArticles = articles.filter(article => article.featured);

  return (
    <section>
      {activeCategory === 'All' || activeCategory === 'Featured' ? (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-amber-500" size={18} />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {featuredArticles.map(article => (
              <FeaturedArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleSelect(article)}
                onBookmark={() => onBookmark(article.id)}
                onLike={() => onLike(article.id)}
                isBookmarked={bookmarkedArticles.includes(article.id)}
                isLiked={likedArticles.includes(article.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {activeCategory === 'All' ? 'Latest Articles' : activeCategory}
          </h2>
          <span className="text-gray-500 text-sm">{filteredArticles.length} articles</span>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleSelect(article)}
                onBookmark={() => onBookmark(article.id)}
                onLike={() => onLike(article.id)}
                isBookmarked={bookmarkedArticles.includes(article.id)}
                isLiked={likedArticles.includes(article.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="mx-auto text-gray-300 mb-3" size={40} />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-4 text-sm">Try adjusting your search or filters</p>
            <button
              onClick={onClearSearch}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogArticleGridSection;
