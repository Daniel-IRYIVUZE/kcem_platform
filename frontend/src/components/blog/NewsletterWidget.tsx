// components/blog/NewsletterWidget.tsx
import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';

const NewsletterWidget = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="bg-cyan-600 rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-center mb-4">
        <Mail className="w-6 h-6 mr-2" />
        <h3 className="text-lg font-bold">Weekly Newsletter</h3>
      </div>

      <p className="text-sm text-cyan-100 mb-4">
        Get circular economy insights delivered to your inbox every week.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-cyan-200 focus:ring-2 focus:ring-white outline-none"
        />

        <button
          type="submit"
          className="w-full bg-white dark:bg-gray-900 text-cyan-600 px-4 py-3 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
        >
          {subscribed ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Subscribed!
            </>
          ) : (
            <>
              Subscribe
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-cyan-200 mt-4 text-center">
        Join 1,200+ subscribers. No spam, unsubscribe anytime.
      </p>

      {/* Social Proof */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex justify-center -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <img
              key={i}
              src="/images/default-avatar.svg"
              alt="Subscriber"
              className="w-8 h-8 rounded-full border-2 border-white object-cover"
            />
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-cyan-500 flex items-center justify-center text-xs font-bold">
            +1.2k
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterWidget;