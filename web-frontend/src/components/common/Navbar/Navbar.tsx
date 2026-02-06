import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, X} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-cyan-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-cyan-900 tracking-tight">KCEM</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link to="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-cyan-600 transition-colors">About</Link>
            <Link to="/services" className="hover:text-cyan-600 transition-colors">Services</Link>
            <Link to="/marketplace" className="hover:text-cyan-600 transition-colors">Marketplace</Link>
            <Link to="/updates" className="hover:text-cyan-600 transition-colors">Updates</Link>
            <Link to="/blog" className="hover:text-cyan-600 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-cyan-600 transition-colors">Contact</Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <Link to="/login" className="hover:text-cyan-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-cyan-600 text-white px-6 py-2.5 rounded-full hover:bg-cyan-700 transition-all -md -cyan-200">
              Join Platform
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-cyan-100 p-6 space-y-4 flex flex-col animate-in slide-in-from-top duration-300">
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/services" onClick={() => setIsOpen(false)}>Services</Link>
          <Link to="/marketplace" onClick={() => setIsOpen(false)}>Marketplace</Link>
          <Link to="/updates" onClick={() => setIsOpen(false)}>Updates</Link>
          <Link to="/blog" onClick={() => setIsOpen(false)}>Blog</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          <Link to="/login" className="font-bold text-cyan-600">Login</Link>
          <Link to="/register" className="bg-cyan-600 text-white text-center py-3 rounded-xl">Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;