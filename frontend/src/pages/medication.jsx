import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetmedicationsQuery, useCreatemedicationsMutation } from "../redux/api/medications";
import { useGetParentsQuery } from "../redux/api/users";
import { Pill, Calendar, User, FileText, Shield, Clock, CheckCircle, Search, ArrowLeft, Eye } from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const ProfessionalMedicationUI = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) navigate("/");
  }, [userInfo, navigate]);

  // Get connected parents for healthcare providers
  const { data: rawParents = [] } = useGetParentsQuery(undefined, {
    skip: !userInfo || userInfo.userType !== "healthcareProvider",
  });

  const connectedParents = rawParents.filter(parent => parent.userType === "parent");

  // State for parent selection
  const [selectedParent, setSelectedParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [feedback, setFeedback] = useState({ type: "", message: "" });

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

  // Server-backed medications
  const { data: serverMedications = [], isLoading, isError, refetch } = useGetmedicationsQuery(undefined, {
    skip: !userInfo
  });
  const [createMedication, { isLoading: isCreating }] = useCreatemedicationsMutation();

  useEffect(() => {
    setMedications(serverMedications || []);
  }, [serverMedications]);

  // View mode logic
  const viewMode = userInfo?.userType === "healthcareProvider" ? "nurse" : "parent";

  // Auto-select parent for parent users
  useEffect(() => {
    if (viewMode === "parent" && userInfo) {
      setSelectedParent({
        _id: userInfo._id,
        fullName: userInfo.fullName,
        babyDetails: userInfo.babyDetails
      });
      setForm(prev => ({
        ...prev,
        parentId: userInfo._id,
        parentName: userInfo.fullName,
        childName: userInfo.babyDetails?.fullName || ""
      }));
    }
  }, [viewMode, userInfo]);

  // Filter parents based on search
  const filteredParents = connectedParents.filter(parent =>
    parent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (parent.babyDetails?.fullName && parent.babyDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleParentSelect = (parent) => {
    setSelectedParent(parent);
    setForm({
      parentId: parent._id,
      parentName: parent.fullName,
      childName: parent.babyDetails?.fullName || "",
      medicationName: "",
      customMedication: "",
      dosage: "",
      frequency: "",
      date: "",
      notes: ""
    });
    setFeedback({ type: "", message: "" });
  };

  const handleBackToSelection = () => {
    setSelectedParent(null);
    setSearchTerm("");
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
    setFeedback({ type: "", message: "" });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.childName || !form.medicationName || !form.dosage || !form.frequency || !form.date) {
      setFeedback({ type: "error", message: "All required fields must be filled." });
      return;
    }

    if (form.medicationName === "Other" && !form.customMedication) {
      setFeedback({ type: "error", message: "Please specify custom medication name." });
      return;
    }

    const medicationType =
      form.medicationName === "Other" ? form.customMedication : form.medicationName;

    const record = {
      parentId: form.parentId,
      parentName: form.parentName,
      childName: form.childName,
      medicationName: medicationType,
      dosage: form.dosage,
      frequency: form.frequency,
      date: form.date,
      notes: form.notes || "",
      createdBy: userInfo._id,
    };

    // basic duplicate check against currently loaded records
    const isDuplicate = medications.some(m =>
      m.childName === record.childName &&
      m.medicationName === record.medicationName &&
      new Date(m.date).toISOString() === new Date(record.date).toISOString()
    );

    if (isDuplicate) {
      setFeedback({ type: "error", message: "Duplicate record for this child, medication, and date." });
      return;
    }

    try {
      const response = await createMedication(record).unwrap();
      if (response) {
        setFeedback({ type: "success", message: "Medication record saved successfully." });
        await refetch();
        setForm({
          ...form,
          medicationName: "",
          customMedication: "",
          dosage: "",
          frequency: "",
          date: "",
          notes: ""
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.data?.message || "Failed to save record. Please check all fields and try again."
      });
    }
  };

  // Filter medications based on selected parent
  const filteredMedications = medications.filter(m => {
    if (selectedParent) {
      return m.parentId === selectedParent._id;
    }
    return false;
  });

  // Calculate stats based on selected parent or all data
  const totalRecords = selectedParent ? filteredMedications.length : medications.length;
  const connectedFamilies = connectedParents.length;
  const thisMonthRecords = (selectedParent ? filteredMedications : medications).filter(m => {
    const medDate = new Date(m.date);
    const now = new Date();
    return medDate.getMonth() === now.getMonth() && medDate.getFullYear() === now.getFullYear();
  }).length;

  if (!userInfo) return null; // Will redirect to login

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {viewMode === "parent" ? "My Child's Medication Records" : "Medication Management"}
                </h1>
                <p className="text-indigo-100">
                  {viewMode === "parent" ? "View your child's prescription history" : "Professional healthcare system"}
                </p>
              </div>
            </div>
            {selectedParent && viewMode === "nurse" && (
              <button
                onClick={handleBackToSelection}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Profiles</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Parent Selection Screen for Healthcare Providers */}
        {viewMode === "nurse" && !selectedParent && (
          <div>
            {/* Connected Baby Profiles Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Connected Baby Profiles</h2>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by parent or baby name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-white px-4 py-3 rounded-lg border border-gray-300 min-w-[200px]">
                  <select className="w-full bg-transparent focus:outline-none">
                    <option>{selectedParent?.fullName || "Select Parent"}</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Parent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => (
                  <div
                    key={parent._id}
                    onClick={() => handleParentSelect(parent)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{parent.fullName}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Child: {parent.babyDetails?.fullName || "No child name"}
                        </p>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-blue-50 px-3 py-2 rounded-lg">
                            <p className="text-blue-600 font-medium">
                              {medications.filter(m => m.parentId === parent._id).length}
                            </p>
                            <p className="text-blue-600 text-xs">Records</p>
                          </div>
                          <div className="bg-green-50 px-3 py-2 rounded-lg">
                            <p className="text-green-600 font-medium">
                              {medications.filter(m => {
                                const medDate = new Date(m.date);
                                const now = new Date();
                                return m.parentId === parent._id && medDate.getMonth() === now.getMonth() && medDate.getFullYear() === now.getFullYear();
                              }).length}
                            </p>
                            <p className="text-green-600 text-xs">This Month</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {connectedParents.length === 0 ? "No Connected Parents" : "No Results Found"}
                  </h3>
                  <p className="text-gray-500">
                    {connectedParents.length === 0
                      ? "No parent accounts are connected to your healthcare provider account."
                      : "Try adjusting your search terms."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Main Content (When Parent is Selected) */}
        {selectedParent && (
          <div>
            {/* Selected Parent Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedParent.fullName}
                    </h3>
                    <p className="text-green-100">
                      Child: {selectedParent.babyDetails?.fullName || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Stats Row */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{totalRecords}</div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{thisMonthRecords}</div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                  {viewMode === "nurse" && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{connectedFamilies}</div>
                      <div className="text-sm text-gray-600">All Families</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`grid grid-cols-1 ${viewMode === "nurse" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-8`}>
              {/* Medication Form - Only for Healthcare Providers */}
              {viewMode === "nurse" && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Pill className="h-6 w-6 text-white" />
                        <h2 className="text-xl font-semibold text-white">Record New Medication</h2>
                      </div>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      {/* Child Name (Editable if not set) */}
                      {!selectedParent.babyDetails?.fullName && (
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <User className="h-4 w-4" />
                            <span>Child Name</span>
                          </label>
                          <input
                            type="text"
                            name="childName"
                            value={form.childName}
                            onChange={handleChange}
                            placeholder="Enter child's full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      )}
                      {/* Medication Selection */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Shield className="h-4 w-4" />
                          <span>Medication Type</span>
                        </label>
                        <select
                          name="medicationName"
                          value={form.medicationName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select medication from approved list</option>
                          {medicationList.map((med, idx) => (
                            <option key={idx} value={med}>{med}</option>
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
                              <option key={idx} value={freq}>{freq}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <span>Medication Date</span>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-all
                          ${!form.childName || isCreating
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
                    </form>
                  </div>
                </div>
              )}
              {/* Info Card for Parents - Only show when in parent mode */}
              {viewMode === "parent" && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Eye className="h-6 w-6 text-white" />
                        <h2 className="text-xl font-semibold text-white">Medication Records</h2>
                      </div>
                    </div>
                    <div className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                        <Shield className="h-8 w-8 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Your Child&apos;s Prescription History
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        This page displays all medication records for your child as recorded by healthcare providers.
                        Only authorized professionals can add new entries to ensure accuracy and security.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-center space-x-2 text-blue-700">
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Secure Medical Records</span>
                        </div>
                        <p className="text-blue-600 text-sm mt-2">
                          All records are maintained by qualified healthcare providers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Sidebar */}
              <div className={`space-y-6 ${viewMode === "parent" ? "lg:col-span-2" : ""}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    {filteredMedications
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 3)
                      .map((med, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Pill className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{med.medicationName}</p>
                            <p className="text-xs text-gray-500">{new Date(med.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    {filteredMedications.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    )}
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
            {/* Medication History for Selected Parent */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>
                      {viewMode === "parent" ? "My Child's Medication History" : `Medication History - ${selectedParent.fullName}`}
                    </span>
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
                    <div className="space-y-4">
                      {filteredMedications
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((med, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-teal-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
                                <span className="font-semibold text-gray-900">{new Date(med.date).toLocaleDateString()}</span>
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
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        {viewMode === "parent"
                          ? "No medication records found for your child. Records will appear here when added by healthcare providers."
                          : `No medication records found for ${selectedParent.fullName}. Add the first record using the form above.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProfessionalMedicationUI;
