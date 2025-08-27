import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetConnectedBabyProfilesForHeightQuery,
  useGetHeightHistoryQuery,
  useAddHeightEntryMutation,
  useUpdateHeightEntryMutation,
  useDeleteHeightEntryMutation,
} from "../../redux/api/heights";
import Loader from "../../Components/Loader";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import PropTypes from "prop-types";
import WHOHeightGraph from "../../Components/WHOHeightGraph";

const Height = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);
  const isProvider = user?.isAdmin === true;
  const isParent = user?.isAdmin === false;

  const { data: connectedProfiles = [], isLoading: loadingProfiles } = useGetConnectedBabyProfilesForHeightQuery(undefined, { skip: !isProvider });

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(connectedProfiles[0]._id);
    }
    if (isParent) {
      setSelectedProfileId(user._id);
    }
  }, [isProvider, isParent, connectedProfiles, user, selectedProfileId]);

  const { data: heightData, isLoading: loadingHeights, error: heightsError, refetch } = useGetHeightHistoryQuery(selectedProfileId, { skip: !selectedProfileId });
  const [addHeightEntry] = useAddHeightEntryMutation();
  const [updateHeightEntry] = useUpdateHeightEntryMutation();
  const [deleteHeightEntry] = useDeleteHeightEntryMutation();

  const [editEntry, setEditEntry] = useState(null);
  const [showWHO, setShowWHO] = useState(true);

  const handleProfileSelect = (id) => {
    setSelectedProfileId(id);
    setEditEntry(null);
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(
      `Delete this height entry?\n\nHeight: ${entry.height} cm\nDate: ${new Date(entry.dateRecorded).toLocaleDateString()}\n${entry.notes ? `Notes: ${entry.notes}` : ''}`
    );
    if (confirmed) {
      try {
        await deleteHeightEntry({ babyId: selectedProfileId, entryId: entry._id });
        refetch();
      } catch (err) {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Failed to delete height entry.');
        }
        console.error('Delete error:', err);
      }
    }
  };

  const handleSubmit = async (form) => {
    if (form.height <= 0 || form.height > 130) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`Invalid height: ${form.height} cm. Please enter a height between 0.1 and 130 cm.`);
      }
      return;
    }
    try {
      if (editEntry) {
        await updateHeightEntry({ babyId: selectedProfileId, entryId: editEntry._id, ...form });
      } else {
        await addHeightEntry({ babyId: selectedProfileId, ...form });
      }
      setEditEntry(null);
      await refetch();
    } catch (err) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Failed to save height entry.');
      }
      console.error('Save error:', err);
    }
  };

  const entries = heightData?.entries || [];
  const babyProfile = heightData?.babyProfile || (isProvider ? connectedProfiles.find((p) => p._id === selectedProfileId) : user);

  // Search/filter state for connected profiles (similar to Weight)
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProfiles = connectedProfiles.filter(profile => {
    const parentName = profile.fullName?.toLowerCase() || "";
    const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
    return (
      parentName.includes(searchTerm.toLowerCase()) ||
      babyName.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto py-8 px-4 gap-8">
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
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Height Tracking</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/tracker")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 shadow transition"
              >
                <span style={{fontSize: '1.2em'}}>&larr;</span> Back to Tracker
              </button>
              <button
                className={`px-4 py-2 rounded font-medium border transition ${
                  showWHO ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => setShowWHO((v) => !v)}
              >
                {showWHO ? "Hide WHO Standard" : "Compare with WHO Standard"}
              </button>
            </div>
          </div>

          <section className="bg-white rounded-lg shadow p-6">
            {loadingHeights ? (
              <Loader />
            ) : heightsError ? (
              <div className="text-red-500">Error loading height data</div>
            ) : (
              <WHOHeightGraph
                key={`${selectedProfileId}-${entries.length}-${JSON.stringify(entries.map(e => e._id))}`}
                entries={entries}
                babyProfile={babyProfile}
                showWHO={showWHO}
              />
            )}
          </section>

          {isProvider && selectedProfileId ? (
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg mb-4">{editEntry ? "Edit Height Entry" : "Add Height Entry"}</h2>
              <HeightEntryForm initial={editEntry} onSubmit={handleSubmit} onCancel={() => setEditEntry(null)} />
            </section>
          ) : null}

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Height Entries</h2>
            {loadingHeights ? (
              <Loader />
            ) : entries.length === 0 ? (
              <div className="text-gray-500">No height entries yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Height (cm)</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Recorded By</th>
                      {isProvider && <th className="px-4 py-2">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry._id} className="border-b">
                        <td className="px-4 py-2">{new Date(entry.dateRecorded).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{entry.height}</td>
                        <td className="px-4 py-2">{entry.notes || "-"}</td>
                        <td className="px-4 py-2">{entry.recordedBy?.fullName || "-"}</td>
                        {isProvider && (
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => handleEdit(entry)}
                              disabled={entry.recordedBy?._id !== user._id}
                              title={entry.recordedBy?._id !== user._id ? "You can only edit your own entries" : "Edit"}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => handleDelete(entry)}
                              disabled={entry.recordedBy?._id !== user._id}
                              title={entry.recordedBy?._id !== user._id ? "You can only delete your own entries" : "Delete"}
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

function SimpleHeightChart({ entries, babyProfile }) {
  // Simple list visualization placeholder; can be replaced with recharts-based height-for-age later
  return (
    <div>
      <h3 className="font-semibold mb-2">Recent Heights</h3>
      {entries.length === 0 ? (
        <div className="text-gray-500">No data</div>
      ) : (
        <ul className="list-disc list-inside">
          {entries.slice().sort((a,b) => new Date(a.dateRecorded) - new Date(b.dateRecorded)).map((e) => (
            <li key={e._id}>{new Date(e.dateRecorded).toLocaleDateString()}: {e.height} cm {e.notes ? `- ${e.notes}` : ''}</li>
          ))}
        </ul>
      )}
      {babyProfile?.babyDetails?.lengthAtBirth && (
        <div className="mt-2 text-sm text-gray-600">Birth length: {babyProfile.babyDetails.lengthAtBirth} cm</div>
      )}
    </div>
  );
}

SimpleHeightChart.propTypes = {
  entries: PropTypes.array,
  babyProfile: PropTypes.object,
};

function HeightEntryForm({ initial, onSubmit, onCancel }) {
  const [height, setHeight] = useState(initial?.height || "");
  const [dateRecorded, setDateRecorded] = useState(
    initial?.dateRecorded ? new Date(initial.dateRecorded).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!height || isNaN(height) || height <= 0 || height > 130) {
      setError("Please enter a valid height between 0.1 and 130 cm");
      return;
    }
    setError("");
    onSubmit({ height: parseFloat(height), dateRecorded, notes });
    if (!initial) {
      setHeight("");
      setNotes("");
      setDateRecorded(new Date().toISOString().slice(0, 10));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block font-medium mb-1 text-sm">Height (cm)</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="130"
            className="w-full border rounded px-3 py-2"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter height"
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
            <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm" onClick={onCancel}>Cancel</button>
          )}
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">{initial ? "Update" : "Add Entry"}</button>
        </div>
      </div>
    </form>
  );
}

HeightEntryForm.propTypes = {
  initial: PropTypes.shape({
    height: PropTypes.number,
    dateRecorded: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    notes: PropTypes.string,
    _id: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default Height;


