import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetConnectedBabyProfilesQuery,
  useGetWeightHistoryQuery,
  useAddWeightEntryMutation,
  useUpdateWeightEntryMutation,
  useDeleteWeightEntryMutation,
} from "../../redux/api/weights";
import WHOGraph from "../../Components/WHOgraph";
import Loader from "../../Components/Loader";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import PropTypes from "prop-types";

const Weight = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);
  const isProvider = user?.isAdmin === true;
  const isParent = user?.isAdmin === false;
  
  // Form states
  const [weightForm, setWeightForm] = useState({
    weight: "",
    ageMonths: "",
    ageYears: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Sidebar: connected baby profiles (providers only)
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

  // WHO overlay toggle
  const [showWHO, setShowWHO] = useState(true);

  // Weight entry form state
  const [editEntry, setEditEntry] = useState(null);

  // Fetch weight history for selected profile
  const {
    data: weightData,
    isLoading: loadingWeights,
    error: weightsError,
    refetch,
  } = useGetWeightHistoryQuery(selectedProfileId, { skip: !selectedProfileId });

  const [addWeightEntry] = useAddWeightEntryMutation();
  const [updateWeightEntry] = useUpdateWeightEntryMutation();
  const [deleteWeightEntry] = useDeleteWeightEntryMutation();

  // Handlers
  const handleProfileSelect = (id) => {
    setSelectedProfileId(id);
    setEditEntry(null);
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
  };

  const handleDelete = async (entry) => {
    // Custom confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete this weight entry?\n\nWeight: ${entry.weight}kg\nDate: ${new Date(entry.dateRecorded).toLocaleDateString()}\n${entry.notes ? `Notes: ${entry.notes}` : ''}`
    );
    
    if (confirmed) {
      try {
        await deleteWeightEntry({ babyId: selectedProfileId, entryId: entry._id });
        refetch();
      } catch (err) {
        // Show error notification
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Failed to delete weight entry. Please try again.');
        }
        console.error('Delete error:', err);
      }
    }
  };

  const handleModalSubmit = async (form) => {
    // Validate weight range
    if (form.weight <= 0 || form.weight > 25) {
      // Show toast notification for invalid weight
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Invalid weight: ${form.weight}kg. Please enter a weight between 0.1kg and 25kg.`);
      }
      return; // Don't proceed with submission
    }

    try {
      console.log('Submitting weight entry:', form, 'for baby:', selectedProfileId);
      
      if (editEntry) {
        const result = await updateWeightEntry({
          babyId: selectedProfileId,
          entryId: editEntry._id,
          ...form,
        });
        console.log('Update result:', result);
      } else {
        const result = await addWeightEntry({ babyId: selectedProfileId, ...form });
        console.log('Add result:', result);
      }
      setEditEntry(null);
      // RTK Query should automatically invalidate cache, but we can still refetch for safety
      await refetch();
      console.log('Weight entry submitted successfully, cache should update');
    } catch (err) {
      // Show error notification
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Failed to save weight entry. Please try again.');
      }
      console.error('Save error:', err);
    }
  };

  // Prepare entries and babyProfile for graph
  const entries = weightData?.entries || [];
  const babyProfile = weightData?.babyProfile?.babyDetails
    ? weightData.babyProfile
    : isProvider
    ? connectedProfiles.find((p) => p._id === selectedProfileId)
    : user;

  // Debug logging for data flow
  console.log('Weight Component Debug:', {
    selectedProfileId,
    weightDataLoading: loadingWeights,
    weightDataError: weightsError,
    entriesCount: entries.length,
    entries: entries.map(e => ({ id: e._id, weight: e.weight, date: e.dateRecorded })),
    babyProfile: babyProfile?.fullName || 'No profile'
  });

  // Search/filter state for connected profiles
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProfiles = connectedProfiles.filter(profile => {
    const parentName = profile.fullName?.toLowerCase() || "";
    const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
    return (
      parentName.includes(searchTerm.toLowerCase()) ||
      babyName.includes(searchTerm.toLowerCase())
    );
  });

  // UI
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto py-8 px-4 gap-8">
        {/* Removed absolute Back to Tracker button, now placed inline above */}
        {/* Sidebar for providers */}
        {isProvider && (
          <aside className="w-64 bg-white rounded-lg shadow p-4 h-fit self-start">
            <h2 className="font-bold text-lg mb-4">Connected Baby Profiles</h2>
            {/* Search input for filtering connected profiles */}
            <div className="mb-2">
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search by parent or baby name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={loadingProfiles || connectedProfiles.length === 0}
              />
            </div>
            {/* Dropdown for selecting profile */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Baby Profile</label>
              <select
                className="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedProfileId || ""}
                onChange={e => handleProfileSelect(e.target.value)}
                disabled={loadingProfiles || filteredProfiles.length === 0}
              >
                <option value="" disabled>
                  {loadingProfiles
                    ? "Loading..."
                    : filteredProfiles.length === 0
                    ? "No connected profiles"
                    : "Select a profile"}
                </option>
                {filteredProfiles.map(profile => (
                  <option key={profile._id} value={profile._id}>
                    {profile.fullName}
                  </option>
                ))}
              </select>
            </div>
            {/* Show selected profile info */}
            {selectedProfileId && (
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded mb-2">
                <div>
                  <div className="font-semibold">
                    {filteredProfiles.find(p => p._id === selectedProfileId)?.fullName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {filteredProfiles.find(p => p._id === selectedProfileId)?.babyDetails?.gender}
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
        {/* Main content */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Weight Tracking</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/tracker")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 shadow transition"
              >
                <span style={{fontSize: '1.2em'}}>&larr;</span> Back to Tracker
              </button>
              <button
                className={`px-4 py-2 rounded font-medium border transition ${
                  showWHO
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setShowWHO((v) => !v)}
              >
                {showWHO ? "Hide WHO Standard" : "Compare with WHO Standard"}
              </button>
            </div>
          </div>
          {/* Graph */}
          <section className="bg-white rounded-lg shadow p-6">
            {loadingWeights ? (
              <Loader />
            ) : weightsError ? (
              <div className="text-red-500">Error loading weight data</div>
            ) : (
              <WHOGraph
                key={`${selectedProfileId}-${entries.length}-${JSON.stringify(entries.map(e => e._id))}`}
                entries={entries}
                babyProfile={babyProfile || (isParent ? user : null)}
                showWHO={showWHO}
              />
            )}
          </section>
          
          {/* Direct Entry Form */}
          {isProvider && selectedProfileId ? (
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg mb-4">
                {editEntry ? "Edit Weight Entry" : "Add Weight Entry"}
              </h2>
              <WeightEntryForm
                initial={editEntry}
                onSubmit={handleModalSubmit}
                onCancel={() => {
                  setEditEntry(null);
                }}
              />
            </section>
          ) : null}
          {/* Table of entries */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Weight Entries</h2>
            {loadingWeights ? (
              <Loader />
            ) : entries.length === 0 ? (
              <div className="text-gray-500">No weight entries yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Weight (kg)</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Recorded By</th>
                      {isProvider && <th className="px-4 py-2">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry._id} className="border-b">
                        <td className="px-4 py-2">{new Date(entry.dateRecorded).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{entry.weight}</td>
                        <td className="px-4 py-2">{entry.notes || "-"}</td>
                        <td className="px-4 py-2">{entry.recordedBy?.fullName || "-"}</td>
                        {isProvider && (
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handleEdit(entry)}
                              disabled={entry.recordedBy?._id !== user._id}
                              title={
                                entry.recordedBy?._id !== user._id
                                  ? "You can only edit your own entries"
                                  : "Edit"
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => handleDelete(entry)}
                              disabled={entry.recordedBy?._id !== user._id}
                              title={
                                entry.recordedBy?._id !== user._id
                                  ? "You can only delete your own entries"
                                  : "Delete"
                              }
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// WeightEntryForm: used for direct entry below the graph
function WeightEntryForm({ initial, onSubmit, onCancel }) {
  const [weight, setWeight] = useState(initial?.weight || "");
  const [ageInMonths, setAgeInMonths] = useState(initial?.ageInMonths || "");
  const [dateRecorded, setDateRecorded] = useState(
    initial?.dateRecorded ? new Date(initial.dateRecorded).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate weight
    if (!weight || isNaN(weight) || weight <= 0 || weight > 30) {
      setError("Please enter a valid weight between 0.1kg and 30kg");
      return;
    }

    // Validate age in months
    const months = parseInt(ageInMonths) || 0;
    if (months < 0 || months > 60) {
      setError("Age must be between 0 and 60 months (5 years)");
      return;
    }

    setError(""); // Clear any existing error
    onSubmit({ 
      weight: parseFloat(weight), 
      dateRecorded, 
      notes,
      ageInMonths: months
    });

    // Reset form if it's a new entry (not editing)
    if (!initial) {
      setWeight("");
      setAgeInMonths("");
      setNotes("");
      setDateRecorded(new Date().toISOString().slice(0, 10));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block font-medium mb-1 text-sm">Weight (kg)</label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            max="30"
            className="w-full border rounded px-3 py-2"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight"
            required
          />
        </div>
        
        <div>
          <label className="block font-medium mb-1 text-sm">Age (months)</label>
          <input
            type="number"
            min="0"
            max="60"
            className="w-full border rounded px-3 py-2"
            value={ageInMonths}
            onChange={(e) => setAgeInMonths(Math.min(60, Math.max(0, parseInt(e.target.value) || 0)))}
            placeholder="Enter age in months"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-sm">Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={dateRecorded}
            onChange={(e) => setDateRecorded(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-sm">Notes (optional)</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes"
            maxLength={500}
          />
        </div>
        <div className="flex gap-2">
          {initial && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            {initial ? "Update" : "Add Entry"}
          </button>
        </div>
      </div>
    </form>
  );
}

WeightEntryForm.propTypes = {
  initial: PropTypes.shape({
    weight: PropTypes.number,
    dateRecorded: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    notes: PropTypes.string,
    _id: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default Weight;
