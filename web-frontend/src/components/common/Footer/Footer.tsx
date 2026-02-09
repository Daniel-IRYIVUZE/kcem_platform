import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Instagram, Twitter, Mail, MapPin, Phone, Facebook, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // In production, this would call your API
      console.log('Subscribed email:', email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const socialLinks = [
    { icon: <Instagram size={20} />, name: 'Instagram', href: 'https://instagram.com/kcem', color: 'hover:text-pink-500' },
    { icon: <Twitter size={20} />, name: 'Twitter', href: 'https://twitter.com/kcem', color: 'hover:text-sky-500' },
    { icon: <Facebook size={20} />, name: 'Facebook', href: 'https://facebook.com/kcem', color: 'hover:text-blue-600' },
    { icon: <Linkedin size={20} />, name: 'LinkedIn', href: 'https://linkedin.com/company/kcem', color: 'hover:text-blue-700' },
    { icon: <Youtube size={20} />, name: 'YouTube', href: 'https://youtube.com/c/kcem', color: 'hover:text-red-600' },
  ];

  const quickLinks = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms of Service', path: '/terms-of-service' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Support', path: '/contact' },
  ];

  const contactInfo = [
    { icon: <Mail size={16} />, value: 'contact@kcem.rw', type: 'email' },
    { icon: <Phone size={16} />, value: '+250 780 162 164', type: 'phone' },
    { icon: <MapPin size={16} />, value: 'Kigali, Rwanda', type: 'address' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-cyan-600 p-2 rounded-lg">
                <Leaf className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-white">KCEM</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Empowering Kigali's HORECA industry through digital circular economy solutions.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} cursor-pointer transition-colors hover:scale-110`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-sm hover:text-cyan-400 cursor-pointer transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Contact Us</h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <div className="text-cyan-400">
                    {info.icon}
                  </div>
                  {info.type === 'email' ? (
                    <a href={`mailto:${info.value}`} className="hover:text-cyan-400 transition-colors">
                      {info.value}
                    </a>
                  ) : info.type === 'phone' ? (
                    <a href={`tel:${info.value.replace(/\s/g, '')}`} className="hover:text-cyan-400 transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <span>{info.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Market Updates</h4>
            <p className="text-xs mb-4">Subscribe for market price updates on UCO and recyclables.</p>
            {subscribed ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 p-2 rounded-lg text-white transition-colors"
                  aria-label="Subscribe"
                >
                  <Mail size={18} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} Kigali Circular Economy Marketplace (KCEM). All rights reserved.
            </div>
            <div className="flex gap-6 text-xs text-gray-400">
              <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="hover:text-gray-300 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;