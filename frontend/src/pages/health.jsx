import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetVaccinationsQuery, useCreateVaccinationMutation } from "../redux/api/vaccinations";
import { useGetParentsQuery } from "../redux/api/users";
import { Syringe, Calendar, User, FileText, Shield, Clock, CheckCircle } from 'lucide-react';
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
  const [feedback, setFeedback] = useState({ type: "", message: "" }); // success | error

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (viewMode === "nurse" && (!form.parentId || !form.childName)) {
  setFeedback({ type: "error", message: "Please select a parent and ensure child name is available." });
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
      setFeedback({ type: "error", message: err?.data?.message || "Failed to save record. Please check all fields and try again." });
    }
  };

  // Filter vaccinations based on view mode and user
  const filteredVaccinations = vaccinations.filter(v => {
    if (viewMode === "parent") {
      return v.parentId === userInfo._id;
    }
    return true; // Show all vaccinations for healthcare providers
  });

  // Calculate stats
  const totalRecords = vaccinations.length;
  const connectedFamilies = connectedParents.length;
  const thisMonthRecords = vaccinations.filter(v => {
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vaccination Management</h1>
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
                    <Syringe className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Record New Vaccination</h2>
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
                    <p className="mt-1 text-green-800">Your vaccination records are managed by your healthcare provider and will appear below.</p>
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

        {/* Vaccination History */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Vaccination History</span>
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
                <div className="space-y-6">
                  {viewMode === "nurse" ? (
                    // Healthcare provider view
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
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">
                            {group.parentName} - {group.childName}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {group.records
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((vax, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-gray-600">Vaccine:</span>
                                    <span className="font-medium text-gray-900">{vax.vaccineName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-600">Date:</span>
                                    <span className="font-medium text-gray-900">
                                      {new Date(vax.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {vax.notes && (
                                  <div className="mt-3 flex space-x-2">
                                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <p className="text-sm text-gray-600">{vax.notes}</p>
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
                      ? "No vaccination records found. Add records for connected parents using the form above."
                      : "No vaccination records found. Your healthcare provider will add records during visits."
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

export default ProfessionalVaccinationUI;