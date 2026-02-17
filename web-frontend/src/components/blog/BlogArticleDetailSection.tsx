import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, Eye, ThumbsUp, BookmarkCheck, Bookmark, MessageCircle, Send, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
  likes: number;
}

interface BlogArticleDetailSectionProps {
  article: any;
  comments: Comment[];
  comment: string;
  relatedArticles: any[];
  bookmarkedArticles: number[];
  likedArticles: number[];
  onBackClick: () => void;
  onCommentChange: (text: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  onBookmark: (id: number) => void;
  onLike: (id: number) => void;
  onShare: (platform: string) => void;
  onRelatedArticleSelect: (article: any) => void;
}

const BlogArticleDetailSection = ({
  article,
  comments,
  comment,
  relatedArticles,
  bookmarkedArticles,
  likedArticles,
  onBackClick,
  onCommentChange,
  onCommentSubmit,
  onBookmark,
  onLike,
  onShare,
  onRelatedArticleSelect
}: BlogArticleDetailSectionProps) => {
  return (
    <div className="pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 font-medium transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to All Articles
          </button>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-gray-200"
        >
          <div className="relative h-48 sm:h-64 md:h-80">
            <img
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1470"
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

            <div className="absolute top-4 left-4">
              <div className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                {article.category}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {article.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {article.readTime} read
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                {article.views} views
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp size={14} />
                {article.likes} likes
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                {article.comments} comments
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                  {article.authorAvatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{article.author}</p>
                  <p className="text-sm text-gray-500">{article.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onLike(article.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    likedArticles.includes(article.id)
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Like article"
                >
                  <ThumbsUp size={18} className={likedArticles.includes(article.id) ? 'fill-rose-600' : ''} />
                </button>
                <button
                  onClick={() => onBookmark(article.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedArticles.includes(article.id)
                      ? 'bg-cyan-50 text-cyan-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Bookmark article"
                >
                  {bookmarkedArticles.includes(article.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              </div>
            </div>

            <div className="prose prose-sm sm:prose max-w-none text-gray-700 mb-8">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Share this article</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onShare('facebook')}
                  className="w-10 h-10 bg-cyan-600 text-white rounded-lg flex items-center justify-center hover:bg-cyan-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={18} />
                </button>
                <button
                  onClick={() => onShare('twitter')}
                  className="w-10 h-10 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter size={18} />
                </button>
                <button
                  onClick={() => onShare('linkedin')}
                  className="w-10 h-10 bg-cyan-700 text-white rounded-lg flex items-center justify-center hover:bg-cyan-800 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={18} />
                </button>
                <button
                  onClick={() => onShare('copy')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={16} />
                  Copy Link
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Comments ({comments.length})
              </h3>

              <form onSubmit={onCommentSubmit} className="mb-6">
                <textarea
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none min-h-[80px] resize-none text-sm"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Send size={16} />
                    Post Comment
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {comments.map(comm => (
                  <div key={comm.id} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-700 text-sm">
                          {comm.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{comm.author}</p>
                          <p className="text-xs text-gray-500">{comm.date}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-rose-500 transition-colors">
                        <ThumbsUp size={14} />
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm">{comm.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((relArticle) => (
                  <div
                    key={relArticle.id}
                    onClick={() => onRelatedArticleSelect(relArticle)}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-bold">
                          {relArticle.category}
                        </span>
                        <span className="text-xs text-gray-500">{relArticle.readTime}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-2 hover:text-cyan-600 transition-colors line-clamp-2">
                        {relArticle.title}
                      </h4>
                      <p className="text-gray-600 text-xs line-clamp-2">{relArticle.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default BlogArticleDetailSection;
