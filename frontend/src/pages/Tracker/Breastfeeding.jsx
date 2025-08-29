import { useState, useEffect, useRef } from "react";
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
import { Baby, Users, Clock, Image as ImageIcon, Search, Filter } from "lucide-react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import BreastfeedingEntryForm from "../../Components/BreastfeedingEntryForm";
import PropTypes from "prop-types";

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

  // Inline delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSide, setFilterSide] = useState("all");

  // Handlers
  const handleProfileSelect = (id) => {
    setSelectedProfileId(id);
    setEditEntry(null);
  };

  const handleEdit = (entry) => {
    // Cancel any pending delete confirmation when editing
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
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Breastfeeding Tracker</h1>
            <p className="text-gray-600">Track and monitor breastfeeding sessions for your baby</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Connected Baby Profiles (Providers) */}
            {isProvider && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Connected Babies
                  </h3>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search babies..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Baby Profiles List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {connectedProfiles.map((profile) => (
                      <div
                        key={profile._id}
                        onClick={() => handleProfileSelect(profile._id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProfileId === profile._id
                            ? "bg-blue-100 border-blue-300 border"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {profile.profilePicture ? (
                            <img
                              src={profile.profilePicture}
                              alt={profile.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Baby className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {profile.fullName}
                            </p>
                            {profile.babyDetails && (
                              <p className="text-sm text-gray-500 truncate">
                                {profile.babyDetails}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`${isProvider ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {/* Selected Profile Info */}
              {selectedProfile && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Baby className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedProfile.fullName}
                      </h2>
                      {selectedProfile.babyDetails && (
                        <p className="text-gray-600">{selectedProfile.babyDetails}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Entry Form */}
              <BreastfeedingEntryForm
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                editEntry={editEntry}
                isSubmitting={false}
                babyName={selectedProfile?.fullName}
              />

              {/* Search and Filter */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search entries by notes or side..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filterSide}
                      onChange={(e) => setFilterSide(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Sides</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Entries List */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Breastfeeding History</h3>
                </div>
                
                {loadingBreastfeeding ? (
                  <div className="p-6 text-center">
                    <Loader />
                  </div>
                ) : breastfeedingError ? (
                  <div className="p-6 text-center text-red-600">
                    Error loading breastfeeding data. Please try again.
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No breastfeeding entries found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Side
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Recorded By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEntries.map((entry) => (
                          <tr key={entry._id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {entry.notes || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {entry.recordedBy?.fullName || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  Edit
                                </button>
                                {pendingDeleteId === entry._id ? (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleDelete(entry._id)}
                                      disabled={deletingId === entry._id}
                                      className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                                    >
                                      {deletingId === entry._id ? "Deleting..." : "Confirm"}
                                    </button>
                                    <button
                                      onClick={() => setPendingDeleteId(null)}
                                      className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setPendingDeleteId(entry._id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
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
