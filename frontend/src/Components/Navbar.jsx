import { useState, useEffect, useMemo } from "react";
import { Bell, User } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("Home");

  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(() => [
    { name: "Home", path: "/" },
    { name: "Tracker", path: "/tracker" },
    { name: "About", path: "/about" },
    { name: "Support", path: "/Support" },
    { name: "Terms & Condition", path: "/termsandconditions" },
    { name: "Contact us", path: "/contact" },
  ], []);

  useEffect(() => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    if (currentTab) {
      setActiveTab(currentTab.name);
    } else if (location.pathname === '/profile') {
      setActiveTab("Profile"); // Handle Profile explicitly
    } else if (location.pathname === '/notifications') {
      setActiveTab("Notifications"); // Handle Notifications explicitly
    }
  }, [location.pathname, tabs]);

  const handleTabClick = (tab) => {
    setActiveTab(tab.name);
    navigate(tab.path);
  };

  return (
    <nav className="bg-white border-b-4 border-orange-300 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="InfantFuel Logo" className="h-14 w-auto" />
        </div>
        {/* Tabs */}
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === tab.name ? "text-white bg-orange-400 rounded-md" : "text-gray-700"
              } hover:border-b-2 hover:border-orange-400`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Right-Side Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')} 
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-orange-400 hover:text-white">
            LOGIN
          </button>
          <button onClick={() => navigate('/signin')} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-orange-400 hover:text-white">
            SIGN UP
          </button>
          <button
            className={`px-5 py-4 text-sm font-medium ${
              activeTab === "Notifications"
                ? "text-white bg-orange-400 rounded-md"
                : "text-gray-700 hover:bg-orange-100 hover:rounded-md hover:text-gray-900"
            }`}
            onClick={() => {
              setActiveTab("Notifications"); // Set activeTab to "Notifications"
            }}
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            className={`px-5 py-4 text-sm font-medium ${
              activeTab === "Profile"
                ? "text-white bg-orange-400 rounded-md"
                : "text-gray-700 hover:bg-orange-100 hover:rounded-md hover:text-gray-900"
            }`}
            onClick={() => {
              setActiveTab("Profile"); // Set activeTab to "Profile"
              navigate('/profile'); // Navigate to Profile page
            }}
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex flex-col space-y-2 px-4 py-2 border-t border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`block text-left px-3 py-2 text-sm font-medium ${
              activeTab === tab.name
                ? "text-white bg-orange-400 rounded-md"
                : "text-gray-700 hover:bg-orange-100 hover:text-gray-900"
            }`}
            onClick={() => {
              setActiveTab(tab.name);
              navigate(tab.path);
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
