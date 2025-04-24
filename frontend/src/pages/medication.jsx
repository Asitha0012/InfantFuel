import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Syringe, Pill } from "lucide-react";

export default function Health() {
  const [childId, setChildId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [dose, setDose] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);

  const handleAddMedicine = (e) => {
    e.preventDefault();

    if (!childId || !medicineName || !dose || !date) {
      alert("Please fill out all required fields.");
      return;
    }

    const newEntry = {
      childId,
      medicineName,
      dose,
      date,
      note,
    };

    setHistory([...history, newEntry]);

    // Clear form
    setMedicineName("");
    setDose("");
    setDate("");
    setNote("");
  };

  return (
    <>
      <Navbar />
      <div className="bg-purple-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-purple-900 flex items-center gap-2">
          <Pill className="w-6 h-6" /> Add Medicine Details
        </h2>

        <form onSubmit={handleAddMedicine} className="space-y-4">
          <input
            type="text"
            placeholder="Child ID"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Medicine Name"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Dose (e.g., 5ml)"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Additional Notes (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg resize-none"
            rows="3"
          />

          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Add Medicine
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl max-w-3xl mx-auto mt-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Syringe className="w-5 h-5" /> Medicine History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500">No records available.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((entry, index) => (
              <li
                key={index}
                className="border p-3 rounded-lg bg-purple-100 text-gray-700"
              >
                <p><strong>Child ID:</strong> {entry.childId}</p>
                <p><strong>Medicine:</strong> {entry.medicineName}</p>
                <p><strong>Dose:</strong> {entry.dose}</p>
                <p><strong>Date:</strong> {entry.date}</p>
                {entry.note && <p><strong>Note:</strong> {entry.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Footer />
    </>
  );
}






