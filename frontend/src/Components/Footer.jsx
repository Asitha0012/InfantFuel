import { Link } from 'react-router-dom'; 
import Image from '../Assets/InfantFuel logo-01.png';

const Footer = () => {
  return (
    <footer className="bg-purple-100 text-gray-700 text-sm py-10 mt-10">
      <div className="max-w-7xl mx-auto px-10 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4">
          <Link to="/"> 
            <img src={Image} alt="InfantFuel Logo" className="h-20 w-25" />
          </Link>
          <div className="text-left">
            <p className="font-semibold text-lg">InfantFuel</p>
            <p className="text-gray-600">Infant Growth and Nutritional Wellness Tracker</p>
          </div>
        </div>

        {/* Center: Links */}
        <div className="text-center flex flex-col justify-center">
          <div className="flex justify-center flex-wrap gap-4">
            <a href="/about" className="hover:underline">About Us</a>
            <a href="/contact" className="hover:underline">Contact Us</a>
            <a href="/termsandconditions" className="hover:underline">Privacy Policy</a>
            <a href="/Network" className="hover:underline">Help</a>
            <a href="/articles" className="hover:underline">Articles</a>
          </div>
          <p className="text-xs text-gray-500 mt-4">© 2024 - EE5206 Software Project</p>
        </div>

        {/* Right: Address */}
        <div className="text-right space-y-2">
          <p>345 Faulconer Drive, Suite 4<br />Charlottesville, VA 12345</p>
          <p>(123) 456-7890</p>
          <p>InfantFuel@xyz.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;