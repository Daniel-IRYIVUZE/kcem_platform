// components/dashboard/admin/AdminBlogManagement.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Star, 
  Search, Filter, Calendar, User 
} from 'lucide-react';
import { blogAPI, type BlogPost } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminBlogManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogAPI.listAll();
      setPosts(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load posts';
      console.error('Failed to fetch blog posts:', error);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await blogAPI.delete(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const updated = post.is_published 
        ? await blogAPI.unpublish(post.id)
        : await blogAPI.publish(post.id);
      setPosts(posts.map(p => p.id === post.id ? updated : p));
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const updated = await blogAPI.toggleFeatured(post.id);
      setPosts(posts.map(p => p.id === post.id ? updated : p));
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && post.is_published) ||
                         (statusFilter === 'draft' && !post.is_published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(posts.map(p => p.category)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage blog posts and content
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/admin/blog/new')}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
          <p className="text-2xl font-bold text-green-600">{posts.filter(p => p.is_published).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Draft</p>
          <p className="text-2xl font-bold text-yellow-600">{posts.filter(p => !p.is_published).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Featured</p>
          <p className="text-2xl font-bold text-cyan-600">{posts.filter(p => p.is_featured).length}</p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 font-medium mb-2">Failed to load posts</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchPosts}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {post.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {post.author_name ?? 'Admin'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.is_published ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {(post.view_count ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFeatured(post)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.is_featured 
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                          }`}
                          title={post.is_featured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className={`w-4 h-4 ${post.is_featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`p-2 rounded-lg transition-colors ${
                            post.is_published
                              ? 'bg-green-100 dark:bg-green-900 text-green-600'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                          title={post.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {post.is_published ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/admin/blog/edit/${post.id}`)}
                          className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900 hover:text-cyan-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
