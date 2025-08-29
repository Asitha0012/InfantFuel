import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetConnectedBabyProfilesQuery,
  useGetBreastfeedingHistoryQuery,
  useAddBreastfeedingEntryMutation,
  useUpdateBreastfeedingEntryMutation,
  useDeleteBreastfeedingEntryMutation,
} from "../../redux/api/breastfeeding";
import Loader from "../../Components/Loader";
import { Baby, Users, Clock, Search, Filter } from "lucide-react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import BreastfeedingEntryForm from "../../Components/BreastfeedingEntryForm";

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

  // All states
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState("all");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch breastfeeding history for selected profile
  const {
    data: breastfeedingData,
    isLoading: loadingBreastfeeding,
    error: breastfeedingError,
    refetch,
  } = useGetBreastfeedingHistoryQuery(selectedProfileId, { skip: !selectedProfileId });

  const [addBreastfeedingEntry] = useAddBreastfeedingEntryMutation();
  const [updateBreastfeedingEntry] = useUpdateBreastfeedingEntryMutation();
  const [deleteBreastfeedingEntry] = useDeleteBreastfeedingEntryMutation();

  // When connectedProfiles change, set default selected profile for providers
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(connectedProfiles[0]._id);
    }
    if (isParent) {
      setSelectedProfileId(user._id);
    }
  }, [isProvider, isParent, connectedProfiles, user, selectedProfileId]);

  // Handlers
  const handleProfileSelect = (id) => {
    setSelectedProfileId(id);
    setEditEntry(null);
  };

  const handleEdit = (entry) => {
    setPendingDeleteId(null);
    setEditEntry(entry);
  };

  const handleCancelEdit = () => {
    setEditEntry(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editEntry) {
        await updateBreastfeedingEntry({
          babyId: selectedProfileId,
          entryId: editEntry._id,
          ...formData
        }).unwrap();
        setEditEntry(null);
      } else {
        await addBreastfeedingEntry({
          babyId: selectedProfileId,
          ...formData
        }).unwrap();
      }
      refetch();
    } catch (error) {
      console.error("Error saving breastfeeding entry:", error);
      alert("Error saving entry. Please try again.");
    }
  };

  const handleDelete = async (entryId) => {
    try {
      setDeletingId(entryId);
      await deleteBreastfeedingEntry({
        babyId: selectedProfileId,
        entryId
      }).unwrap();
      setPendingDeleteId(null);
      refetch();
    } catch (error) {
      console.error("Error deleting breastfeeding entry:", error);
      alert("Error deleting entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and search entries
  const filteredEntries = breastfeedingData?.entries?.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.side.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSide === "all" || entry.side === filterSide;
    return matchesSearch && matchesFilter;
  }) || [];

  // Get selected profile info
  const selectedProfile = isProvider 
    ? connectedProfiles.find(p => p._id === selectedProfileId)
    : { fullName: user?.fullName, babyDetails: user?.babyDetails };

  if (loadingProfiles) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-white" />
                <h1 className="text-white text-xl font-semibold">Breastfeeding Tracker</h1>
              </div>
              <button
                onClick={() => navigate("/tracker")}
                className="px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20 text-sm"
              >
                Back to Tracker
              </button>
            </div>

            {/* Profile Selection for Providers */}
            {isProvider && (
              <div className="p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Baby Profile
                </label>
                <select
                  value={selectedProfileId || ""}
                  onChange={(e) => handleProfileSelect(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="" disabled>Choose a baby</option>
                  {connectedProfiles.map((profile) => (
                    <option key={profile._id} value={profile._id}>
                      {profile.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Entry Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <BreastfeedingEntryForm
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                editEntry={editEntry}
                isSubmitting={false}
                babyName={selectedProfile?.fullName}
              />
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterSide}
                    onChange={(e) => setFilterSide(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="all">All Sides</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              {/* Entries Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Breastfeeding History
                </h3>
                {loadingBreastfeeding ? (
                  <div className="text-center py-4">
                    <Loader />
                  </div>
                ) : breastfeedingError ? (
                  <div className="text-center py-4 text-red-600">
                    Error loading breastfeeding data
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No entries found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Side
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEntries.map((entry) => (
                          <tr key={entry._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(entry.dateRecorded).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.duration} min
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                entry.side === 'left' ? 'bg-blue-100 text-blue-800' :
                                entry.side === 'right' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {entry.side.charAt(0).toUpperCase() + entry.side.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {entry.notes || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                {pendingDeleteId === entry._id ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleDelete(entry._id)}
                                      disabled={deletingId === entry._id}
                                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    >
                                      {deletingId === entry._id ? "Deleting..." : "Confirm"}
                                    </button>
                                    <button
                                      onClick={() => setPendingDeleteId(null)}
                                      className="text-gray-600 hover:text-gray-900"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setPendingDeleteId(entry._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Breastfeeding;
