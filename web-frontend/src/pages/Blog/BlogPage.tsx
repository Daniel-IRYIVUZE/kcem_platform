import { useState } from 'react';
import { 
  Search, 
  Clock, 
  Share2, 
  MessageCircle, 
  ChevronLeft, 
  BookOpen,
  Calendar,
  Eye,
  Bookmark,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  TrendingUp,
  Filter,
  X,
  ChevronRight,
  Star,
  ThumbsUp,
  BookmarkCheck
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const BlogPage = () => {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [likedArticles, setLikedArticles] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{id: number, author: string, text: string, date: string, likes: number}>>([
    { id: 1, author: 'Hotel Manager', text: 'Great insights! We\'ve implemented some of these practices.', date: '2 days ago', likes: 12 },
    { id: 2, author: 'Recycling Expert', text: 'The geospatial optimization section was particularly helpful.', date: '1 week ago', likes: 8 },
  ]);

  const categories = [
    'All', 'Featured', 'Sustainability', 'Technology', 'Best Practices', 
    'Case Studies', 'Industry News', 'Research Papers', 'Success Stories'
  ];

  const articles = [
    {
      id: 1,
      title: "Circular Economy in Rwanda: A New Frontier",
      excerpt: "How Kigali is leading the continent in digital waste management and reverse logistics through innovative platforms like KCEM.",
      category: "Sustainability",
      author: "Daniel Iryivuze",
      authorRole: "Platform Lead",
      authorAvatar: "DI",
      readTime: "6 min",
      date: "Feb 5, 2026",
      views: "2.4k",
      likes: 142,
      comments: 28,
      featured: true,
      tags: ["Circular Economy", "Rwanda", "Digital Transformation"],
      content: `
        <p>The circular economy is not just a buzzword in Rwanda; it's a national strategy that's being implemented through innovative digital solutions. With KCEM, we are digitizing the flow of materials that were previously considered waste, transforming them into valuable resources.</p>
        
        <h2>The Rwandan Model</h2>
        <p>Rwanda's approach to circular economy combines strong government policy with private sector innovation. The ban on single-use plastics in 2008 was just the beginning. Today, we're seeing a comprehensive ecosystem emerge where every waste stream has value.</p>
        
        <h2>Digital Transformation in Waste Management</h2>
        <p>Traditional waste management systems rely on linear models. KCEM introduces a digital layer that connects waste generators with recyclers in real-time, optimizing routes and maximizing value recovery.</p>
        
        <h2>Impact So Far</h2>
        <ul>
          <li>85+ businesses actively trading waste</li>
          <li>1,200+ tons diverted from landfill</li>
          <li>40% reduction in collection costs</li>
          <li>New revenue streams for HORECA sector</li>
        </ul>
        
        <p>Sustainable waste management requires a collaborative approach between the public sector, private innovators, and community participation. KCEM serves as the digital bridge connecting these stakeholders.</p>
      `,
      relatedArticles: [2, 3]
    },
    {
      id: 2,
      title: "HORECA Waste Management Best Practices",
      excerpt: "Simple yet effective steps for hotels and restaurants to maximize their waste value and minimize environmental impact.",
      category: "Best Practices",
      author: "Marie Uwase",
      authorRole: "Sustainability Consultant",
      authorAvatar: "MU",
      readTime: "4 min",
      date: "Feb 4, 2026",
      views: "1.8k",
      likes: 96,
      comments: 15,
      featured: true,
      tags: ["HORECA", "Best Practices", "Waste Segregation"],
      content: "Full article content about HORECA best practices...",
      relatedArticles: [1, 4]
    },
    {
      id: 3,
      title: "Technology for Sustainable Waste Management",
      excerpt: "Deep dive into the geospatial algorithms and mobile-first architecture powering our route optimization engine.",
      category: "Technology",
      author: "Eric K.",
      authorRole: "Tech Lead",
      authorAvatar: "EK",
      readTime: "8 min",
      date: "Feb 3, 2026",
      views: "3.2k",
      likes: 204,
      comments: 42,
      featured: true,
      tags: ["Technology", "Geospatial", "Mobile First"],
      content: "Full article content about technology...",
      relatedArticles: [1, 5]
    },
    {
      id: 4,
      title: "Success Stories: Pilot Program Results",
      excerpt: "Quantitative results and qualitative feedback from our 3-month pilot program with 15 hotels in Kigali.",
      category: "Success Stories",
      author: "Neza T.",
      authorRole: "Research Supervisor",
      authorAvatar: "NT",
      readTime: "5 min",
      date: "Feb 2, 2026",
      views: "1.5k",
      likes: 87,
      comments: 21,
      featured: false,
      tags: ["Success Stories", "Pilot Results", "Case Study"],
      content: "Full article content about success stories...",
      relatedArticles: [2, 6]
    },
    {
      id: 5,
      title: "The Economics of Reverse Logistics",
      excerpt: "How digitizing reverse logistics creates new revenue streams while reducing environmental impact.",
      category: "Industry News",
      author: "David M.",
      authorRole: "Economics Analyst",
      authorAvatar: "DM",
      readTime: "7 min",
      date: "Feb 1, 2026",
      views: "2.1k",
      likes: 134,
      comments: 18,
      featured: false,
      tags: ["Economics", "Reverse Logistics", "Revenue"],
      content: "Full article content about economics...",
      relatedArticles: [3, 7]
    },
    {
      id: 6,
      title: "Sustainable Packaging Solutions",
      excerpt: "Innovative packaging alternatives for the hospitality industry that reduce waste and cost.",
      category: "Sustainability",
      author: "Sarah K.",
      authorRole: "Environmental Scientist",
      authorAvatar: "SK",
      readTime: "4 min",
      date: "Jan 30, 2026",
      views: "1.2k",
      likes: 76,
      comments: 12,
      featured: false,
      tags: ["Packaging", "Sustainability", "Cost Reduction"],
      content: "Full article content about packaging...",
      relatedArticles: [4, 8]
    },
    {
      id: 7,
      title: "Mobile-First Design for Waste Collection",
      excerpt: "Why offline-first mobile architecture was crucial for our platform's success in Rwanda.",
      category: "Technology",
      author: "James M.",
      authorRole: "Mobile Developer",
      authorAvatar: "JM",
      readTime: "6 min",
      date: "Jan 28, 2026",
      views: "1.9k",
      likes: 98,
      comments: 24,
      featured: false,
      tags: ["Mobile", "Offline First", "User Experience"],
      content: "Full article content about mobile design...",
      relatedArticles: [3, 5]
    },
    {
      id: 8,
      title: "Community Engagement Strategies",
      excerpt: "How to involve local communities in circular economy initiatives for maximum impact.",
      category: "Best Practices",
      author: "Grace N.",
      authorRole: "Community Manager",
      authorAvatar: "GN",
      readTime: "5 min",
      date: "Jan 25, 2026",
      views: "1.4k",
      likes: 82,
      comments: 16,
      featured: false,
      tags: ["Community", "Engagement", "Social Impact"],
      content: "Full article content about community...",
      relatedArticles: [4, 6]
    }
  ];

  const filteredArticles = articles.filter(article => {
    if (activeCategory !== 'All' && activeCategory !== 'Featured') {
      if (article.category !== activeCategory) return false;
    }
    if (activeCategory === 'Featured' && !article.featured) return false;
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const handleBookmark = (id: number) => {
    setBookmarkedArticles(prev => 
      prev.includes(id) ? prev.filter(bookmarkId => bookmarkId !== id) : [...prev, id]
    );
  };

  const handleLike = (id: number) => {
    setLikedArticles(prev => 
      prev.includes(id) ? prev.filter(likeId => likeId !== id) : [...prev, id]
    );
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      author: 'You',
      text: comment,
      date: 'Just now',
      likes: 0
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  const getRelatedArticles = (articleIds: number[]) => {
    return articles.filter(article => articleIds.includes(article.id));
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = selectedArticle?.title || 'KCEM Blog';
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Article Detail View
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-6">
              <button 
                onClick={() => setSelectedArticle(null)} 
                className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 font-medium transition-colors group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to All Articles
              </button>
            </div>

            {/* Article Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-gray-200"
            >
              {/* Hero Image */}
              <div className="relative h-48 sm:h-64 md:h-80">
                <img 
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1470" 
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                    {selectedArticle.category}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {selectedArticle.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {selectedArticle.readTime} read
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    {selectedArticle.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {selectedArticle.likes} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {selectedArticle.comments} comments
                  </div>
                </div>

                {/* Article Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedArticle.authorAvatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedArticle.author}</p>
                      <p className="text-sm text-gray-500">{selectedArticle.authorRole}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(selectedArticle.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        likedArticles.includes(selectedArticle.id)
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-label="Like article"
                    >
                      <ThumbsUp size={18} className={likedArticles.includes(selectedArticle.id) ? 'fill-rose-600' : ''} />
                    </button>
                    <button
                      onClick={() => handleBookmark(selectedArticle.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        bookmarkedArticles.includes(selectedArticle.id)
                          ? 'bg-cyan-50 text-cyan-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-label="Bookmark article"
                    >
                      {bookmarkedArticles.includes(selectedArticle.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-sm sm:prose max-w-none text-gray-700 mb-8">
                  <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                </div>

                {/* Tags */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Share Section */}
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Share this article</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-10 h-10 bg-cyan-600 text-white rounded-lg flex items-center justify-center hover:bg-cyan-700 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook size={18} />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-10 h-10 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter size={18} />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-10 h-10 bg-cyan-700 text-white rounded-lg flex items-center justify-center hover:bg-cyan-800 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin size={18} />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Share2 size={16} />
                      Copy Link
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Comments ({comments.length})
                  </h3>
                  
                  {/* Add Comment */}
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
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

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-700 text-sm">
                              {comment.author.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{comment.author}</p>
                              <p className="text-xs text-gray-500">{comment.date}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-rose-500 transition-colors">
                            <ThumbsUp size={14} />
                          </button>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Articles */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getRelatedArticles(selectedArticle.relatedArticles).map(article => (
                      <div 
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-bold">
                              {article.category}
                            </span>
                            <span className="text-xs text-gray-500">{article.readTime}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm mb-2 hover:text-cyan-600 transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-gray-600 text-xs line-clamp-2">{article.excerpt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Blog Listing View
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Insights & <span className="text-cyan-600">Stories</span>
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6 text-sm sm:text-base">
              Discover the latest in circular economy, sustainable waste management, and technology innovations
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, or authors..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all text-sm"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600"
                  aria-label="Filter articles"
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mb-6 overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-gray-300 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Categories</h3>
                    <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setShowFilters(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeCategory === cat
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Categories */}
            <div className="lg:w-1/4">
              <div className="hidden lg:block sticky top-28">
                <div className="bg-white rounded-xl border border-gray-300 p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
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
                  
                  {/* Featured Stats */}
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
            </div>

            {/* Articles Grid */}
            <div className="lg:w-3/4">
              {/* Featured Articles */}
              {activeCategory === 'All' || activeCategory === 'Featured' ? (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="text-amber-500" size={18} />
                    Featured Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {articles.filter(article => article.featured).map(article => (
                      <FeaturedArticleCard 
                        key={article.id} 
                        article={article} 
                        onClick={() => setSelectedArticle(article)}
                        onBookmark={() => handleBookmark(article.id)}
                        onLike={() => handleLike(article.id)}
                        isBookmarked={bookmarkedArticles.includes(article.id)}
                        isLiked={likedArticles.includes(article.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* All Articles */}
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
                        onClick={() => setSelectedArticle(article)}
                        onBookmark={() => handleBookmark(article.id)}
                        onLike={() => handleLike(article.id)}
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
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('All');
                      }}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors text-sm"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

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

export default BlogPage;