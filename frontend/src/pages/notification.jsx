import React from "react";
import { Bell } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Notification = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow px-6 py-10 md:px-16 lg:px-32">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-orange-500" />
            <h1 className="text-3xl font-bold text-orange-500">Notifications</h1>
          </div>

          {/* Sample Notifications */}
          <ul className="space-y-4 text-gray-700">
            <li className="bg-orange-50 p-4 rounded-lg shadow-sm">
              🍼 Your baby's growth tracker has been updated.
            </li>
            <li className="bg-orange-50 p-4 rounded-lg shadow-sm">
              📅 Reminder: Next health checkup is scheduled for April 12, 2025.
            </li>
            <li className="bg-orange-50 p-4 rounded-lg shadow-sm">
              💬 New message from your pediatrician.
            </li>
            {/* Add more dynamic notifications here */}
          </ul>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Notification;
