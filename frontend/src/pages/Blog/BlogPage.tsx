// pages/BlogPage.tsx
import { useState } from 'react';
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
import type { BlogPost } from '../../components/blog/blogData';

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
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
          <FeaturedPost onReadMore={handleOpenPost} />

          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            {/* Main Content - Blog Posts */}
            <div className="lg:col-span-2">
              {/* Category Filter */}
              <CategoryFilter 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
              />
              
              {/* Blog Grid */}
              <BlogGrid 
                activeCategory={activeCategory} 
                searchQuery={searchQuery} 
                onReadMore={handleOpenPost}
                onTagClick={handleTagClick}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <PopularPosts onReadMore={handleOpenPost} />
              <BlogCategories 
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
              />
              <BlogTags onTagClick={handleTagClick} />
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
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-64 object-cover rounded-xl"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
            />
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{selectedPost.author}</span>
              <span>{selectedPost.date}</span>
              <span>{selectedPost.readTime} read</span>
              <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold">
                {selectedPost.category}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{selectedPost.excerpt}</p>
            <div className="space-y-3">
              {selectedPost.content.map((paragraph, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPost.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-cyan-100 hover:text-cyan-700 dark:text-cyan-400 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default BlogPage;