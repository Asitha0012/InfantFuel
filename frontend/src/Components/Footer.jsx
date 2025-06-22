import { Link } from 'react-router-dom';
import Image from '../Assets/InfantFuel logo-01.png';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-200 via-white to-orange-100 text-gray-700 text-sm pt-10 pb-4 mt-10 border-t border-purple-200 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left: Logo & Brand */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <Link to="/">
            <img src={Image} alt="InfantFuel Logo" className="h-16 w-auto rounded-xl shadow-md" />
          </Link>
          <div className="text-center md:text-left">
            <p className="font-bold text-xl text-purple-700 tracking-tight">InfantFuel</p>
            <p className="text-gray-600 text-sm">Infant Growth & Nutritional Wellness Tracker</p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-5 text-base font-medium">
            <Link to="/about" className="hover:text-purple-700 transition">About Us</Link>
            <Link to="/contact" className="hover:text-purple-700 transition">Contact Us</Link>
            <Link to="/termsandconditions" className="hover:text-purple-700 transition">Privacy Policy</Link>
            <Link to="/Network" className="hover:text-purple-700 transition">Help</Link>
            <Link to="/articles" className="hover:text-purple-700 transition">Articles</Link>
          </div>
          <div className="flex gap-4 mt-3">
            <a href="#" aria-label="Facebook" className="hover:text-blue-600 transition"><Facebook size={20} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-sky-500 transition"><Twitter size={20} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500 transition"><Instagram size={20} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-blue-800 transition"><Linkedin size={20} /></a>
          </div>
        </div>

        {/* Right: Contact Info */}
        <div className="text-center md:text-right space-y-2 text-sm">
          <p className="font-semibold text-gray-700">Contact</p>
          <p>345 Faulconer Drive, Suite 4<br />Charlottesville, VA 12345</p>
          <p>(123) 456-7890</p>
          <p className="text-purple-700 font-medium">InfantFuel@xyz.com</p>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        © 2024 - EE5206 Software Project. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;