import { useState } from "react";
import PropTypes from "prop-types";

const Modal = ({
  open,
  onClose,
  data,
  onSave,
  viewMode,
  userInfo,
  onDelete,
}) => {
  const [form, setForm] = useState({
    title: data?.title || "",
    date: data?.date || "",
    place: data?.place || "",
    details: data?.details || "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "title" && e.target.value.trim()) {
      setError(""); // Clear error if title is filled
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setError("Event name is required.");
      return;
    }
    setError("");
    // Only send title, and optional fields if filled
    const eventData = {
      title: form.title.trim(),
    };
    if (form.date) eventData.date = form.date;
    if (form.place) eventData.place = form.place;
    if (form.details) eventData.details = form.details;
    onSave(eventData);
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {viewMode
            ? "Event Details"
            : data?._id
            ? "Edit Event"
            : "Add Event"}
        </h2>
        <div className="space-y-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            disabled={viewMode}
            placeholder="Event"
            className="w-full border px-2 py-1 rounded"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date?.split("T")[0] || ""}
            onChange={handleChange}
            disabled={viewMode}
            className="w-full border px-2 py-1 rounded"
          />
          <input
            name="place"
            value={form.place}
            onChange={handleChange}
            disabled={viewMode}
            placeholder="Place"
            className="w-full border px-2 py-1 rounded"
          />
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            disabled={viewMode}
            placeholder="Details"
            className="w-full border px-2 py-1 rounded"
          />
          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded mt-2 text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Added by: {data?.createdBy?.name || userInfo?.fullName}{" "}
          {data?.createdBy?.position || userInfo?.position
            ? `(${data?.createdBy?.position || userInfo?.position})`
            : ""}
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
          {!viewMode && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
            >
              Save
            </button>
          )}
          {!viewMode && onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  viewMode: PropTypes.bool,
  userInfo: PropTypes.object,
  onDelete: PropTypes.func,
};

export default Modal;