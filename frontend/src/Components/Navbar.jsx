// src/components/Navbar.js
import{ useState } from "react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("Home");

  const tabs = [
    { name: "Home" },
    { name: "Tracker" },
    { name: "About" },
    { name: "Support" },
    { name: "Terms & Condition" },
    { name: "Contact us" },
  ];

  return (
    <nav className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="InfantFuel Logo" className="h-10 w-auto" />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`px-3 py-2 text-sm font-medium ${
                activeTab === tab.name
                  ? "text-white bg-orange-300 rounded-md"
                  : "text-gray-700 hover:bg-orange-100 hover:rounded-md hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Right-Side Actions */}
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-orange-300 hover:text-gray-900">
            LOGIN
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-orange-300 hover:text-gray-900">
            SIGN UP
          </button>
          <div className="flex items-center space-x-2">
            <button className="text-gray-700 hover:text-gray-900">
              <span className="material-icons">notifications</span>
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <span className="material-icons">person</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex flex-col space-y-2 px-4 py-2 border-t border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`block text-left px-3 py-2 text-sm font-medium ${
              activeTab === tab.name
                ? "text-white bg-orange-200 rounded-md"
                : "text-gray-700 hover:bg-orange-100 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
