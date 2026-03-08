// components/contact/ContactHero.tsx
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

const ContactHero = () => {
  return (
    <section className="relative text-white overflow-hidden" style={{ background: '#0f89ab' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="relative max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Contact Label */}
          <div className="inline-flex items-center bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Get in Touch</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl lg:text-6xl text-white font-bold mb-6">
            We'd Love to Hear{' '}
            <span className="text-yellow-300">
              From You
            </span>
          </h1>
          
          <p className="text-xl text-cyan-100 mb-10 max-w-3xl mx-auto">
            Whether you have a question about our platform, want to provide feedback, 
            or just want to say hello, feel free to reach out. Our team is ready to assist you.
          </p>

          {/* Quick Contact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <Mail className="w-5 h-5 text-cyan-300" />
              <span className="text-sm">Response in 24h</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <Phone className="w-5 h-5 text-cyan-300" />
              <span className="text-sm">Mon-Fri, 8am-6pm</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl p-4">
              <MapPin className="w-5 h-5 text-cyan-300" />
              <span className="text-sm">Kigali, Rwanda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="fill-current text-white dark:text-gray-950">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default ContactHero;