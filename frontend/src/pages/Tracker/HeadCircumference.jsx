import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetConnectedBabyProfilesForHeadCircQuery,
  useGetHeadCircHistoryQuery,
  useAddHeadCircEntryMutation,
  useUpdateHeadCircEntryMutation,
  useDeleteHeadCircEntryMutation,
} from "../../redux/api/headCircumference";
import Loader from "../../Components/Loader";
import { Circle, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import PropTypes from "prop-types";
import WHOHeadCircGraph from "../../Components/WHOHeadCircGraph";
import whoChartImg from "../../Assets/WHO-Chart3.png";

// WHO overlay configuration (tweak these to adjust)
const OVERLAY_CONFIG = {
  topOffsetPx: -45,     // negative moves higher, positive moves lower
  leftOffsetPx: -130,    // negative moves left, positive moves right
  scale: 0.8,           // 1 = exactly container size, 0.9 = 90%, etc.
  opacity: 0.6,       // overlay transparency
};

const HeadCircumference = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);
  const isProvider = user?.isAdmin === true;

  // State management
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Track chart container size so overlay fits perfectly
  const chartContainerRef = useRef(null);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (chartContainerRef.current) {
        const rect = chartContainerRef.current.getBoundingClientRect();
        setOverlaySize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // API queries
  const { data: connectedProfiles = [], isLoading: loadingProfiles } = 
    useGetConnectedBabyProfilesForHeadCircQuery(undefined, { skip: !isProvider });

  // Initialize selected profile
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(connectedProfiles[0]._id);
    } else if (!isProvider && user) {
      setSelectedProfileId(user._id);
    }
  }, [isProvider, connectedProfiles, user, selectedProfileId]);

  const { 
    data: hcData, 
    isLoading: loadingHC, 
    error: hcError, 
    refetch 
  } = useGetHeadCircHistoryQuery(selectedProfileId, { skip: !selectedProfileId });

  const [addEntry] = useAddHeadCircEntryMutation();
  const [updateEntry] = useUpdateHeadCircEntryMutation();
  const [deleteEntry] = useDeleteHeadCircEntryMutation();
  // Inline delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Get filtered profiles for search
  const filteredProfiles = connectedProfiles.filter(profile => {
    const parentName = profile.fullName?.toLowerCase() || "";
    const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
    return (
      parentName.includes(searchTerm.toLowerCase()) ||
      babyName.includes(searchTerm.toLowerCase())
    );
  });

  // Profile selection handlers
  const handleProfileSelect = (profileId) => {
    setSelectedProfileId(profileId);
    setShowDropdown(false);
    setSearchTerm("");
    setEditEntry(null);
  };

  // Entry manipulation handlers
  const handleEdit = (entry) => {
    // Cancel inline delete confirmation when switching to edit
    setPendingDeleteId(null);
    setEditEntry(entry);
  };

  // Start inline delete confirmation UI
  const handleRequestDelete = (entry) => {
    setEditEntry(null);
    setPendingDeleteId(entry._id);
  };

  // Confirm deletion
  const handleConfirmDelete = async (entryId) => {
    setDeletingId(entryId);
    try {
      await deleteEntry({ babyId: selectedProfileId, entryId });
      await refetch();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => setPendingDeleteId(null);

  // Form submission handler
  const handleSubmit = async (form) => {
    if (form.headCircumference < 20 || form.headCircumference > 60) {
      alert(`Invalid head circumference: ${form.headCircumference} cm. Please enter a value between 20 and 60 cm.`);
      return;
    }
    try {
      if (editEntry) {
        await updateEntry({ babyId: selectedProfileId, entryId: editEntry._id, ...form });
      } else {
        await addEntry({ babyId: selectedProfileId, ...form });
      }
      setEditEntry(null);
      await refetch();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const entries = hcData?.entries || [];
  const babyProfile = hcData?.babyProfile || 
    (isProvider ? connectedProfiles.find((p) => p._id === selectedProfileId) : user);

  const selectedProfile = connectedProfiles.find(p => p._id === selectedProfileId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section (contained, matches content width) */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-sm">
          <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Circle className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-xl font-semibold">Head Circumference</h1>
                <p className="text-purple-100 text-sm">Monitor brain development</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/tracker")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tracker
            </button>
          </div>

          {/* Profile Selector - Provider Only */}
          {isProvider && (
            <div className="mt-6 bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-80 relative">
                  <label className="block text-sm font-medium text-purple-100 mb-2">
                    Select Baby Profile
                  </label>
                  <div className="relative">
                    <div 
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div className="flex items-center gap-3">
                        {selectedProfile ? (
                          <>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {selectedProfile.babyDetails?.fullName?.charAt(0) || selectedProfile.fullName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{selectedProfile.fullName}</div>
                              <div className="text-sm text-gray-500">
                                Baby: {selectedProfile.babyDetails?.fullName || 'Not set'} • 
                                {selectedProfile.babyDetails?.gender || 'Unknown'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">
                            {loadingProfiles ? "Loading profiles..." : "Select a profile"}
                          </span>
                        )}
                      </div>
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Dropdown */}
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-hidden">
                        <div className="p-3 border-b">
                          <input
                            type="text"
                            placeholder="Search by parent or baby name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredProfiles.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">
                              {searchTerm ? "No profiles match your search" : "No connected profiles found"}
                            </div>
                          ) : (
                            filteredProfiles.map((profile) => (
                              <div
                                key={profile._id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleProfileSelect(profile._id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-medium text-xs">
                                      {profile.babyDetails?.fullName?.charAt(0) || profile.fullName?.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{profile.fullName}</div>
                                    <div className="text-sm text-gray-500">
                                      Baby: {profile.babyDetails?.fullName || 'Not set'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Head Circumference Chart</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showOverlay 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showOverlay ? 'Hide' : 'Show'} WHO Standard
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loadingHC ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : hcError ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">Error loading head circumference data</div>
                <button 
                  onClick={() => refetch()} 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="relative" ref={chartContainerRef}>
                <WHOHeadCircGraph
                  entries={entries}
                  babyProfile={babyProfile}
                  showLegend={false}
                />
                
                {/* WHO Overlay */}
                {showOverlay && (
                  <div
                    style={{
                      position: 'absolute',
                      top: OVERLAY_CONFIG.topOffsetPx,
                      left: `calc(50% + ${OVERLAY_CONFIG.leftOffsetPx}px)`,
                      transform: `translateX(-50%) scale(${OVERLAY_CONFIG.scale})`,
                      width: overlaySize.width,
                      height: overlaySize.height,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    <img
                      src={whoChartImg}
                      alt="WHO Standard Overlay"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        opacity: OVERLAY_CONFIG.opacity,
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Entry Form - Both Providers and Parents */}
        {selectedProfileId && (
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editEntry ? "Edit Head Circumference Entry" : "Add Head Circumference Entry"}
              </h2>
            </div>
            <div className="p-6">
              <HeadCircEntryForm 
                initial={editEntry} 
                onSubmit={handleSubmit} 
                onCancel={() => setEditEntry(null)} 
              />
            </div>
          </div>
        )}

        {/* Entries Table */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Head Circumference History</h2>
          </div>
          <div className="p-6">
            {loadingHC ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Circle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500 mb-2">No head circumference entries yet</div>
                <div className="text-sm text-gray-400">Add the first head circumference entry above</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Head Circumference (cm)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Notes</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Recorded By</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries
                      .slice()
                      .sort((a, b) => new Date(b.dateRecorded) - new Date(a.dateRecorded))
                      .map((entry) => (
                        <tr key={entry._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {new Date(entry.dateRecorded).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium">{entry.headCircumference}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {entry.notes || <span className="text-gray-400">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{entry.recordedBy?.fullName || "Unknown"}</div>
                              {entry.recordedBy?.position && (
                                <div className="text-sm text-gray-500">{entry.recordedBy.position}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {pendingDeleteId === entry._id ? (
                              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-red-50 border border-red-200">
                                <span className="text-red-700 text-xs font-medium">Delete?</span>
                                <button
                                  className="px-2 py-0.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                  onClick={() => handleConfirmDelete(entry._id)}
                                  disabled={deletingId === entry._id}
                                >
                                  {deletingId === entry._id ? 'Deleting...' : 'Yes'}
                                </button>
                                <button
                                  className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300"
                                  onClick={handleCancelDelete}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(entry)}
                                  disabled={entry.recordedBy?._id !== user._id}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent"
                                  title={entry.recordedBy?._id !== user._id ? "You can only edit your own entries" : "Edit entry"}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRequestDelete(entry)}
                                  disabled={entry.recordedBy?._id !== user._id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent"
                                  title={entry.recordedBy?._id !== user._id ? "You can only delete your own entries" : "Delete entry"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

function HeadCircEntryForm({ initial, onSubmit, onCancel }) {
  const [headCircumference, setHeadCircumference] = useState(initial?.headCircumference || "");
  const [dateRecorded, setDateRecorded] = useState(
    initial?.dateRecorded 
      ? new Date(initial.dateRecorded).toISOString().slice(0, 10) 
      : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headCircumference || isNaN(headCircumference) || headCircumference < 20 || headCircumference > 60) {
      setError("Please enter a valid head circumference between 20 and 60 cm");
      return;
    }
    
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    
    try {
      await onSubmit({ headCircumference: parseFloat(headCircumference), dateRecorded, notes });
      setSuccessMessage(initial ? "Entry updated successfully!" : "Entry added successfully!");
      if (!initial) {
        setHeadCircumference("");
        setNotes("");
        setDateRecorded(new Date().toISOString().slice(0, 10));
      }
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError("Failed to save head circumference entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Head Circumference (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            min="20"
            max="60"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={headCircumference}
            onChange={(e) => setHeadCircumference(e.target.value)}
            placeholder="Enter head circumference"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={dateRecorded}
            onChange={(e) => setDateRecorded(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes"
            maxLength={500}
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        {initial && (
          <button 
            type="button" 
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (initial ? "Updating..." : "Adding...") : (initial ? "Update Entry" : "Add Entry")}
        </button>
      </div>
    </form>
  );
}

HeadCircEntryForm.propTypes = {
  initial: PropTypes.shape({ headCircumference: PropTypes.number, dateRecorded: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), notes: PropTypes.string, _id: PropTypes.string, }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default HeadCircumference;


