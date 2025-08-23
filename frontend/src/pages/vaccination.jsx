import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  useGetVaccinationsQuery,
  useAddVaccinationMutation,
  useUpdateVaccinationMutation,
  useDeleteVaccinationMutation,
} from '../redux/api/vaccinations';

const VaccinationPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const isHealthcareProvider = userInfo?.userType === 'healthcareProvider';
  
  const [vaccinations, setVaccinations] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [connectedBabies, setConnectedBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    vaccineName: '',
    dateGiven: '',
    nextDueDate: '',
    doseNumber: '',
    notes: '',
    administeredBy: userInfo?.fullName || ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch connected babies
  useEffect(() => {
    const fetchConnectedBabies = async () => {
      try {
        const { data } = await axios.get('/api/v1/connections');
        const babies = data.filter(user => user.userType === 'parent');
        setConnectedBabies(babies);
        if (babies.length > 0) {
          setSelectedBaby(babies[0]._id);
        }
      } catch (error) {
        toast.error('Failed to fetch connected babies');
      }
    };

    if (isHealthcareProvider) {
      fetchConnectedBabies();
    } else {
      // For parents, set their own profile
      setSelectedBaby(userInfo._id);
    }
  }, [isHealthcareProvider, userInfo._id]);

  // Fetch vaccinations using RTK Query
  const { data: vaccinationData, isLoading: isLoadingVaccinations } = useGetVaccinationsQuery(
    selectedBaby,
    { skip: !selectedBaby }
  );

  useEffect(() => {
    if (vaccinationData) {
      setVaccinations(vaccinationData);
    }
  }, [vaccinationData]);

  useEffect(() => {
    setLoading(isLoadingVaccinations);
  }, [isLoadingVaccinations]);

  // RTK Query mutations
  const [addVaccination] = useAddVaccinationMutation();
  const [updateVaccination] = useUpdateVaccinationMutation();
  const [deleteVaccination] = useDeleteVaccinationMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isHealthcareProvider) return;

    try {
      if (editMode) {
        await updateVaccination({
          babyId: selectedBaby,
          id: editingId,
          data: formData
        }).unwrap();
        toast.success('Vaccination record updated successfully');
      } else {
        await addVaccination({
          babyId: selectedBaby,
          data: formData
        }).unwrap();
        toast.success('Vaccination record added successfully');
      }

      // Reset form
      setFormData({
        vaccineName: '',
        dateGiven: '',
        nextDueDate: '',
        doseNumber: '',
        notes: '',
        administeredBy: userInfo?.fullName || ''
      });
      setEditMode(false);
      setEditingId(null);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save vaccination record');
    }
  };

  const handleEdit = (vaccination) => {
    if (!isHealthcareProvider) return;

    setEditMode(true);
    setEditingId(vaccination._id);
    setFormData({
      vaccineName: vaccination.vaccineName,
      dateGiven: format(new Date(vaccination.dateGiven), 'yyyy-MM-dd'),
      nextDueDate: vaccination.nextDueDate 
        ? format(new Date(vaccination.nextDueDate), 'yyyy-MM-dd')
        : '',
      doseNumber: vaccination.doseNumber,
      notes: vaccination.notes || '',
      administeredBy: vaccination.administeredBy || userInfo?.fullName || ''
    });
  };

  const handleDelete = async (id) => {
    if (!isHealthcareProvider || !window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await deleteVaccination({
        babyId: selectedBaby,
        id
      }).unwrap();
      toast.success('Vaccination record deleted successfully');
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete vaccination record');
    }
  };

  if (!userInfo) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vaccination Records</h1>

      {/* Baby Selection Dropdown for Healthcare Providers */}
      {isHealthcareProvider && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Baby
          </label>
          <select
            value={selectedBaby || ''}
            onChange={(e) => setSelectedBaby(e.target.value)}
            className="w-full p-2 border rounded-md"
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

      {/* Vaccination Form for Healthcare Providers */}
      {isHealthcareProvider && selectedBaby && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine Name
              </label>
              <input
                type="text"
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Given
              </label>
              <input
                type="date"
                value={formData.dateGiven}
                onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dose Number
              </label>
              <input
                type="text"
                value={formData.doseNumber}
                onChange={(e) => setFormData({ ...formData, doseNumber: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows="2"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {editMode ? 'Update Vaccination' : 'Add Vaccination'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setEditingId(null);
                  setFormData({
                    vaccineName: '',
                    dateGiven: '',
                    nextDueDate: '',
                    doseNumber: '',
                    notes: '',
                    administeredBy: userInfo?.fullName || ''
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Vaccination Records Table */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : vaccinations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaccine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Given
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                {isHealthcareProvider && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vaccinations.map((vaccination) => (
                <tr key={vaccination._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vaccination.vaccineName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(vaccination.dateGiven), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vaccination.nextDueDate
                      ? format(new Date(vaccination.nextDueDate), 'MMM dd, yyyy')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vaccination.doseNumber}
                  </td>
                  <td className="px-6 py-4">
                    {vaccination.notes || '-'}
                  </td>
                  {isHealthcareProvider && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(vaccination)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vaccination._id)}
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
      ) : (
        <div className="text-center py-4 text-gray-500">
          No vaccination records found.
        </div>
      )}
    </div>
  );
};

export default VaccinationPage;
