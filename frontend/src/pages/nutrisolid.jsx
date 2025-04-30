import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { UtensilsCrossed } from "lucide-react";

const foodOptions = [
  "Mashed Banana",
  "Boiled Carrot",
  "Rice Porridge",
  "Pumpkin Puree",
  "Apple Sauce",
  "Oatmeal",
  "Boiled Egg Yolk",
  "Other (Type Manually)"
];

export default function SolidNutrition() {
  const [formData, setFormData] = useState({
    time: "",
    food: "",
    amount: "",
    unit: "g", // Default unit is grams
    notes: "",
  });
  const [entries, setEntries] = useState([]);
  const [selectedFood, setSelectedFood] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (e) => {
    const selected = e.target.value;
    setSelectedFood(selected);
    if (selected !== "Other (Type Manually)") {
      setFormData({ ...formData, food: selected });
    } else {
      setFormData({ ...formData, food: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.food || Number(formData.amount) <= 0) {
      alert("Please provide valid food and amount.");
      return;
    }
    setEntries([...entries, formData]);
    setFormData({ time: "", food: "", amount: "", unit: "g", notes: "" });
    setSelectedFood("");
  };

  return (
    <>
      <Navbar />
      <div className="bg-purple-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-md">
        <h2 className="text-2xl font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <UtensilsCrossed className="text-purple-600" />
          Solid Nutrition Intake Tracker
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
            <label className="block text-sm font-medium text-gray-700">Select Food</label>
            <select
              value={selectedFood}
              onChange={handleSelect}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Choose Food --</option>
              {foodOptions.map((food, idx) => (
                <option key={idx} value={food}>{food}</option>
              ))}
            </select>
          </div>

          {selectedFood === "Other (Type Manually)" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Enter Food Name</label>
              <input
                type="text"
                name="food"
                value={formData.food}
                onChange={handleChange}
                placeholder="E.g., Sweet Potato Mash"
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                required
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="mt-1 p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="g">grams</option>
                <option value="tbsp">tablespoons</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any observations, reactions..."
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Add Entry
          </button>
        </form>

        {entries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">Logged Entries</h3>
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-purple-100 text-gray-700">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Food</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{new Date(entry.time).toLocaleString()}</td>
                    <td className="p-2">{entry.food}</td>
                    <td className="p-2">
                      {entry.amount} {entry.unit}
                    </td>
                    <td className="p-2">{entry.notes || "-"}</td>
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




