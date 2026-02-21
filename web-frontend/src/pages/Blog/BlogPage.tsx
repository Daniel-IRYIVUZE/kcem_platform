import { useState } from 'react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import BlogHeroSection from '../../components/blog/BlogHeroSection';
import BlogSearchFilterSection from '../../components/blog/BlogSearchFilterSection';
import BlogSidebarSection from '../../components/blog/BlogSidebarSection';
import BlogArticleGridSection from '../../components/blog/BlogArticleGridSection';
import BlogArticleDetailSection from '../../components/blog/BlogArticleDetailSection';

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
    { id: 2, author: 'Recycling Expert', text: 'The geospatial optimization section was particularly helpful.', date: '1 week ago', likes: 8 }
  ]);

  const categories = [
    'All', 'Featured', 'Sustainability', 'Technology', 'Best Practices',
    'Case Studies', 'Industry News', 'Research Papers', 'Success Stories'
  ];

  const articles = [
    {
      id: 1,
      title: 'Circular Economy in Rwanda: A New Frontier',
      excerpt: 'How Kigali is leading the continent in digital waste management and reverse logistics through innovative platforms like EcoTrade.',
      category: 'Sustainability',
      author: 'Daniel Iryivuze',
      authorRole: 'Platform Lead',
      authorAvatar: 'DI',
      readTime: '6 min',
      date: 'Feb 5, 2026',
      views: '2.4k',
      likes: 142,
      comments: 28,
      featured: true,
      tags: ['Circular Economy', 'Rwanda', 'Digital Transformation'],
      content: `
        <p>The circular economy is not just a buzzword in Rwanda; it's a national strategy that's being implemented through innovative digital solutions. With EcoTrade, we are digitizing the flow of materials that were previously considered waste, transforming them into valuable resources.</p>
        
        <h2>The Rwandan Model</h2>
        <p>Rwanda's approach to circular economy combines strong government policy with private sector innovation. The ban on single-use plastics in 2008 was just the beginning. Today, we're seeing a comprehensive ecosystem emerge where every waste stream has value.</p>
        
        <h2>Digital Transformation in Waste Management</h2>
        <p>Traditional waste management systems rely on linear models. EcoTrade introduces a digital layer that connects waste generators with recyclers in real-time, optimizing routes and maximizing value recovery.</p>
        
        <h2>Impact So Far</h2>
        <ul>
          <li>85+ businesses actively trading waste</li>
          <li>1,200+ tons diverted from landfill</li>
          <li>40% reduction in collection costs</li>
          <li>New revenue streams for HORECA sector</li>
        </ul>
        
        <p>Sustainable waste management requires a collaborative approach between the public sector, private innovators, and community participation. EcoTrade serves as the digital bridge connecting these stakeholders.</p>
      `,
      relatedArticles: [2, 3]
    },
    {
      id: 2,
      title: 'HORECA Waste Management Best Practices',
      excerpt: 'Simple yet effective steps for hotels and restaurants to maximize their waste value and minimize environmental impact.',
      category: 'Best Practices',
      author: 'Marie Uwase',
      authorRole: 'Sustainability Consultant',
      authorAvatar: 'MU',
      readTime: '4 min',
      date: 'Feb 4, 2026',
      views: '1.8k',
      likes: 96,
      comments: 15,
      featured: true,
      tags: ['HORECA', 'Best Practices', 'Waste Segregation'],
      content: 'Full article content about HORECA best practices...',
      relatedArticles: [1, 4]
    },
    {
      id: 3,
      title: 'Technology for Sustainable Waste Management',
      excerpt: 'Deep dive into the geospatial algorithms and mobile-first architecture powering our route optimization engine.',
      category: 'Technology',
      author: 'Eric K.',
      authorRole: 'Tech Lead',
      authorAvatar: 'EK',
      readTime: '8 min',
      date: 'Feb 3, 2026',
      views: '3.2k',
      likes: 204,
      comments: 42,
      featured: true,
      tags: ['Technology', 'Geospatial', 'Mobile First'],
      content: 'Full article content about technology...',
      relatedArticles: [1, 5]
    },
    {
      id: 4,
      title: 'Success Stories: Pilot Program Results',
      excerpt: 'Quantitative results and qualitative feedback from our 3-month pilot program with 15 hotels in Kigali.',
      category: 'Success Stories',
      author: 'Neza T.',
      authorRole: 'Research Supervisor',
      authorAvatar: 'NT',
      readTime: '5 min',
      date: 'Feb 2, 2026',
      views: '1.5k',
      likes: 87,
      comments: 21,
      featured: false,
      tags: ['Success Stories', 'Pilot Results', 'Case Study'],
      content: 'Full article content about success stories...',
      relatedArticles: [2, 6]
    },
    {
      id: 5,
      title: 'The Economics of Reverse Logistics',
      excerpt: 'How digitizing reverse logistics creates new revenue streams while reducing environmental impact.',
      category: 'Industry News',
      author: 'David M.',
      authorRole: 'Economics Analyst',
      authorAvatar: 'DM',
      readTime: '7 min',
      date: 'Feb 1, 2026',
      views: '2.1k',
      likes: 134,
      comments: 18,
      featured: false,
      tags: ['Economics', 'Reverse Logistics', 'Revenue'],
      content: 'Full article content about economics...',
      relatedArticles: [3, 7]
    },
    {
      id: 6,
      title: 'Sustainable Packaging Solutions',
      excerpt: 'Innovative packaging alternatives for the hospitality industry that reduce waste and cost.',
      category: 'Sustainability',
      author: 'Sarah K.',
      authorRole: 'Environmental Scientist',
      authorAvatar: 'SK',
      readTime: '4 min',
      date: 'Jan 30, 2026',
      views: '1.2k',
      likes: 76,
      comments: 12,
      featured: false,
      tags: ['Packaging', 'Sustainability', 'Cost Reduction'],
      content: 'Full article content about packaging...',
      relatedArticles: [4, 8]
    },
    {
      id: 7,
      title: 'Mobile-First Design for Waste Collection',
      excerpt: 'Why offline-first mobile architecture was crucial for our platform\'s success in Rwanda.',
      category: 'Technology',
      author: 'James M.',
      authorRole: 'Mobile Developer',
      authorAvatar: 'JM',
      readTime: '6 min',
      date: 'Jan 28, 2026',
      views: '1.9k',
      likes: 98,
      comments: 24,
      featured: false,
      tags: ['Mobile', 'Offline First', 'User Experience'],
      content: 'Full article content about mobile design...',
      relatedArticles: [3, 5]
    },
    {
      id: 8,
      title: 'Community Engagement Strategies',
      excerpt: 'How to involve local communities in circular economy initiatives for maximum impact.',
      category: 'Best Practices',
      author: 'Grace N.',
      authorRole: 'Community Manager',
      authorAvatar: 'GN',
      readTime: '5 min',
      date: 'Jan 25, 2026',
      views: '1.4k',
      likes: 82,
      comments: 16,
      featured: false,
      tags: ['Community', 'Engagement', 'Social Impact'],
      content: 'Full article content about community...',
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
    const title = selectedArticle?.title || 'EcoTrade Blog';
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

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <BlogArticleDetailSection
          article={selectedArticle}
          comments={comments}
          comment={comment}
          relatedArticles={getRelatedArticles(selectedArticle.relatedArticles)}
          bookmarkedArticles={bookmarkedArticles}
          likedArticles={likedArticles}
          onBackClick={() => setSelectedArticle(null)}
          onCommentChange={setComment}
          onCommentSubmit={handleCommentSubmit}
          onBookmark={handleBookmark}
          onLike={handleLike}
          onShare={handleShare}
          onRelatedArticleSelect={setSelectedArticle}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogHeroSection />
          <BlogSearchFilterSection
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={showFilters}
            onShowFilters={setShowFilters}
          />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <div className="lg:w-1/4">
              <BlogSidebarSection
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
            <div className="lg:w-3/4">
              <BlogArticleGridSection
                articles={articles}
                filteredArticles={filteredArticles}
                activeCategory={activeCategory}
                bookmarkedArticles={bookmarkedArticles}
                likedArticles={likedArticles}
                onArticleSelect={setSelectedArticle}
                onBookmark={handleBookmark}
                onLike={handleLike}
                onClearSearch={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;
