// components/home/NewsletterSection.tsx
import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Stay Updated on Circular Economy News
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get weekly insights on waste management, sustainability tips, and platform updates
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                {status === 'success' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-cyan-600" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center"
              >
                Subscribe
                <Send className="ml-2 w-4 h-4" />
              </button>
            </div>

            {status === 'success' && (
              <p className="text-center text-cyan-600 text-sm mt-3">
                Thanks for subscribing! Check your inbox for confirmation.
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>

          {/* Social Proof */}
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">1,200+</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Weekly</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Newsletter</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Free</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">E-books</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;