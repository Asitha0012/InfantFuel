import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetVaccinationsQuery, useCreateVaccinationMutation } from "../redux/api/vaccinations";
import { useGetParentsQuery } from "../redux/api/users";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Syringe } from "lucide-react";

export default function Health() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // Get connected parents for healthcare providers
  const { data: connectedParents = [] } = useGetParentsQuery(undefined, {
    skip: !userInfo || userInfo.userType !== "healthcareProvider"
  });

  const [vaccinations, setVaccinations] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [form, setForm] = useState({
    parentId: "",
    parentName: "",
    childName: "",
    vaccineName: "",
    customVaccine: "",
    date: "",
    notes: "",
  });

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

  // Server-backed vaccinations - skip if not authenticated
  const { data: serverVaccinations = [], isLoading, isError, refetch } = useGetVaccinationsQuery(undefined, {
    skip: !userInfo
  });
  const [createVaccination, { isLoading: isCreating }] = useCreateVaccinationMutation();

  useEffect(() => {
    setVaccinations(serverVaccinations || []);
  }, [serverVaccinations]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (viewMode === "nurse" && (!form.parentId || !form.childName)) {
      alert("Please select a parent and ensure child name is available");
      return;
    }

    const vaccine = form.vaccineName === "Other" ? form.customVaccine : form.vaccineName;

    const record = {
      parentId: viewMode === "nurse" ? form.parentId : userInfo._id,
      parentName: viewMode === "nurse" ? form.parentName : userInfo.fullName,
      childName: form.childName,
      vaccineName: vaccine,
      date: form.date,
      notes: form.notes || "",
      createdBy: userInfo._id,
    };

    // basic duplicate check against currently loaded records
    const isDuplicate = vaccinations.some((v) =>
      v.childName === record.childName &&
      v.vaccineName === record.vaccineName &&
      new Date(v.date).toISOString() === new Date(record.date).toISOString()
    );

    if (isDuplicate) {
      alert("Duplicate record for this child, vaccine, and date.");
      return;
    }

    try {
      const response = await createVaccination(record).unwrap();
      if (response) {
        alert("Vaccination record saved successfully!");
        // refetch to update local list
        refetch();
        setForm({
          parentId: "",
          parentName: "",
          childName: "",
          vaccineName: "",
          customVaccine: "",
          date: "",
          notes: ""
        });
      }
    } catch (err) {
      console.error('Error saving vaccination record:', err);
      alert(err?.data?.message || "Failed to save record. Please check all fields and try again.");
    }
  };

  // Decide viewMode from userType directly
  const viewMode = userInfo?.userType === "healthcareProvider" ? "nurse" : "parent";

  // Filter vaccinations based on view mode and user
  const filteredVaccinations = vaccinations.filter(v => {
    if (viewMode === "parent") {
      return v.parentId === userInfo._id;
    }
    return true; // Show all vaccinations for healthcare providers
  });

  return (
    <>
      <Navbar />
      <div className="bg-purple-50 p-6 rounded-xl max-w-3xl mx-auto mt-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-purple-800 flex items-center gap-2">
            <Syringe className="text-purple-600" />
            {viewMode === "nurse" ? "Record Child Vaccination" : "Parent View"}
          </h2>
        </div>

        {/* Healthcare Provider Form */}
        {viewMode === "nurse" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Parent Selection */}
            <div>
              <label className="block text-sm text-purple-700 font-medium mb-1">
                Select Parent
              </label>
              <select
                name="parentId"
                value={form.parentId}
                onChange={(e) => {
                  const parent = connectedParents.find(p => p._id === e.target.value);
                  setForm({
                    ...form,
                    parentId: e.target.value,
                    parentName: parent ? parent.fullName : "",
                    childName: parent?.babyDetails?.fullName || ""
                  });
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Select a parent --</option>
                {connectedParents.map((parent) => (
                  <option key={parent._id} value={parent._id}>
                    {parent.fullName} - {parent.babyDetails?.fullName || "No child name"}
                  </option>
                ))}
              </select>
            </div>

            {/* Child Name Display */}
            {form.childName && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Child Name: <span className="font-medium">{form.childName}</span></p>
              </div>
            )}

            {/* Vaccine Selection */}
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

            {/* Date Selection */}
            <div>
              <label className="block text-sm text-purple-700 font-medium mb-1">
                Vaccination Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm text-purple-700 font-medium mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Additional Notes (optional)"
                className="w-full p-2 border rounded h-24"
              />
            </div>

            <button
              type="submit"
              disabled={!form.parentId || !form.childName}
              className={`w-full px-4 py-2 rounded text-white ${
                !form.parentId || !form.childName
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Save Vaccination Record
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
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading vaccination records...</p>
            </div>
          ) : vaccinations.length > 0 ? (
            <div className="space-y-6">
              {viewMode === "nurse" ? (
                // Healthcare provider view - grouped by parent/child
                Object.values(
                  vaccinations.reduce((acc, vax) => {
                    const key = `${vax.parentId}-${vax.childName}`;
                    if (!acc[key]) {
                      acc[key] = {
                        parentName: vax.parentName,
                        childName: vax.childName,
                        records: []
                      };
                    }
                    acc[key].records.push(vax);
                    return acc;
                  }, {})
                ).map((group, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                    <h4 className="text-purple-800 font-medium mb-3">
                      {group.parentName} - {group.childName}
                    </h4>
                    <div className="space-y-3">
                      {group.records
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((vax, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="grid grid-cols-2 gap-4">
                              <p className="text-sm">
                                <span className="text-gray-600">Vaccine:</span>{" "}
                                <span className="font-medium">{vax.vaccineName}</span>
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Date:</span>{" "}
                                <span className="font-medium">
                                  {new Date(vax.date).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                            {vax.notes && (
                              <p className="text-sm mt-2">
                                <span className="text-gray-600">Notes:</span>{" "}
                                {vax.notes}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                // Parent view - only their records, sorted by date
                <div className="space-y-3">
                  {vaccinations
                    .filter(v => v.parentId === userInfo._id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((vax, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-purple-100"
                      >
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <p>
                            <span className="text-gray-600">Vaccine:</span>{" "}
                            <span className="font-medium">{vax.vaccineName}</span>
                          </p>
                          <p>
                            <span className="text-gray-600">Date:</span>{" "}
                            <span className="font-medium">
                              {new Date(vax.date).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        {vax.notes && (
                          <p className="text-sm mt-2 text-gray-600">
                            <span className="font-medium">Notes:</span> {vax.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {viewMode === "nurse" 
                  ? "No vaccination records found. Add records for connected parents using the form above."
                  : "No vaccination records found. Your healthcare provider will add records during visits."
                }
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}