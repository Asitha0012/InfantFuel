import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Syringe } from "lucide-react";

export default function Health() {
  const [vaccinations, setVaccinations] = useState([]);
  const [form, setForm] = useState({
    childName: "",
    vaccineName: "",
    customVaccine: "",
    date: "",
    notes: "",
  });
  const [viewMode, setViewMode] = useState("nurse"); // 'nurse' or 'parent'

  const vaccineList = [
    "BCG",
    "Hepatitis B",
    "Polio",
    "Pentavalent",
    "MMR",
    "DTP",
    "Rotavirus",
    "COVID-19",
  ];

  useEffect(() => {
    const savedData = localStorage.getItem("vaccinationData");
    if (savedData) {
      setVaccinations(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("vaccinationData", JSON.stringify(vaccinations));
  }, [vaccinations]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const vaccine =
      form.vaccineName === "Other" ? form.customVaccine : form.vaccineName;

    const record = {
      childName: form.childName,
      vaccineName: vaccine,
      date: form.date,
      notes: form.notes,
    };

    const isDuplicate = vaccinations.some(
      (v) =>
        v.childName === record.childName &&
        v.vaccineName === record.vaccineName &&
        v.date === record.date
    );

    if (isDuplicate) {
      alert("Duplicate record for this child, vaccine, and date.");
      return;
    }

    setVaccinations([...vaccinations, record]);
    setForm({
      childName: "",
      vaccineName: "",
      customVaccine: "",
      date: "",
      notes: "",
    });
  };

  const filteredVaccinations =
    viewMode === "parent"
      ? vaccinations.filter(
          (v) => v.childName.toLowerCase() === form.childName.toLowerCase()
        )
      : vaccinations;

  return (
    <>
      <Navbar />
      <div className="bg-purple-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-purple-800 flex items-center gap-2">
            <Syringe className="text-purple-600" />
            {viewMode === "nurse" ? "Record Child Vaccination" : "Parent View"}
          </h2>
          <button
            className="text-sm text-purple-600 underline"
            onClick={() =>
              setViewMode(viewMode === "nurse" ? "parent" : "nurse")
            }
          >
            Switch to {viewMode === "nurse" ? "Parent" : "Nurse"} Mode
          </button>
        </div>

        {/* Nurse Form */}
        {viewMode === "nurse" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="childName"
              value={form.childName}
              onChange={handleChange}
              placeholder="Child Name"
              className="w-full p-2 border rounded"
              required
            />

            <div>
              <label className="block text-sm text-purple-700 font-medium mb-1">
                Select Vaccine
              </label>
              <select
                name="vaccineName"
                value={form.vaccineName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Select a vaccine --</option>
                {vaccineList.map((vaccine, idx) => (
                  <option key={idx} value={vaccine}>
                    {vaccine}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>

              {form.vaccineName === "Other" && (
                <input
                  type="text"
                  name="customVaccine"
                  value={form.customVaccine}
                  onChange={handleChange}
                  placeholder="Enter custom vaccine name"
                  className="w-full mt-2 p-2 border rounded"
                  required
                />
              )}
            </div>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional Notes (optional)"
              className="w-full p-2 border rounded"
            />

            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Save Record
            </button>
          </form>
        )}

        {/* Parent View Input */}
        {viewMode === "parent" && (
          <div className="mb-6">
            <input
              type="text"
              name="childName"
              value={form.childName}
              onChange={handleChange}
              placeholder="Enter your child’s name"
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* Vaccination History */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Vaccination History</h3>
          {filteredVaccinations.length > 0 ? (
            <ul className="space-y-3">
              {filteredVaccinations.map((vax, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded shadow-sm border border-gray-200"
                >
                  <p>
                    <strong>Child:</strong> {vax.childName}
                  </p>
                  <p>
                    <strong>Vaccine:</strong> {vax.vaccineName}
                  </p>
                  <p>
                    <strong>Date:</strong> {vax.date}
                  </p>
                  {vax.notes && (
                    <p>
                      <strong>Notes:</strong> {vax.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No vaccination records found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}






