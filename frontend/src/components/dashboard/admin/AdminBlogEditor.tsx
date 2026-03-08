// components/dashboard/admin/AdminBlogEditor.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import { blogAPI, type BlogPostCreate } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminBlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BlogPostCreate>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'sustainability',
    tags: '',
    is_published: false,
    is_featured: false,
    author_display_name: '',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    if (id && id !== 'new') {
      fetchPost(Number(id));
    }
  }, [id, user, navigate]);

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true);
      const post = await blogAPI.getById(postId);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image || '',
        category: post.category,
        tags: post.tags || '',
        is_published: post.is_published,
        is_featured: post.is_featured,
        author_display_name: post.author_display_name || '',
      });
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('Failed to load post');
      navigate('/dashboard/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const slugToUse = formData.slug || generateSlug(formData.title);
      const finalData = { ...formData, slug: slugToUse };
      
      if (id && id !== 'new') {
        await blogAPI.update(Number(id), finalData);
      } else {
        await blogAPI.create(finalData);
      }
      
      navigate('/dashboard/admin/blog');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!id || id === 'new') {
      setFormData(prev => ({ ...prev, is_published: !prev.is_published }));
      return;
    }

    try {
      const updated = formData.is_published 
        ? await blogAPI.unpublish(Number(id))
        : await blogAPI.publish(Number(id));
      
      setFormData(prev => ({ ...prev, is_published: updated.is_published }));
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      alert('Failed to update publish status');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading post...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/admin/blog')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {id && id !== 'new' ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage blog content
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePublishToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              formData.is_published
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            {formData.is_published ? 'Published' : 'Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title..."
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Slug */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="url-friendly-slug"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            URL: /blog/{formData.slug || 'your-post-slug'}
          </p>
        </div>

        {/* Excerpt */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt *
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief summary of the post..."
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Write your post content here... (Markdown supported)"
            required
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Supports Markdown and HTML formatting
          </p>
        </div>

        {/* Meta Information */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meta Information</h3>

          {/* Author Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author Name
            </label>
            <input
              type="text"
              value={formData.author_display_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, author_display_name: e.target.value }))}
              placeholder="e.g. Dr. Amara Nkusi or EcoTrade Editorial Team"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Public display name shown on the blog. Leave blank to use your account name.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="sustainability">Sustainability</option>
              <option value="recycling">Recycling</option>
              <option value="news">News</option>
              <option value="case-study">Case Study</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Separate tags with commas
            </p>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            {formData.featured_image && (
              <img
                src={formData.featured_image}
                alt="Preview"
                className="mt-2 w-full max-w-md rounded-lg"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Feature this post on homepage
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
