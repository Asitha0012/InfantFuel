import { useState, useEffect } from "react";
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
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import PropTypes from "prop-types";
import WHOHeadCircGraph from "../../Components/WHOHeadCircGraph";

const HeadCircumference = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);
  const isProvider = user?.isAdmin === true;
  const isParent = user?.isAdmin === false;

  const { data: connectedProfiles = [], isLoading: loadingProfiles } = useGetConnectedBabyProfilesForHeadCircQuery(undefined, { skip: !isProvider });

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  useEffect(() => {
    if (isProvider && connectedProfiles.length > 0 && !selectedProfileId) setSelectedProfileId(connectedProfiles[0]._id);
    if (isParent) setSelectedProfileId(user._id);
  }, [isProvider, isParent, connectedProfiles, user, selectedProfileId]);

  const { data: hcData, isLoading: loadingHC, error: hcError, refetch } = useGetHeadCircHistoryQuery(selectedProfileId, { skip: !selectedProfileId });
  const [addEntry] = useAddHeadCircEntryMutation();
  const [updateEntry] = useUpdateHeadCircEntryMutation();
  const [deleteEntry] = useDeleteHeadCircEntryMutation();

  const [editEntry, setEditEntry] = useState(null);
  const [showWHO, setShowWHO] = useState(true);

  const handleProfileSelect = (id) => { setSelectedProfileId(id); setEditEntry(null); };
  const handleEdit = (entry) => setEditEntry(entry);
  const handleDelete = async (entry) => {
    const confirmed = window.confirm(`Delete this head circumference entry?\n\nHead Circ: ${entry.headCircumference} cm\nDate: ${new Date(entry.dateRecorded).toLocaleDateString()}\n${entry.notes ? `Notes: ${entry.notes}` : ''}`);
    if (!confirmed) return;
    try { await deleteEntry({ babyId: selectedProfileId, entryId: entry._id }); refetch(); } catch (err) { window.alert?.('Failed to delete entry.'); console.error(err); }
  };
  const handleSubmit = async (form) => {
    if (form.headCircumference < 20 || form.headCircumference > 60) { window.alert?.(`Invalid head circumference: ${form.headCircumference} cm.`); return; }
    try {
      if (editEntry) await updateEntry({ babyId: selectedProfileId, entryId: editEntry._id, ...form });
      else await addEntry({ babyId: selectedProfileId, ...form });
      setEditEntry(null);
      await refetch();
    } catch (err) { window.alert?.('Failed to save entry.'); console.error(err); }
  };

  const entries = hcData?.entries || [];
  const babyProfile = hcData?.babyProfile || (isProvider ? connectedProfiles.find((p) => p._id === selectedProfileId) : user);

  const [searchTerm, setSearchTerm] = useState("");
  const filteredProfiles = connectedProfiles.filter(profile => {
    const parentName = profile.fullName?.toLowerCase() || "";
    const babyName = profile.babyDetails?.fullName?.toLowerCase() || "";
    return parentName.includes(searchTerm.toLowerCase()) || babyName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 w-full max-w-7xl mx-auto py-8 px-4 gap-8">
        {isProvider && (
          <aside className="w-64 bg-white rounded-lg shadow p-4 h-fit self-start">
            <h2 className="font-bold text-lg mb-4">Connected Baby Profiles</h2>
            <div className="mb-2">
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Search by parent or baby name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} disabled={loadingProfiles || connectedProfiles.length === 0} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Baby Profile</label>
              <select className="w-full border rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedProfileId || ""} onChange={e => handleProfileSelect(e.target.value)} disabled={loadingProfiles || filteredProfiles.length === 0}>
                <option value="" disabled>{loadingProfiles ? "Loading..." : filteredProfiles.length === 0 ? "No connected profiles" : "Select a profile"}</option>
                {filteredProfiles.map(profile => (<option key={profile._id} value={profile._id}>{profile.fullName}</option>))}
              </select>
            </div>
            {selectedProfileId && (
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded mb-2">
                <div>
                  <div className="font-semibold">{filteredProfiles.find(p => p._id === selectedProfileId)?.fullName}</div>
                  <div className="text-xs text-gray-500">{filteredProfiles.find(p => p._id === selectedProfileId)?.babyDetails?.gender}</div>
                </div>
              </div>
            )}
          </aside>
        )}
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Head Circumference Tracking</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/tracker")} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 shadow transition">
                <span style={{fontSize: '1.2em'}}>&larr;</span> Back to Tracker
              </button>
              <button className={`px-4 py-2 rounded font-medium border transition ${showWHO ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"}`} onClick={() => setShowWHO((v) => !v)}>
                {showWHO ? "Hide WHO Standard" : "Compare with WHO Standard"}
              </button>
            </div>
          </div>

          <section className="bg-white rounded-lg shadow p-6">
            {loadingHC ? <Loader /> : hcError ? <div className="text-red-500">Error loading head circumference data</div> : (
              <WHOHeadCircGraph key={`${selectedProfileId}-${entries.length}-${JSON.stringify(entries.map(e => e._id))}`} entries={entries} babyProfile={babyProfile} showWHO={showWHO} />
            )}
          </section>

          {(isProvider || isParent) && selectedProfileId ? (
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold text-lg mb-4">{editEntry ? "Edit Head Circumference Entry" : "Add Head Circumference Entry"}</h2>
              <HeadCircEntryForm initial={editEntry} onSubmit={handleSubmit} onCancel={() => setEditEntry(null)} />
            </section>
          ) : null}

          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg mb-4">Head Circumference Entries</h2>
            {loadingHC ? <Loader /> : entries.length === 0 ? <div className="text-gray-500">No entries yet.</div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Head Circumference (cm)</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                      <th className="px-4 py-2 text-left">Recorded By</th>
                      {isProvider && <th className="px-4 py-2">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry._id} className="border-b">
                        <td className="px-4 py-2">{new Date(entry.dateRecorded).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{entry.headCircumference}</td>
                        <td className="px-4 py-2">{entry.notes || "-"}</td>
                        <td className="px-4 py-2">{entry.recordedBy?.fullName || "-"}</td>
                        {isProvider && (
                          <td className="px-4 py-2 flex gap-2">
                            <button className="text-blue-600 hover:underline" onClick={() => handleEdit(entry)} disabled={entry.recordedBy?._id !== user._id} title={entry.recordedBy?._id !== user._id ? "You can only edit your own entries" : "Edit"}>Edit</button>
                            <button className="text-red-600 hover:underline" onClick={() => handleDelete(entry)} disabled={entry.recordedBy?._id !== user._id} title={entry.recordedBy?._id !== user._id ? "You can only delete your own entries" : "Delete"}>Delete</button>
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

function HeadCircEntryForm({ initial, onSubmit, onCancel }) {
  const [headCircumference, setHeadCircumference] = useState(initial?.headCircumference || "");
  const [dateRecorded, setDateRecorded] = useState(initial?.dateRecorded ? new Date(initial.dateRecorded).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!headCircumference || isNaN(headCircumference) || headCircumference < 20 || headCircumference > 60) { setError("Please enter a valid head circumference between 20 and 60 cm"); return; }
    setError("");
    onSubmit({ headCircumference: parseFloat(headCircumference), dateRecorded, notes });
    if (!initial) { setHeadCircumference(""); setNotes(""); setDateRecorded(new Date().toISOString().slice(0, 10)); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block font-medium mb-1 text-sm">Head Circ. (cm)</label>
          <input type="number" step="0.1" min="20" max="60" className="w-full border rounded px-3 py-2" value={headCircumference} onChange={(e) => setHeadCircumference(e.target.value)} placeholder="Enter head circumference" required />
        </div>
        <div>
          <label className="block font-medium mb-1 text-sm">Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={dateRecorded} onChange={(e) => setDateRecorded(e.target.value)} required />
        </div>
        <div>
          <label className="block font-medium mb-1 text-sm">Notes (optional)</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes" maxLength={500} />
        </div>
        <div className="flex gap-2">
          {initial && (<button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm" onClick={onCancel}>Cancel</button>)}
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">{initial ? "Update" : "Add Entry"}</button>
        </div>
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


