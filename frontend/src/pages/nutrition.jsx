import React, { useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Baby } from "lucide-react";

export default function Breastfeeding() {
  const { userInfo } = useSelector((state) => state.auth); // Get logged in user info
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

    if (Number(formData.duration) <= 0) {
      alert("Duration must be greater than 0 minutes.");
      return;
    }

    // Add the new session to the sessions array
    setSessions([...sessions, { ...formData, comments: [] }]);
    setFormData({ time: "", duration: "", side: "left" });
  };

  // Function for doctors/providers to add comments
  const addComment = (index, commentText) => {
    if (!commentText.trim()) return;

    const updatedSessions = [...sessions];
    updatedSessions[index].comments.push({
      doctor: userInfo?.name || "Doctor",
      text: commentText,
      date: new Date().toLocaleString(),
    });

    setSessions(updatedSessions);
  };

  return (
    <>
      <Navbar />
      <div className="bg-purple-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-md">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <Baby className="text-purple-600" />
          Breastfeeding Tracker
        </h2>

        {/* Parent can add sessions */}
        {userInfo?.role === "parent" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
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
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1" // Changed to 1 to prevent zero or negative values
                required
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Side
              </label>
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
        )}

        {/* Session List */}
        {sessions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              Logged Sessions
            </h3>
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-purple-100 text-gray-700">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Duration (min)</th>
                  <th className="p-2">Side</th>
                  <th className="p-2">Doctor Comments</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index} className="border-b align-top">
                    <td className="p-2">
                      {new Date(session.time).toLocaleString()}
                    </td>
                    <td className="p-2">{session.duration}</td>
                    <td className="p-2 capitalize">{session.side}</td>
                    <td className="p-2">
                      {/* List comments */}
                      {session.comments?.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {session.comments.map((c, i) => (
                            <li key={i}>
                              <span className="font-medium">{c.doctor}:</span>{" "}
                              {c.text}{" "}
                              <span className="text-xs text-gray-400">
                                ({c.date})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No comments</span>
                      )}

                      {/* Only providers/doctors can add comments */}
                      {userInfo?.role === "provider" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Add suggestion..."
                            className="border p-1 rounded w-full mb-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addComment(index, e.target.value);
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                      )}
                    </td>
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
