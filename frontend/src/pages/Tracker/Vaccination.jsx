import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetVaccinationsQuery,
  useAddVaccinationMutation,
  useUpdateVaccinationMutation,
  useDeleteVaccinationMutation,
} from '../../redux/api/vaccinations';
import { useGetConnectedBabiesQuery } from '../../redux/api/connections';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const VaccinationTracker = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [connectedBabies, setConnectedBabies] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  // Healthcare provider check
  const isHealthcareProvider = userInfo?.userType === 'healthcareProvider';

  const [formData, setFormData] = useState({
    vaccineName: '',
    dateGiven: '',
    nextDueDate: '',
    doseNumber: '',
    notes: ''
  });

  // Fetch connected babies for healthcare providers
  const { data: connectedBabiesData } = useGetConnectedBabiesQuery(undefined, {
    skip: !isHealthcareProvider,
  });

  // Set selected baby
  useEffect(() => {
    if (isHealthcareProvider) {
      if (connectedBabiesData && connectedBabiesData.length > 0) {
        setConnectedBabies(connectedBabiesData);
        if (!selectedBaby) {
          setSelectedBaby(connectedBabiesData[0]._id);
        }
      }
    } else {
      setSelectedBaby(userInfo._id); // Parent sees their own baby
    }
  }, [isHealthcareProvider, userInfo._id, connectedBabiesData, selectedBaby]);

  // Fetch vaccination data
  const { data: vaccinationData, isLoading: isLoadingVaccinations } = useGetVaccinationsQuery(
    selectedBaby,
    { skip: !selectedBaby }
  );

  useEffect(() => {
    if (vaccinationData) {
      // Only show vaccinations added by healthcare providers
      const filtered = vaccinationData.entries?.filter(v => v.addedByHealthcare) || [];
      setVaccinations(filtered);
    }
  }, [vaccinationData]);

  useEffect(() => {
    setIsLoading(isLoadingVaccinations);
  }, [isLoadingVaccinations]);

  // RTK Query mutations
  const [addVaccination] = useAddVaccinationMutation();
  const [updateVaccination] = useUpdateVaccinationMutation();
  const [deleteVaccination] = useDeleteVaccinationMutation();

  // Handlers (only for providers)
  const handleDelete = async (entryId) => {
    if (!isHealthcareProvider) return;
    if (window.confirm('Are you sure you want to delete this vaccination record?')) {
      try {
        await deleteVaccination({ babyId: selectedBaby, entryId }).unwrap();
        toast.success('Vaccination record deleted successfully');
      } catch {
        toast.error('Failed to delete vaccination record');
      }
    }
  };

  const handleEdit = (entry) => {
    if (!isHealthcareProvider) return;
    setEditMode(true);
    setEditingEntry(entry);
    setFormData({
      vaccineName: entry.vaccineName,
      dateGiven: format(new Date(entry.dateGiven), 'yyyy-MM-dd'),
      nextDueDate: entry.nextDueDate ? format(new Date(entry.nextDueDate), 'yyyy-MM-dd') : '',
      doseNumber: entry.doseNumber,
      notes: entry.notes || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isHealthcareProvider) return;

    try {
      if (editMode) {
        await updateVaccination({ babyId: selectedBaby, entryId: editingEntry._id, data: formData }).unwrap();
        toast.success('Vaccination record updated successfully');
      } else {
        await addVaccination({ babyId: selectedBaby, data: { ...formData, addedByHealthcare: true } }).unwrap();
        toast.success('Vaccination record added successfully');
      }

      setFormData({ vaccineName: '', dateGiven: '', nextDueDate: '', doseNumber: '', notes: '' });
      setEditMode(false);
      setEditingEntry(null);
    } catch {
      toast.error('Failed to save vaccination record');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Vaccination Records</h2>
            {isHealthcareProvider && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Healthcare Provider
              </span>
            )}
          </div>

          {/* Baby Selection for Healthcare Providers */}
          {isHealthcareProvider && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Baby
              </label>
              <select
                value={selectedBaby || ''}
                onChange={(e) => setSelectedBaby(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a baby</option>
                {connectedBabies.map((baby) => (
                  <option key={baby._id} value={baby._id}>
                    {baby.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form (only for providers) */}
          {isHealthcareProvider && selectedBaby && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editMode ? 'Edit Vaccination Record' : 'Add New Vaccination Record'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaccine Name
                  </label>
                  <input
                    type="text"
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                    required
                    placeholder="Enter vaccine name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dose Number
                  </label>
                  <input
                    type="text"
                    value={formData.doseNumber}
                    onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
                    required
                    placeholder="Enter dose number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Given
                  </label>
                  <input
                    type="date"
                    value={formData.dateGiven}
                    onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    placeholder="Add any additional notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editMode ? 'Update Vaccination' : 'Add Vaccination'}
                </button>
                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setEditingEntry(null);
                      setFormData({ vaccineName: '', dateGiven: '', nextDueDate: '', doseNumber: '', notes: '' });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Vaccination History (viewable by all) */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : vaccinations.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaccine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Given
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Due
                      </th>
                      {isHealthcareProvider && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vaccinations.map((entry) => (
                      <tr key={entry._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{entry.vaccineName}</div>
                            {entry.notes && (
                              <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.doseNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(entry.dateGiven), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.nextDueDate ? format(new Date(entry.nextDueDate), 'MMM d, yyyy') : '-'}
                        </td>
                        {isHealthcareProvider && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="text-red-600 hover:text-red-900"
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
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-lg">
              <div className="text-gray-500">No vaccination records found.</div>
              {isHealthcareProvider && (
                <div className="mt-2 text-sm text-gray-400">
                  Use the form above to add a new vaccination record.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationTracker;
