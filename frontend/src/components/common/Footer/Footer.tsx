import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram, Twitter, Mail, MapPin, Phone, Facebook, Linkedin, Youtube,
  ArrowUp, Leaf, Recycle, Globe2, ChevronRight
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Subscribed email:', email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: <Instagram size={18} />, name: 'Instagram', href: 'https://instagram.com/EcoTrade', hoverClass: 'hover:bg-pink-500' },
    { icon: <Twitter size={18} />, name: 'Twitter/X', href: 'https://twitter.com/EcoTrade', hoverClass: 'hover:bg-sky-500' },
    { icon: <Facebook size={18} />, name: 'Facebook', href: 'https://facebook.com/EcoTrade', hoverClass: 'hover:bg-blue-600' },
    { icon: <Linkedin size={18} />, name: 'LinkedIn', href: 'https://linkedin.com/company/EcoTrade', hoverClass: 'hover:bg-cyan-700' },
    { icon: <Youtube size={18} />, name: 'YouTube', href: 'https://youtube.com/c/EcoTrade', hoverClass: 'hover:bg-red-600' },
  ];

  const platformLinks = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Our Services', path: '/services' },
    { label: 'About EcoTrade', path: '/about' },
    { label: 'Blog & News', path: '/blog' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', path: '/terms-privacy' },
    { label: 'Terms of Service', path: '/terms-privacy' },
    { label: 'Cookie Policy', path: '/terms-privacy' },
    { label: 'FAQ', path: '/contact' },
    { label: 'Support Center', path: '/contact' },
  ];

  const impactStats = [
    { icon: <Recycle size={20} />, value: '0.1+', label: 'Tons Recycled' },
    { icon: <Globe2 size={20} />, value: '3+', label: 'Partners' },
    { icon: <Leaf size={20} />, value: '1K+', label: 'CO₂ Saved (kg)' },
  ];

  return (
    <>
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-8 right-6 z-50 w-12 h-12 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp size={20} />
      </button>

      <footer className="bg-gray-950 dark:bg-gray-950 text-gray-300 border-t border-gray-800">
        {/* Impact Stats Bar */}
        <div className="bg-cyan-900/50 border-b border-cyan-800/30">
          <div className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-3 gap-4">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-cyan-400">{stat.icon}</span>
                    <span className="text-xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-xs text-cyan-200/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-block mb-4 group">
                <img
                  src="/images/EcoTrade1.png"
                  alt="EcoTrade Rwanda"
                  className="h-20 object-contain group-hover:opacity-90 transition-opacity"
                />
              </Link>
              <p className="text-sm leading-relaxed text-gray-400 dark:text-gray-500 max-w-xs mb-6">
                Empowering Kigali's HORECA industry through digital circular economy solutions,
                connecting hotels, restaurants, and cafés with certified recyclers to close the 
                resource loop.
              </p>

              {/* Social Links */}
              <div className="flex gap-3 mb-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-white transition-all duration-200 ${social.hoverClass}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <a href="mailto:contact@EcoTrade.rw" className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500 hover:text-cyan-400 transition-colors group">
                  <Mail size={15} className="text-cyan-500 flex-shrink-0" />
                  contact@EcoTrade.rw
                </a>
                <a href="tel:+250780162164" className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500 hover:text-cyan-400 transition-colors group">
                  <Phone size={15} className="text-cyan-500 flex-shrink-0" />
                  +250 780 162 164
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
                  <MapPin size={15} className="text-cyan-500 flex-shrink-0" />
                  Kigali Innovation City, Rwanda
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-cyan-400 transition-colors group"
                    >
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200 text-cyan-500" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Legal & Support</h4>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-cyan-400 transition-colors group"
                    >
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200 text-cyan-500" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider">Market Updates</h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 leading-relaxed">
                Get weekly price updates on UCO, recyclables, and circular economy insights delivered to your inbox.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 bg-cyan-900/40 border border-cyan-700/50 text-cyan-300 px-4 py-3 rounded-xl text-sm">
                  <span className="text-lg">🎉</span>
                  <span>You're subscribed!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-100 placeholder:text-gray-500 dark:text-gray-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={14} />
                    Subscribe Now
                  </button>
                </form>
              )}

              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="lg:w-11/12 max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center md:text-left">
                &copy; {new Date().getFullYear()} EcoTrade Rwanda. All rights reserved. Built by Daniel Iryivuze for a sustainable Kigali.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
