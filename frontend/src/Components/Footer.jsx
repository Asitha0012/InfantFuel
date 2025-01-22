const Footer = () => {
  return (
    <footer className="bg-indigo-500 text-white py-6 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <img
            src="assets/InfantFuel logo-02.png"
            alt="InfantFuel Logo"
            className="w-40 h-40"
          />
          <div>
            <h2 className="text-lg font-semibold">InfantFuel</h2>
            <p className="text-sm">Infant Growth and Nutritional Wellness Tracker</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="text-sm mt-4 md:mt-0 text-center md:text-left">
          <p><i className="fas fa-map-marker-alt mr-2"></i> 345 Faulconer Drive, Suite 4, Charlottesville, VA 12345</p>
          <p><i className="fas fa-phone mr-2"></i> (123) 456-7890</p>
          <p><i className="fas fa-envelope mr-2"></i> InfantFuel@xyz.com</p>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-indigo-200 transition-colors">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="#" className="hover:text-indigo-200 transition-colors">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-indigo-200 transition-colors">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href="#" className="hover:text-indigo-200 transition-colors">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>

      {/* Footer Bottom Links */}
      <div className="border-t border-purple-500 mt-6 pt-4 text-center text-sm">
        <div className="space-x-4">
          <a href="/about" className="hover:text-indigo-200 transition-colors">About Us</a>
          <a href="/contact" className="hover:text-indigo-200 transition-colors">Contact Us</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">Help</a>
          <a href="#" className="hover:text-indigo-200 transition-colors">Articles</a>
        </div>
        <p className="mt-4">© 2024 - EE5206 Software Project</p>
      </div>
    </footer>
  );
};
export default Footer;