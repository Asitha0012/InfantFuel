import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetConnectedBabyProfilesQuery,
  useGetBreastfeedingHistoryQuery,
  useAddBreastfeedingEntryMutation,
  useUpdateBreastfeedingEntryMutation,
  useDeleteBreastfeedingEntryMutation,
} from "../../redux/api/breastfeeding";
import Loader from "../../Components/Loader";
import {
  Baby,
  Clock,
  Search,
  Filter,
  Edit3,
  Trash2,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const Breastfeeding = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);
  const isProvider = user?.isAdmin === true;
  const isParent = user?.isAdmin === false;
  
  // Connected baby profiles (providers only)
  const {
    data: connectedProfiles = [],
    isLoading: loadingProfiles,
  } = useGetConnectedBabyProfilesQuery(undefined, { skip: !isProvider });

  // Selected profile (providers) or self (parent)
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // When connectedProfiles change, set default selected profile for providers
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(connectedProfiles[0]._id);
    }
    if (isParent) {
      setSelectedProfileId(user._id);
    }
  }, [isProvider, isParent, connectedProfiles, user, selectedProfileId]);

  // Breastfeeding entry form state
  const [editEntry, setEditEntry] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    dateRecorded: new Date().toISOString().slice(0, 16),
    duration: "",
    side: "left",
    notes: "",
  });

  // Fetch breastfeeding history for selected profile
  const {
    data: breastfeedingData,
    isLoading: loadingBreastfeeding,
    error: breastfeedingError,
    refetch,
  } = useGetBreastfeedingHistoryQuery(selectedProfileId, { skip: !selectedProfileId });

  const [addBreastfeedingEntry, { isLoading: isCreating }] = useAddBreastfeedingEntryMutation();
  const [updateBreastfeedingEntry, { isLoading: isUpdating }] = useUpdateBreastfeedingEntryMutation();
  const [deleteBreastfeedingEntry, { isLoading: isDeleting }] = useDeleteBreastfeedingEntryMutation();

  // Inline delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState("all");

  // Handlers
  const handleProfileSelect = (id) => {
    setSelectedProfileId(id);
    setEditEntry(null);
  };

  const handleEdit = (entry) => {
    setPendingDeleteId(null);
    setFormData({
      dateRecorded: new Date(entry.dateRecorded).toISOString().slice(0, 16),
      duration: String(entry.duration || ""),
      side: entry.side || "left",
      notes: entry.notes || "",
    });
    setEditEntry(entry);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      dateRecorded: new Date().toISOString().slice(0, 16),
      duration: "",
      side: "left",
      notes: "",
    });
    setEditEntry(null);
    setIsFormOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfileId) return;
    if (!formData.dateRecorded || !formData.duration || !formData.side) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isProvider) {
      toast.error("Healthcare providers cannot add or edit breastfeeding entries.");
      return;
    }
    try {
      const payload = {
        babyId: selectedProfileId,
        dateRecorded: new Date(formData.dateRecorded).toISOString(),
        duration: parseInt(formData.duration, 10),
        side: formData.side,
        notes: formData.notes,
      };
      if (editEntry) {
        await updateBreastfeedingEntry({ entryId: editEntry._id, ...payload }).unwrap();
        toast.success("Entry updated");
      } else {
        await addBreastfeedingEntry(payload).unwrap();
        toast.success("Entry added");
      }
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to save entry");
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await deleteBreastfeedingEntry({ babyId: selectedProfileId, entryId }).unwrap();
      setPendingDeleteId(null);
      toast.success("Entry deleted");
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete entry");
    }
  };

  // Filter and search entries
  const rawEntries = Array.isArray(breastfeedingData)
    ? breastfeedingData
    : breastfeedingData?.entries || [];
  const filteredEntries = rawEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.side.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSide === "all" || entry.side === filterSide;
    return matchesSearch && matchesFilter;
  }) || [];

  // Selected profile info not directly shown in UI; keeping ID only

  // Stats (client-side)
  const entries = rawEntries;
  const totalSessions = entries.length;
  const sessionsThisWeek = entries.filter(
    (e) => new Date(e.dateRecorded) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const avgDuration = totalSessions
    ? Math.round(entries.reduce((acc, e) => acc + (e.duration || 0), 0) / totalSessions)
    : 0;
  const sideCounts = entries.reduce(
    (acc, e) => {
      const s = (e.side || "left").toLowerCase();
      if (s === "left") acc.left += 1;
      else if (s === "right") acc.right += 1;
      else acc.both += 1;
      return acc;
    },
    { left: 0, right: 0, both: 0 }
  );

  if (loadingProfiles) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Baby className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Breastfeeding</h1>
                  <p className="text-gray-600">Track your baby’s breastfeeding sessions</p>
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
                    className="flex items-center space-x-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="inline-block">Add Entry</span>
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
                      onClick={() => setShowDropdown((v) => !v)}
                    >
                      <div className="text-gray-600">
                        {connectedProfiles.find((p) => p._id === selectedProfileId)?.babyDetails?.fullName ||
                          connectedProfiles.find((p) => p._id === selectedProfileId)?.fullName ||
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-500 bg-white"
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
                                  handleProfileSelect(profile._id);
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
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-pink-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionsThisWeek}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{avgDuration} min</p>
                </div>
                <Baby className="h-8 w-8 text-rose-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Left vs Right</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sideCounts.left}/{sideCounts.right} (both {sideCounts.both})
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Filters and List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          placeholder="Search by notes or side..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={filterSide}
                        onChange={(e) => setFilterSide(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="all">All Sides</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Records */}
                <div className="p-6">
                  {loadingBreastfeeding ? (
                    <Loader />
                  ) : breastfeedingError ? (
                    <div className="text-center text-red-600">Error loading data.</div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Baby className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
                      <p className="text-gray-600">Start logging breastfeeding sessions!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEntries.map((entry) => (
                        <div key={entry._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="p-2 rounded-lg border bg-pink-100 text-pink-600 border-pink-200">
                                <Baby className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 capitalize">{entry.side}</h4>
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {entry.duration} min
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date(entry.dateRecorded).toLocaleString()}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <span>By {entry.recordedBy?.fullName || "Unknown"}</span>
                                  </span>
                                </div>
                                {entry.notes && <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>}
                              </div>
                            </div>
                            {!isProvider && (
                              <div className="flex items-center space-x-2">
                                {pendingDeleteId === entry._id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Delete?</span>
                                    <button
                                      onClick={() => handleDelete(entry._id)}
                                      disabled={isDeleting}
                                      className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                      {isDeleting ? "Deleting..." : "Yes"}
                                    </button>
                                    <button
                                      onClick={() => setPendingDeleteId(null)}
                                      className="px-2 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEdit(entry)}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setPendingDeleteId(entry._id)}
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side distribution */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Side Distribution</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "left", label: "Left", color: "bg-pink-500" },
                    { key: "right", label: "Right", color: "bg-rose-500" },
                    { key: "both", label: "Both", color: "bg-purple-500" },
                  ].map((item) => {
                    const total = totalSessions || 1;
                    const count = sideCounts[item.key];
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={item.key} className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-pink-50`}>
                          <Baby className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="text-xs text-gray-600">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${percentage}%` }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{count} sessions</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal (parent only) */}
        {isFormOpen && !isProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{editEntry ? "Edit Entry" : "Add New Entry"}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" /> Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="dateRecorded"
                    value={formData.dateRecorded}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                {/* Duration and Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Side *</label>
                    <select
                      name="side"
                      value={formData.side}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any observations..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                {/* Buttons */}
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
                    className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {(isCreating || isUpdating) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{editEntry ? "Update Entry" : "Add Entry"}</span>
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
};

export default Breastfeeding;
