import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Baby } from "lucide-react";

export default function Breastfeeding() {
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    time: "",
    duration: "",
    side: "left",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent zero or negative durations
    if (Number(formData.duration) <= 0) {
      alert("Duration must be greater than 0 minutes.");
      return;
    }

    setSessions([...sessions, formData]);
    setFormData({ time: "", duration: "", side: "left" });
  };

  return (
    <>
      <Navbar />
      <div className="bg-purple-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-md">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <Baby className="text-purple-600" />
          Breastfeeding Tracker
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="datetime-local"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Side</label>
            <select
              name="side"
              value={formData.side}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="both">Both</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Add Session
          </button>
        </form>

        {sessions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Logged Sessions</h3>
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-purple-100 text-gray-700">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Duration (min)</th>
                  <th className="p-2">Side</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{new Date(session.time).toLocaleString()}</td>
                    <td className="p-2">{session.duration}</td>
                    <td className="p-2 capitalize">{session.side}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}


