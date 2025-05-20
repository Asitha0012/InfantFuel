import { useState, useEffect, useMemo } from "react";
import { Bell, User } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { apiSlice } from "../redux/api/apiSlice";
import { useLogoutMutation } from "../redux/api/users";

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const tabs = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Tracker", path: "/tracker" },
      { name: "About", path: "/about" },
      { name: "Network", path: "/Network" },
      { name: "Terms & Condition", path: "/termsandconditions" },
      { name: "Contact us", path: "/contact" },
    ],
    []
  );

  // Get initial tab based on current route
  const getInitialTab = () => {
    let matchedTab = tabs
      .filter(tab =>
        tab.path === "/"
          ? location.pathname === "/"
          : location.pathname.toLowerCase().startsWith(tab.path.toLowerCase())
      )
      .sort((a, b) => b.path.length - a.path.length)[0];
    if (matchedTab) return matchedTab.name;
    if (location.pathname === "/profile") return "Profile";
    if (location.pathname === "/notifications") return "Notifications";
    return "Home";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Find the best matching tab for the current path (longest path match)
    let matchedTab = tabs
      .filter(tab =>
        tab.path === "/"
          ? location.pathname === "/"
          : location.pathname.toLowerCase().startsWith(tab.path.toLowerCase())
      )
      .sort((a, b) => b.path.length - a.path.length)[0];
    if (matchedTab) {
      setActiveTab(matchedTab.name);
    } else if (location.pathname === "/profile") {
      setActiveTab("Profile");
    } else if (location.pathname === "/notifications") {
      setActiveTab("Notifications");
    }
  }, [location.pathname, tabs]);

  const handleTabClick = (tab) => {
    // If unauthenticated and tab is Tracker or Network, show auth prompt
    if (
      !userInfo &&
      (tab.name === "Tracker" || tab.name === "Network")
    ) {
      setShowAuthPrompt(true);
      return;
    }
    // Do NOT setActiveTab here, let useEffect handle it after navigation
    navigate(tab.path);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logoutApi().unwrap();
    } catch {
      // Optionally handle error
    }
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
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
              className={`tab-highlight px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === tab.name
                  ? "text-white bg-orange-400 rounded-md"
                  : "text-gray-700"
              } hover:border-b-2 hover:border-orange-400 transition-colors duration-200`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Right-Side Actions */}
        <div className="flex items-center space-x-4 relative">
          {!userInfo ? (
            <>
              {/* Login and Sign Up Buttons */}
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-orange-400 hover:text-white"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-orange-400 hover:text-white"
              >
                SIGN UP
              </button>
            </>
          ) : (
            <>
              <button
                className={`px-5 py-4 text-sm font-medium ${
                  activeTab === "Notifications"
                    ? "text-white bg-orange-400 rounded-md"
                    : "text-gray-700 hover:bg-orange-100 hover:rounded-md hover:text-gray-900"
                }`}
                onClick={() => {
                  navigate("/notifications");
                }}
              >
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  className={`px-5 py-4 text-sm font-medium ${
                    activeTab === "Profile"
                      ? "text-white bg-orange-400 rounded-md"
                      : "text-gray-700 hover:bg-orange-100 hover:rounded-md hover:text-gray-900"
                  }`}
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  <User className="h-5 w-5" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg">
                    <ul className="py-2">
                      <li
                        onClick={handleProfileClick}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Profile
                      </li>
                      <li
                        onClick={() => setShowLogoutModal(true)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Login or Sign Up Required
            </h3>
            <p className="mb-6 text-gray-600">
              You have to log in or sign up first to access this feature.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setShowAuthPrompt(false);
                  navigate("/signin");
                }}
              >
                Sign Up
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowAuthPrompt(false)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;