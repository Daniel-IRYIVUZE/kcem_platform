// components/contact/ContactInfo.tsx
import { MapPin, Phone, Mail, Clock, Globe, AlertCircle, MessageCircle } from 'lucide-react';

interface ContactInfoProps {
  onOpenChat?: () => void;
}

const ContactInfo = ({ onOpenChat }: ContactInfoProps) => {
  return (
    <div className="bg-cyan-600 rounded-2xl shadow-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-6">Contact Information</h3>
      
      <div className="space-y-6">
        {/* Address */}
        <div className="flex items-start space-x-4">
          <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-2">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-200">Visit Us</p>
            <p className="font-semibold">Kigali Innovation City</p>
            <p className="text-sm text-cyan-100">KG 541 St, Gasabo</p>
            <p className="text-sm text-cyan-100">Kigali, Rwanda</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start space-x-4">
          <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-2">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-200">Call Us</p>
            <a href="tel:+250780162164" className="font-semibold hover:text-white/80">
              +250 780 162 164
            </a>
            <p className="text-sm text-cyan-100">
              Toll-free:{' '}
              <a href="tel:1234" className="hover:text-white/80">
                1234
              </a>
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start space-x-4">
          <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-2">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-200">Email Us</p>
            <a href="mailto:info@ecotrade.rw" className="font-semibold hover:text-white/80">
              info@ecotrade.rw
            </a>
            <p className="text-sm text-cyan-100">
              <a href="mailto:support@ecotrade.rw" className="hover:text-white/80">
                support@ecotrade.rw
              </a>
            </p>
          </div>
        </div>

        {/* Hours */}
        <div className="flex items-start space-x-4">
          <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-2">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-200">Office Hours</p>
            <p className="font-semibold">Mon-Fri: 8:00 AM - 6:00 PM</p>
            <p className="text-sm text-cyan-100">Sat: 9:00 AM - 1:00 PM</p>
            <p className="text-sm text-cyan-100">Sun: Closed (Emergency only)</p>
          </div>
        </div>

        {/* Website */}
        <div className="flex items-start space-x-4">
          <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-2">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-cyan-200">Website</p>
            <a
              href="https://www.ecotrade.rw"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:text-white/80"
            >
              www.ecotrade.rw
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center space-x-2 text-cyan-200 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">24/7 Emergency</span>
        </div>
        <a href="tel:+250780162164" className="text-2xl font-bold hover:text-white/80">
          +250 780 162 164
        </a>
        <p className="text-xs text-cyan-200 mt-1">For drivers and urgent issues</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onOpenChat}
          className="w-full bg-gray-800/10/20 hover:bg-gray-800/10/30 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 text-white rounded-xl py-10 font-semibold flex items-center justify-center transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Start Live Chat
        </button>
      </div>
    </div>
  );
};

export default ContactInfo;