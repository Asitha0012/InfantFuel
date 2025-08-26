import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetmedicationsQuery, useCreatemedicationsMutation } from "../redux/api/medications";
import { useGetParentsQuery } from "../redux/api/users";
import { Pill, Calendar, User, FileText, Shield, Clock, CheckCircle } from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const ProfessionalMedicationUI = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // Get connected parents for healthcare providers
const { data: rawParents = [] } = useGetParentsQuery(undefined, {
  skip: !userInfo || userInfo.userType !== "healthcareProvider",
});

const connectedParents = rawParents.filter(parent => parent.userType === "parent");

  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    parentId: "",
    parentName: "",
    childName: "",
    medicationName: "",
    customMedication: "",
    dosage: "",
    frequency: "",
    date: "",
    notes: ""
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" }); // success | error

  const medicationList = [
    "Paracetamol (Acetaminophen)",
    "Ibuprofen",
    "Amoxicillin",
    "Azithromycin",
    "Cetirizine",
    "Loratadine",
    "Salbutamol",
    "Prednisolone",
    "Zinc Supplements",
    "Vitamin D3",
    "Iron Supplements",
    "ORS (Oral Rehydration Solution)"
  ];

  const frequencyOptions = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "As needed",
    "Before meals",
    "After meals"
  ];

  // Server-backed medications - skip if not authenticated
  const { data: serverMedications = [], isLoading, isError, refetch } = useGetmedicationsQuery(undefined, {
    skip: !userInfo
  });
  const [createMedication, { isLoading: isCreating }] = useCreatemedicationsMutation();

  useEffect(() => {
    setMedications(serverMedications || []);
  }, [serverMedications]);

  // Decide viewMode from userType directly
  const viewMode = userInfo?.userType === "healthcareProvider" ? "nurse" : "parent";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form submitted!"); // Check if function is called
  console.log("Form data:", form); // Check form values
  console.log("User info:", userInfo); // Check user authentication
  setFeedback({ type: "", message: "" });

  if (viewMode === "nurse" && (!form.parentId || !form.childName)) {
    console.log("Validation failed: missing parent or child");
    setFeedback({ type: "error", message: "Please select a parent and ensure child name is available." });
    return;
  }

  const medication = form.medicationName === "Other" ? form.customMedication : form.medicationName;
  
  const record = {
    parentId: viewMode === "nurse" ? form.parentId : userInfo._id,
    parentName: viewMode === "nurse" ? form.parentName : userInfo.fullName,
    childName: form.childName,
    medicationName: medication,
    dosage: form.dosage,
    frequency: form.frequency,
    date: form.date,
    notes: form.notes || "",
    createdBy: userInfo._id,
  };

  console.log("Record to save:", record); // Check final record

  try {
    console.log("Calling createMedication..."); // Check if API call starts
    const response = await createMedication(record).unwrap();
    console.log("API Response:", response); // Check server response
    
    if (response) {
      setFeedback({ type: "success", message: "Medication record saved successfully." });
      await refetch();
      setForm({
        parentId: "",
        parentName: "",
        childName: "",
        medicationName: "",
        customMedication: "",
        dosage: "",
        frequency: "",
        date: "",
        notes: ""
      });
    }
  } catch (err) {
    console.error('Full error object:', err); // Check complete error
    console.error('Error message:', err?.data?.message);
    console.error('Error status:', err?.status);
    setFeedback({ type: "error", message: err?.data?.message || "Failed to save record. Please check all fields and try again." });
  }
};

  // Filter medications based on view mode and user
  const filteredMedications = medications.filter(m => {
    if (viewMode === "parent") {
      return m.parentId === userInfo._id;
    }
    return true; // Show all medications for healthcare providers
  });

  // Calculate stats
  const totalRecords = medications.length;
  const connectedFamilies = connectedParents.length;
  const thisMonthRecords = medications.filter(m => {
    const medDate = new Date(m.date);
    const now = new Date();
    return medDate.getMonth() === now.getMonth() && medDate.getFullYear() === now.getFullYear();
  }).length;

  if (!userInfo) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medication Management</h1>
                <p className="text-sm text-gray-600">Professional healthcare system</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userInfo.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {viewMode === "nurse" ? "Healthcare Provider" : "Parent"}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {viewMode === "nurse" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Record New Medication</h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Parent Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <User className="h-4 w-4" />
                      <span>Select Parent</span>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Choose a parent from the list</option>
                      {connectedParents.map((parent) => (
                        <option key={parent._id} value={parent._id}>
                          {parent.fullName} - {parent.babyDetails?.fullName || "No child name"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Child Information Display */}
                  {form.childName && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Selected Child</span>
                      </div>
                      <p className="mt-1 text-blue-800 font-semibold">{form.childName}</p>
                    </div>
                  )}

                  {/* Medication Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Pill className="h-4 w-4" />
                      <span>Medication Type</span>
                    </label>
                    <select
                      name="medicationName"
                      value={form.medicationName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select medication from list</option>
                      {medicationList.map((medication, idx) => (
                        <option key={idx} value={medication}>
                          {medication}
                        </option>
                      ))}
                      <option value="Other">Other (specify below)</option>
                    </select>

                    {form.medicationName === "Other" && (
                      <input
                        type="text"
                        name="customMedication"
                        value={form.customMedication}
                        onChange={handleChange}
                        placeholder="Enter custom medication name"
                        className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    )}
                  </div>

                  {/* Dosage and Frequency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Shield className="h-4 w-4" />
                        <span>Dosage</span>
                      </label>
                      <input
                        type="text"
                        name="dosage"
                        value={form.dosage}
                        onChange={handleChange}
                        placeholder="e.g., 5ml, 250mg, 1 tablet"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4" />
                        <span>Frequency</span>
                      </label>
                      <select
                        name="frequency"
                        value={form.frequency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((freq, idx) => (
                          <option key={idx} value={freq}>
                            {freq}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>Prescribed Date</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>Clinical Notes</span>
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Enter prescription details, side effects to watch, duration, or additional notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!form.parentId || !form.childName || isCreating}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                      !form.parentId || !form.childName || isCreating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                    aria-busy={isCreating}
                  >
                    {isCreating ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                        Recording...
                      </span>
                    ) : (
                      "Record Medication"
                    )}
                  </button>

                  {feedback.message && (
                    <div
                      className={`mt-3 px-3 py-2 rounded text-sm ${
                        feedback.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {feedback.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === "parent" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Parent Dashboard</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Welcome, {userInfo.fullName}</span>
                    </div>
                    <p className="mt-1 text-green-800">Your medication records are managed by your healthcare provider and will appear below.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Records</span>
                  <span className="text-2xl font-bold text-indigo-600">{totalRecords}</span>
                </div>
                
                {viewMode === "nurse" && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Connected Families</span>
                    <span className="text-2xl font-bold text-green-600">{connectedFamilies}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-2xl font-bold text-blue-600">{thisMonthRecords}</span>
                </div>
              </div>
            </div>

            {/* Loading indicator in sidebar */}
            {isLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medication History */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Medication History</span>
              </h3>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading medication records...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-red-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Records</h4>
                  <p className="text-red-600">Unable to load medication records. Please try again.</p>
                </div>
              ) : filteredMedications.length > 0 ? (
                <div className="space-y-6">
                  {viewMode === "nurse" ? (
                    // Healthcare provider view
                    Object.values(
                      medications.reduce((acc, med) => {
                        const key = `${med.parentId}-${med.childName}`;
                        if (!acc[key]) {
                          acc[key] = {
                            parentName: med.parentName,
                            childName: med.childName,
                            records: []
                          };
                        }
                        acc[key].records.push(med);
                        return acc;
                      }, {})
                    ).map((group, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">
                            {group.parentName} - {group.childName}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {group.records
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((med, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Pill className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-gray-600">Medication:</span>
                                    <span className="font-medium text-gray-900">{med.medicationName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Shield className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm text-gray-600">Dosage:</span>
                                    <span className="font-medium text-gray-900">{med.dosage}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-gray-600">Frequency:</span>
                                    <span className="font-medium text-gray-900">{med.frequency}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-600">Date:</span>
                                    <span className="font-medium text-gray-900">
                                      {new Date(med.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {med.notes && (
                                  <div className="mt-3 flex space-x-2">
                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-600">{med.notes}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Parent view
                    <div className="space-y-4">
                      {filteredMedications
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((med, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-teal-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <Pill className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-gray-600">Medication:</span>
                                <span className="font-semibold text-gray-900">{med.medicationName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-purple-600" />
                                <span className="text-sm text-gray-600">Dosage:</span>
                                <span className="font-semibold text-gray-900">{med.dosage}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                                <span className="text-sm text-gray-600">Frequency:</span>
                                <span className="font-semibold text-gray-900">{med.frequency}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="text-sm text-gray-600">Date:</span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(med.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {med.notes && (
                              <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-700">{med.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {viewMode === "nurse" 
                      ? "No medication records found. Add records for connected parents using the form above."
                      : "No medication records found. Your healthcare provider will add records during visits."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfessionalMedicationUI;