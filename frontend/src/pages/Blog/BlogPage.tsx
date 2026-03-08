// pages/BlogPage.tsx
import { useState, useEffect } from 'react';
import { blogAPI, type BlogPost } from '../../services/api';
import { renderMarkdown } from '../../utils/markdown';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import BlogHero from '../../components/blog/BlogHero';
import FeaturedPost from '../../components/blog/FeaturedPost';
import CategoryFilter from '../../components/blog/CategoryFilter';
import BlogGrid from '../../components/blog/BlogGrid';
import PopularPosts from '../../components/blog/PopularPosts';
import NewsletterWidget from '../../components/blog/NewsletterWidget';
import BlogSearch from '../../components/blog/BlogSearch';
import BlogCategories from '../../components/blog/BlogCategories';
import BlogTags from '../../components/blog/BlogTags';
import Modal from '../../components/common/Modal/Modal';

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ALL published posts once, then filter client-side for instant response
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await blogAPI.list({ limit: 200 });
        setAllPosts(data);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Client-side filtering — instant, no extra API calls
  const posts = allPosts.filter(post => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      (post.tags && post.tags.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleOpenPost = async (post: BlogPost) => {
    // Fetch full post details if needed
    try {
      const fullPost = await blogAPI.getBySlug(post.slug);
      setSelectedPost(fullPost);
    } catch (error) {
      console.error('Failed to fetch post details:', error);
      setSelectedPost(post);
    }
  };

  const handleClosePost = () => {
    setSelectedPost(null);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleClearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <BlogHero />
        
        <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <BlogSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {/* Featured Post */}
          <FeaturedPost onReadMore={handleOpenPost} posts={allPosts} loading={loading} />

          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {/* Main Content - Blog Posts */}
            <div className="lg:col-span-2">
              {/* Category Filter */}
              <CategoryFilter 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory}
                posts={allPosts}
              />
              
              {/* Blog Grid */}
              <BlogGrid 
                posts={posts}
                loading={loading}
                activeCategory={activeCategory} 
                searchQuery={searchQuery} 
                onReadMore={handleOpenPost}
                onTagClick={handleTagClick}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <PopularPosts onReadMore={handleOpenPost} posts={posts} loading={loading} />
              <BlogCategories 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory}
                posts={allPosts}
              />
              <BlogTags onTagClick={handleTagClick} posts={posts} />
              <NewsletterWidget />
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={Boolean(selectedPost)}
        onClose={handleClosePost}
        title={selectedPost?.title}
        size="lg"
      >
        {selectedPost && (
          <div className="space-y-6">
            {selectedPost.featured_image && (
              <img
                src={selectedPost.featured_image}
                alt={selectedPost.title}
                className="w-full h-64 object-cover rounded-xl"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
              />
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{selectedPost.author_name}</span>
              <span>{new Date(selectedPost.published_at || selectedPost.created_at).toLocaleDateString()}</span>
              <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold">
                {selectedPost.category}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{selectedPost.excerpt}</p>
            <div className="space-y-2">
              <div
                className="prose prose-gray dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedPost.content) }}
              />
            </div>
            {selectedPost.tags && (
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.split(',').map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag.trim())}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-cyan-100 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors"
                  >
                    #{tag.trim()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default BlogPage;