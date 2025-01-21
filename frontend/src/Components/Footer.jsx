import React from "react";

const Footer = () => {
  return (
    <footer className="bg-purple-500 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center mb-6 lg:mb-0">
          <img
            src="/logo-placeholder.png" // Replace with the actual path to your logo
            alt="InfantFuel Logo"
            className="h-16 w-16 rounded-full mr-4"
          />
          <div>
            <h2 className="text-xl font-semibold">InfantFuel</h2>
            <p className="text-sm">Infant Growth and Nutritional Wellness Tracker</p>
          </div>
        </div>

        {/* Middle Section */}
        <div className="text-center lg:text-left mb-6 lg:mb-0">
          <p className="text-sm">
            <i className="fas fa-map-marker-alt mr-2"></i>
            345 Faulconer Drive, Suite 4, Charlottesville, CA, 12345
          </p>
          <p className="text-sm">
            <i className="fas fa-phone-alt mr-2"></i>
            (123) 456-7890
          </p>
          <p className="text-sm">
            <i className="fas fa-envelope mr-2"></i>
            InfantFuel@gmail.com
          </p>
        </div>

        {/* Right Section: Social Media */}
        <div className="text-center lg:text-left">
          <p className="mb-2">Social Media</p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <a href="#" className="hover:text-gray-300">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-gray-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-gray-300">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="hover:text-gray-300">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white mt-6 pt-4">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between text-center lg:text-left">
          <div className="mb-4 lg:mb-0">
            <a href="#" className="text-sm hover:underline">About Us</a> |{" "}
            <a href="#" className="text-sm hover:underline">Contact Us</a> |{" "}
            <a href="#" className="text-sm hover:underline">Help</a> |{" "}
            <a href="#" className="text-sm hover:underline">Privacy Policy</a> |{" "}
            <a href="#" className="text-sm hover:underline">Disclaimer</a> |{" "}
            <a href="#" className="text-sm hover:underline">Articles</a>
          </div>
          <p className="text-sm">
            Copyright © 2024 • EES206 Software Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
