import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetVaccinationsQuery, useCreateVaccinationMutation } from "../redux/api/vaccinations";
import { useGetParentsQuery } from "../redux/api/users";
import { Syringe, Calendar, User, FileText, Shield, Clock, CheckCircle, Search, ArrowLeft } from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const ProfessionalVaccinationUI = () => {
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

  // State for parent selection
  const [selectedParent, setSelectedParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [vaccinations, setVaccinations] = useState([]);
  const [form, setForm] = useState({
    parentId: "",
    parentName: "",
    childName: "",
    vaccineName: "",
    customVaccine: "",
    date: "",
    notes: ""
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const vaccineList = [
    "BCG (Bacille Calmette-Guerin)",
    "Hepatitis B",
    "Polio (OPV/IPV)",
    "Pentavalent (DPT-HepB-Hib)",
    "MMR (Measles, Mumps, Rubella)",
    "DTP (Diphtheria, Pertussis, Tetanus)",
    "Rotavirus",
    "Pneumococcal Conjugate",
    "COVID-19",
    "Influenza"
  ];

  // Server-backed vaccinations - skip if not authenticated
  const { data: serverVaccinations = [], isLoading, isError, refetch } = useGetVaccinationsQuery(undefined, {
    skip: !userInfo
  });
  const [createVaccination, { isLoading: isCreating }] = useCreateVaccinationMutation();

  useEffect(() => {
    setVaccinations(serverVaccinations || []);
  }, [serverVaccinations]);

  // Decide viewMode from userType directly
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
      vaccineName: "",
      customVaccine: "",
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
      vaccineName: "",
      customVaccine: "",
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

    if (!form.childName) {
      setFeedback({ type: "error", message: "Child name is required." });
      return;
    }

    const vaccine = form.vaccineName === "Other" ? form.customVaccine : form.vaccineName;

    const record = {
      parentId: form.parentId,
      parentName: form.parentName,
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
      setFeedback({ type: "error", message: "Duplicate record for this child, vaccine, and date." });
      return;
    }

    try {
      const response = await createVaccination(record).unwrap();
      if (response) {
        setFeedback({ type: "success", message: "Vaccination record saved successfully." });
        // refetch to update local list
        await refetch();
        setForm({
          ...form,
          vaccineName: "",
          customVaccine: "",
          date: "",
          notes: ""
        });
      }
    } catch (err) {
      console.error('Error saving vaccination record:', err);
      setFeedback({ type: "error", message: err?.data?.message || "Failed to save record. Please check all fields and try again." });
    }
  };

  // Filter vaccinations based on selected parent
  const filteredVaccinations = vaccinations.filter(v => {
    if (selectedParent) {
      return v.parentId === selectedParent._id;
    }
    return false;
  });

  // Calculate stats based on selected parent or all data
  const totalRecords = selectedParent ? filteredVaccinations.length : vaccinations.length;
  const connectedFamilies = connectedParents.length;
  const thisMonthRecords = (selectedParent ? filteredVaccinations : vaccinations).filter(v => {
    const vaxDate = new Date(v.date);
    const now = new Date();
    return vaxDate.getMonth() === now.getMonth() && vaxDate.getFullYear() === now.getFullYear();
  }).length;

  if (!userInfo) {
    return null; // Will redirect to login
  }

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
                <h1 className="text-3xl font-bold">Vaccination Management</h1>
                <p className="text-indigo-100">Professional healthcare system</p>
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
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {parent.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Child: {parent.babyDetails?.fullName || "No child name"}
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-blue-50 px-3 py-2 rounded-lg">
                            <p className="text-blue-600 font-medium">
                              {vaccinations.filter(v => v.parentId === parent._id).length}
                            </p>
                            <p className="text-blue-600 text-xs">Records</p>
                          </div>
                          <div className="bg-green-50 px-3 py-2 rounded-lg">
                            <p className="text-green-600 font-medium">
                              {vaccinations.filter(v => {
                                const vaxDate = new Date(v.date);
                                const now = new Date();
                                return v.parentId === parent._id && 
                                       vaxDate.getMonth() === now.getMonth() && 
                                       vaxDate.getFullYear() === now.getFullYear();
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Vaccination Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Syringe className="h-6 w-6 text-white" />
                      <h2 className="text-xl font-semibold text-white">Record New Vaccination</h2>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
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

                    {/* Vaccine Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Shield className="h-4 w-4" />
                        <span>Vaccine Type</span>
                      </label>
                      <select
                        name="vaccineName"
                        value={form.vaccineName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select vaccine from approved list</option>
                        {vaccineList.map((vaccine, idx) => (
                          <option key={idx} value={vaccine}>
                            {vaccine}
                          </option>
                        ))}
                        <option value="Other">Other (specify below)</option>
                      </select>

                      {form.vaccineName === "Other" && (
                        <input
                          type="text"
                          name="customVaccine"
                          value={form.customVaccine}
                          onChange={handleChange}
                          placeholder="Enter custom vaccine name"
                          className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      )}
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>Vaccination Date</span>
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
                        placeholder="Enter any observations, reactions, or additional notes..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!form.childName || isCreating}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                        !form.childName || isCreating
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
                        "Record Vaccination"
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {filteredVaccinations
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 3)
                      .map((vax, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{vax.vaccineName}</p>
                            <p className="text-xs text-gray-500">{new Date(vax.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    
                    {filteredVaccinations.length === 0 && (
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

            {/* Vaccination History for Selected Parent */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Vaccination History - {selectedParent.fullName}</span>
                  </h3>
                </div>
                
                <div className="p-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading vaccination records...</p>
                    </div>
                  ) : isError ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-red-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Records</h4>
                      <p className="text-red-600">Unable to load vaccination records. Please try again.</p>
                    </div>
                  ) : filteredVaccinations.length > 0 ? (
                    <div className="space-y-4">
                      {filteredVaccinations
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((vax, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-teal-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-gray-600">Vaccine:</span>
                                <span className="font-semibold text-gray-900">{vax.vaccineName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="text-sm text-gray-600">Date:</span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(vax.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {vax.notes && (
                              <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                <p className="text-sm text-gray-700">{vax.notes}</p>
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
                        No vaccination records found for {selectedParent.fullName}. Add the first record using the form above.
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

export default ProfessionalVaccinationUI;