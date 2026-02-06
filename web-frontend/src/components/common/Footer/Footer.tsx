import { Leaf, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="text-cyan-500" />
            <span className="text-2xl font-bold text-white">KCEM</span>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Empowering Kigali's HORECA industry through digital circular economy solutions.
          </p>
          <div className="flex gap-4">
            <Instagram size={20} className="hover:text-cyan-500 cursor-pointer transition-colors" />
            <Twitter size={20} className="hover:text-cyan-500 cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm">
            <li className="hover:text-cyan-400 cursor-pointer">Marketplace</li>
            <li className="hover:text-cyan-400 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-cyan-400 cursor-pointer">Terms of Service</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3"><Mail size={16} /> contact@kcem.rw</li>
            <li className="flex items-center gap-3"><Phone size={16} /> +250 780 162 164</li>
            <li className="flex items-center gap-3"><MapPin size={16} /> Kigali, Rwanda</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Monetize Your Waste</h4>
          <p className="text-xs mb-4">Subscribe for market price updates on UCO and recyclables.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="bg-slate-800 border-none rounded-lg px-4 py-2 w-full text-sm outline-none focus:ring-1 focus:ring-cyan-500" />
            <button className="bg-cyan-600 p-2 rounded-lg text-white hover:bg-cyan-500 transition-colors"><Mail size={18}/></button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-10 text-center text-xs opacity-50">
        &copy; {new Date().getFullYear()} Kigali Circular Economy Marketplace (KCEM). All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;