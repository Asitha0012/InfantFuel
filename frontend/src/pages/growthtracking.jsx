import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Ruler } from "lucide-react";

const GrowthTracking = () => {
  const [childId, setChildId] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [history, setHistory] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!childId || !weight || !height) {
      alert("Please fill out all required fields.");
      return;
    }

    const newEntry = {
      childId,
      weight,
      height,
      bmi: calculateBMI(weight, height),
      date: new Date().toLocaleDateString(),
    };

    setHistory([...history, newEntry]);

    setChildId("");
    setWeight("");
    setHeight("");
  };

  const calculateBMI = (weight, height) => {
    const h = height / 100;
    return (weight / (h * h)).toFixed(2);
  };

  return (
    <>
      <Navbar />

      <div className="bg-blue-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-blue-900 flex items-center gap-2">
          <Ruler className="w-6 h-6" /> Add Growth Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Child ID"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Growth Data
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl max-w-3xl mx-auto mt-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Growth History
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => setShowTable(!showTable)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              {showTable ? "Hide Table" : "Show Table"}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500">No records available.</p>
        ) : showTable ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border">
              <thead>
                <tr className="bg-blue-100">
                  <th className="py-2 px-4 border">Date</th>
                  <th className="py-2 px-4 border">Child ID</th>
                  <th className="py-2 px-4 border">Weight (kg)</th>
                  <th className="py-2 px-4 border">Height (cm)</th>
                  <th className="py-2 px-4 border">BMI</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className="bg-blue-50">
                    <td className="py-2 px-4 border">{entry.date}</td>
                    <td className="py-2 px-4 border">{entry.childId}</td>
                    <td className="py-2 px-4 border">{entry.weight}</td>
                    <td className="py-2 px-4 border">{entry.height}</td>
                    <td className="py-2 px-4 border">{entry.bmi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((entry, index) => (
              <li
                key={index}
                className="border p-3 rounded-lg bg-blue-100 text-gray-700"
              >
                <p><strong>Date:</strong> {entry.date}</p>
                <p><strong>Child ID:</strong> {entry.childId}</p>
                <p><strong>Weight:</strong> {entry.weight} kg</p>
                <p><strong>Height:</strong> {entry.height} cm</p>
                <p><strong>BMI:</strong> {entry.bmi}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </>
  );
};

export default GrowthTracking;

