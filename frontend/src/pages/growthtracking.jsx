import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GrowthTracking = () => {
  const [babyData, setBabyData] = useState({
    name: "",
    weight: "",
    height: "",
  });

  const [history, setHistory] = useState([]);
  const [showCharts, setShowCharts] = useState(false); // Toggle for charts

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBabyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (babyData.name && babyData.weight && babyData.height) {
      setHistory((prev) => [
        ...prev,
        {
          ...babyData,
          bmi: calculateBMI(babyData.weight, babyData.height),
          date: new Date().toLocaleDateString(),
        },
      ]);
      setBabyData({ name: "", weight: "", height: "" });
    }
  };

  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  };

  const weightChartData = {
    labels: history.map((entry) => entry.date),
    datasets: [
      {
        label: "Weight (kg)",
        data: history.map((entry) => entry.weight),
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const heightChartData = {
    labels: history.map((entry) => entry.date),
    datasets: [
      {
        label: "Height (cm)",
        data: history.map((entry) => entry.height),
        fill: false,
        borderColor: "rgb(54, 162, 235)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow px-6 py-12 md:px-16 lg:px-32">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">
            Growth Tracking
          </h1>

          {/* Baby Data Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Baby Name"
                value={babyData.name}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-4 py-2"
                required
              />
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={babyData.weight}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-4 py-2"
                required
              />
              <input
                type="number"
                name="height"
                placeholder="Height (cm)"
                value={babyData.height}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md px-4 py-2"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Baby Data
            </button>
          </form>

          {/* Table */}
          {history.length > 0 && (
            <>
              <table className="w-full table-auto border border-gray-300 text-left mb-6">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Baby Name</th>
                    <th className="px-4 py-2">Weight (kg)</th>
                    <th className="px-4 py-2">Height (cm)</th>
                    <th className="px-4 py-2">BMI</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{entry.date}</td>
                      <td className="px-4 py-2">{entry.name}</td>
                      <td className="px-4 py-2">{entry.weight}</td>
                      <td className="px-4 py-2">{entry.height}</td>
                      <td className="px-4 py-2">{entry.bmi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Toggle Charts Button */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  {showCharts ? "Hide Charts" : "Show Charts"}
                </button>
              </div>
            </>
          )}

          {/* Charts */}
          {showCharts && history.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Weight Growth Chart
              </h2>
              <Line data={weightChartData} />

              <h2 className="text-xl font-semibold mt-8 mb-4 text-center">
                Height Growth Chart
              </h2>
              <Line data={heightChartData} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GrowthTracking;
