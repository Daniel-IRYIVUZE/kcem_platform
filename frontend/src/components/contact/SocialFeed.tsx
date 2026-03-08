// components/contact/SocialFeed.tsx
import { Twitter, Instagram, Linkedin, ExternalLink, Heart, MessageCircle, Repeat2 } from 'lucide-react';

const socialPosts = [
  {
    platform: 'twitter',
    icon: Twitter,
    color: 'text-blue-400',
    username: '@EcoTradeRW',
    content: 'Excited to announce that we\'ve diverted 0.1 tons of waste from Nduba landfill! Thanks to our 12 partner hotels and 23 recyclers. #CircularEconomy #Kigali',
    time: '2h ago',
    likes: 234,
    retweets: 89,
    replies: 23,
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400',
    url: 'https://twitter.com/EcoTradeRW'
  },
  {
    platform: 'instagram',
    icon: Instagram,
    color: 'text-pink-600',
    username: '@ecotrade.rw',
    content: 'Meet Jean, one of our top drivers! He\'s completed over 500 collections and helped divert 50 tons of glass. #DriverSpotlight',
    time: '5h ago',
    likes: 892,
    comments: 45,
    image: '/images/default-avatar.svg',
    url: 'https://instagram.com/ecotrade.rw'
  },
  {
    platform: 'linkedin',
    icon: Linkedin,
    color: 'text-blue-700',
    username: 'EcoTrade Rwanda',
    content: 'We\'re hiring! Join our team as a Logistics Coordinator and help build Kigali\'s circular economy. Link in bio.',
    time: '1d ago',
    likes: 567,
    comments: 34,
    shares: 78,
    url: 'https://www.linkedin.com/company/ecotrade-rwanda/'
  }
];

const SocialFeed = () => {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Follow Us</h2>
        <div className="flex space-x-4">
          <a
            href="https://twitter.com/EcoTradeRW"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-500"
            aria-label="EcoTrade on Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com/ecotrade.rw"
            target="_blank"
            rel="noreferrer"
            className="text-pink-600 hover:text-pink-700"
            aria-label="EcoTrade on Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/ecotrade-rwanda/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 hover:text-blue-800 dark:text-blue-200"
            aria-label="EcoTrade on LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {socialPosts.map((post, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Post Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <post.icon className={`w-5 h-5 ${post.color} mr-2`} />
                  <span className="font-semibold text-gray-900 dark:text-white">{post.username}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{post.time}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>
              
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-image.svg'; }}
                />
              )}

              {/* Engagement Metrics */}
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likes}
                  </button>
                  <button className="flex items-center hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments || post.replies}
                  </button>
                  {post.retweets && (
                    <button className="flex items-center hover:text-cyan-500 transition-colors">
                      <Repeat2 className="w-4 h-4 mr-1" />
                      {post.retweets}
                    </button>
                  )}
                </div>
                
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                  aria-label="Open social post"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Follow CTA */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Join the conversation on social media</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://twitter.com/EcoTradeRW"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-400 text-white rounded-xl font-semibold hover:bg-blue-500 transition-colors flex items-center"
          >
            <Twitter className="w-4 h-4 mr-2" />
            Follow @EcoTradeRW
          </a>
          <a
            href="https://instagram.com/ecotrade.rw"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center"
          >
            <Instagram className="w-4 h-4 mr-2" />
            Follow @ecotrade.rw
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;