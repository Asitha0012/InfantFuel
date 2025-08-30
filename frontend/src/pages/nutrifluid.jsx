import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Loader from "../Components/Loader";
import {
  Droplet,
  Plus,
  Clock,
  Baby,
  Scale,
  StickyNote,
  Edit3,
  Trash2,
  BarChart3,
  Search,
  ArrowLeft,
  Milk,
  CupSoda,
  MoreHorizontal,
} from "lucide-react";
import {
  useCreateFluidIntakeMutation,
  useGetFluidIntakeRecordsQuery,
  useUpdateFluidIntakeMutation,
  useDeleteFluidIntakeMutation,
  useGetFluidIntakeStatsQuery,
} from "../redux/api/nutritionFluid";
import { useGetConnectedBabyProfilesForHeightQuery } from "../redux/api/heights";

const fluidTypeIcons = {
  water: Droplet,
  milk: Milk,
  formula: Baby,
  juice: CupSoda,
  other: MoreHorizontal,
};

const fluidTypeColors = {
  water: "bg-sky-100 text-sky-600 border-sky-200",
  milk: "bg-blue-100 text-blue-600 border-blue-200",
  formula: "bg-purple-100 text-purple-600 border-purple-200",
  juice: "bg-orange-100 text-orange-600 border-orange-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function FluidIntake() {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const isProvider = userInfo?.isAdmin === true;

  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    fluidType: "",
    amount: "",
    unit: "ml",
    time: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  // API hooks
  const [createFluidIntake, { isLoading: isCreating }] = useCreateFluidIntakeMutation();
  const [updateFluidIntake, { isLoading: isUpdating }] = useUpdateFluidIntakeMutation();
  const [deleteFluidIntake, { isLoading: isDeleting }] = useDeleteFluidIntakeMutation();

  const { data: connectedProfiles = [], isLoading: loadingProfiles } = useGetConnectedBabyProfilesForHeightQuery(
    undefined,
    { skip: !isProvider }
  );

  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedParentId) {
      setSelectedParentId(connectedProfiles[0]._id);
    }
  }, [isProvider, connectedProfiles, selectedParentId]);

  const { data: records = [], isLoading } = useGetFluidIntakeRecordsQuery(
    {
      parentId: isProvider ? selectedParentId : undefined,
      fluidType: filterType || undefined,
    },
    { skip: isProvider && !selectedParentId }
  );

  const { data: stats = [] } = useGetFluidIntakeStatsQuery(
    {
      parentId: isProvider ? selectedParentId : undefined,
    },
    { skip: isProvider && !selectedParentId }
  );

  useEffect(() => {
    if (!userInfo) navigate("/login");
  }, [userInfo, navigate]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fluidType || !formData.amount || !formData.time || !formData.unit) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isProvider) {
      toast.error("Healthcare providers cannot add or edit fluid entries.");
      return;
    }
    try {
      if (editingRecord) {
        await updateFluidIntake({ id: editingRecord._id, ...formData, amount: parseFloat(formData.amount) }).unwrap();
        toast.success("Record updated successfully!");
      } else {
        await createFluidIntake({ ...formData, amount: parseFloat(formData.amount) }).unwrap();
        toast.success("Record added successfully!");
      }
      resetForm();
    } catch (err) {
      toast.error(err.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setFormData({
      fluidType: "",
      amount: "",
      unit: "ml",
      time: new Date().toISOString().slice(0, 16),
      notes: "",
    });
    setEditingRecord(null);
    setIsFormOpen(false);
  };

  const handleEdit = (record) => {
    setConfirmDeleteId(null);
    setFormData({
      fluidType: record.fluidType,
      amount: String(record.amount),
      unit: record.unit,
      time: new Date(record.time).toISOString().slice(0, 16),
      notes: record.notes || "",
    });
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFluidIntake(id).unwrap();
      setConfirmDeleteId(null);
      toast.success("Record deleted successfully!");
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete record");
    }
  };

  const filteredRecords = records.filter((r) => {
    const st = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      r.fluidType?.toLowerCase().includes(st) ||
      r.notes?.toLowerCase().includes(st)
    );
  });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalDrinks = Array.isArray(stats) ? stats.reduce((acc, s) => acc + (s.count || 0), 0) : 0;
  const totalVolume = Array.isArray(stats) ? stats.reduce((acc, s) => acc + (s.totalAmount || 0), 0) : 0;

  if (isLoading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-sky-100 rounded-xl">
                  <Droplet className="h-8 w-8 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Fluid Intake</h1>
                  <p className="text-gray-600">Track your baby’s fluids</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/tracker")}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {!isProvider && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Entry</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Provider profile selector */}
          {isProvider && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-80">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Baby Profile</label>
                  <div className="relative">
                    <div
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div className="text-gray-600">
                        {loadingProfiles
                          ? "Loading profiles..."
                          : connectedProfiles.find((p) => p._id === selectedParentId)?.babyDetails?.fullName ||
                            connectedProfiles.find((p) => p._id === selectedParentId)?.fullName ||
                            "Select a profile"}
                      </div>
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden">
                        <div className="p-3 border-b">
                          <input
                            type="text"
                            placeholder="Search by parent or baby name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-900 placeholder-gray-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {connectedProfiles
                            .filter((profile) => {
                              const parentName = profile.fullName?.toLowerCase() || "";
                              const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
                              return (
                                parentName.includes(searchTerm.toLowerCase()) ||
                                babyName.includes(searchTerm.toLowerCase())
                              );
                            })
                            .map((profile) => (
                              <div
                                key={profile._id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  setSelectedParentId(profile._id);
                                  setShowDropdown(false);
                                  setSearchTerm("");
                                }}
                              >
                                <div className="font-medium text-gray-900">{profile.fullName}</div>
                                <div className="text-sm text-gray-500">Baby: {profile.babyDetails?.fullName || "Not set"}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Drinks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDrinks || records.length}</p>
                </div>
                <CupSoda className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fluid Types</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.isArray(stats) ? stats.length : 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter((r) => new Date(r.time) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{totalVolume} {formData.unit}</p>
                </div>
                <Droplet className="h-8 w-8 text-sky-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Records List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg">
                {/* Filters */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by fluid type or notes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="">All Fluid Types</option>
                      <option value="water">Water</option>
                      <option value="milk">Milk</option>
                      <option value="formula">Formula</option>
                      <option value="juice">Juice</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Records */}
                <div className="p-6">
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                      <p className="text-gray-600">Start tracking your baby’s fluid intake!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRecords.map((record) => {
                        const Icon = fluidTypeIcons[record.fluidType] || MoreHorizontal;
                        return (
                          <div key={record._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                <div className={`p-2 rounded-lg border ${fluidTypeColors[record.fluidType]}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-semibold text-gray-900 capitalize">{record.fluidType}</h4>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center space-x-1">
                                      <Baby className="h-4 w-4" />
                                      <span>{record.childName}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Scale className="h-4 w-4" />
                                      <span>
                                        {record.amount} {record.unit}
                                      </span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{formatDate(record.time)}</span>
                                    </span>
                                  </div>
                                  {record.notes && <p className="text-sm text-gray-600 mb-2">{record.notes}</p>}
                                </div>
                              </div>
                              {!isProvider && (
                                <div className="flex items-center space-x-2">
                                  {confirmDeleteId === record._id ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">Delete?</span>
                                      <button
                                        onClick={() => handleDelete(record._id)}
                                        disabled={isDeleting}
                                        className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                                      >
                                        {isDeleting ? "Deleting..." : "Yes"}
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="px-2 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEdit(record)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(record._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fluid Type Distribution */}
            <div className="space-y-6">
              {Array.isArray(stats) && stats.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Fluid Type Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.map((item) => {
                      const Icon = fluidTypeIcons[item._id] || MoreHorizontal;
                      const total = stats.reduce((acc, s) => acc + (s.count || 0), 0);
                      const percentage = total > 0 ? (((item.count || 0) / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={item._id} className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${fluidTypeColors[item._id]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium capitalize">{item._id}</span>
                              <span className="text-xs text-gray-600">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{item.count || 0} drinks • {item.totalAmount || 0} {formData.unit}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Modal (parent only) */}
        {isFormOpen && !isProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{editingRecord ? "Edit Record" : "Add New Record"}</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Fluid Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fluid Type *</label>
                  <select
                    name="fluidType"
                    value={formData.fluidType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Fluid Type</option>
                    <option value="water">Water</option>
                    <option value="milk">Milk</option>
                    <option value="formula">Formula</option>
                    <option value="juice">Juice</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Amount and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Scale className="inline h-4 w-4 mr-1" /> Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      required
                    >
                      <option value="ml">ml</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" /> Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <StickyNote className="inline h-4 w-4 mr-1" /> Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any observations..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {(isCreating || isUpdating) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{editingRecord ? "Update Record" : "Add Record"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}


