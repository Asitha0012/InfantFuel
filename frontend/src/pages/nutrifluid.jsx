import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Droplet } from "lucide-react";

export default function FluidIntake() {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    time: "",
    type: "milk",
    amount: "",
    unit: "ml", // default unit
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amountValue = Number(formData.amount);
    if (amountValue <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }

    const amountMl = formData.unit === "teaspoon" ? amountValue * 5 : amountValue;

    const newEntry = {
      time: formData.time,
      type: formData.type,
      amountInput: amountValue,
      unit: formData.unit,
      amountMl,
    };

    setEntries([...entries, newEntry]);
    setFormData({ time: "", type: "milk", amount: "", unit: "ml" });
  };

  return (
    <>
      <Navbar />
      <div className="bg-blue-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-md">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Droplet className="text-blue-600" />
          Fluid Intake Tracker
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
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fluid Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="milk">Milk</option>
              <option value="water">Water</option>
              <option value="juice">Juice</option>
              <option value="formula">Formula</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                required
                className="block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ml">ml</option>
                <option value="teaspoon">teaspoon</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Entry
          </button>
        </form>

        {entries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Logged Fluid Intake</h3>
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Entered</th>
                  <th className="p-2">Converted (ml)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{new Date(entry.time).toLocaleString()}</td>
                    <td className="p-2 capitalize">{entry.type}</td>
                    <td className="p-2">
                      {entry.amountInput} {entry.unit}
                    </td>
                    <td className="p-2">{entry.amountMl} ml</td>
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


