// src/components/Vaccinations.js
import React, { useState } from "react";
import {
  useGetVaccinationsQuery,
  useAddVaccinationMutation,
  useUpdateVaccinationMutation,
  useDeleteVaccinationMutation,
} from "../redux/api/vaccinations";

const Vaccinations = ({ childId }) => {
  const { data: vaccinations, isLoading, error } = useGetVaccinationsQuery(childId);
  const [addVaccination] = useAddVaccinationMutation();
  const [updateVaccination] = useUpdateVaccinationMutation();
  const [deleteVaccination] = useDeleteVaccinationMutation();

  const [formData, setFormData] = useState({
    vaccineName: "",
    dateAdministered: "",
    nextDueDate: "",
    administeredBy: "",
    notes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await addVaccination({ childId, vaccination: formData });
    setFormData({
      vaccineName: "",
      dateAdministered: "",
      nextDueDate: "",
      administeredBy: "",
      notes: "",
    });
  };

  const handleDelete = async (vaccinationId) => {
    await deleteVaccination({ childId, vaccinationId });
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading vaccinations</p>;

  return (
    <div className="vaccinations-container">
      <h2>Vaccinations</h2>

      {/* Add Vaccination Form */}
      <form onSubmit={handleAdd}>
        <input
          type="text"
          name="vaccineName"
          placeholder="Vaccine Name"
          value={formData.vaccineName}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dateAdministered"
          value={formData.dateAdministered}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="nextDueDate"
          value={formData.nextDueDate}
          onChange={handleChange}
        />
        <input
          type="text"
          name="administeredBy"
          placeholder="Administered By"
          value={formData.administeredBy}
          onChange={handleChange}
        />
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
        <button type="submit">Add Vaccination</button>
      </form>

      {/* Vaccination List */}
      <ul>
        {vaccinations && vaccinations.length > 0 ? (
          vaccinations.map((v) => (
            <li key={v._id}>
              <strong>{v.vaccineName}</strong> - Administered:{" "}
              {new Date(v.dateAdministered).toLocaleDateString()}{" "}
              {v.nextDueDate && `(Next: ${new Date(v.nextDueDate).toLocaleDateString()})`}
              <br />
              Administered By: {v.administeredBy || "-"}
              <br />
              Notes: {v.notes || "-"}
              <br />
              <button onClick={() => handleDelete(v._id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No vaccinations recorded.</p>
        )}
      </ul>
    </div>
  );
};

export default Vaccinations;
