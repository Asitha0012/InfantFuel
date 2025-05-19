import {
  useGetIncomingRequestsQuery,
  useAcceptRequestMutation,
  useDeleteRequestMutation,
  useDeleteConnectionMutation,
} from "../../redux/api/connections";
import { useSelector } from "react-redux";
import { useState } from "react";

const ConnectionRequests = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: requests = [], isLoading, refetch } = useGetIncomingRequestsQuery(undefined, {
    skip: !userInfo?.isAdmin,
  });
  const [acceptRequest] = useAcceptRequestMutation();
  const [deleteRequest] = useDeleteRequestMutation();
  const [deleteConnection] = useDeleteConnectionMutation();
  const [accepting, setAccepting] = useState({});
  const [deleting, setDeleting] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [confirmType, setConfirmType] = useState(null); // "pending" or "accepted"

  const handleAccept = async (id) => {
    setAccepting((prev) => ({ ...prev, [id]: true }));
    try {
      await acceptRequest({ connectionId: id }).unwrap();
      refetch();
    } catch (error) {
      console.error(error);
    }
    setAccepting((prev) => ({ ...prev, [id]: false }));
  };

  const handleDelete = async (id, status) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      if (status === "pending") {
        await deleteRequest({ connectionId: id }).unwrap();
      } else if (status === "accepted") {
        await deleteConnection({ connectionId: id }).unwrap();
      }
      refetch();
    } catch (error) {
      console.error(error);
    }
    setDeleting((prev) => ({ ...prev, [id]: false }));
    setConfirmId(null);
    setConfirmType(null);
  };

  if (!userInfo?.isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto text-center text-gray-500">
        Only healthcare providers can view incoming connection requests.
      </div>
    );
  }

  // Show both pending and accepted requests
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Incoming Connection Requests</h2>
      {isLoading && <div className="text-gray-500">Loading...</div>}
      {!isLoading && requests.length === 0 && (
        <div className="text-gray-500">No incoming requests.</div>
      )}
      <ul className="divide-y">
        {requests.map((req) => (
          <li key={req._id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              {req.from.babyDetails?.fullName && (
                <div className="text-sm text-blue-700 font-semibold">
                  Baby name: {req.from.babyDetails.fullName}
                </div>
              )}
              <div className="font-semibold text-lg">{req.from.fullName}</div>
              <div className="text-sm text-gray-600">
                Address: {req.from.address}
              </div>
              <div className="text-sm text-gray-600">
                Contact: {req.from.contactNumber}
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex gap-2">
              {req.status === "pending" && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={accepting[req._id]}
                  onClick={() => handleAccept(req._id)}
                >
                  {accepting[req._id] ? "Accepting..." : "Accept"}
                </button>
              )}
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                disabled={deleting[req._id]}
                onClick={() => {
                  setConfirmId(req._id);
                  setConfirmType(req.status);
                }}
              >
                Delete
              </button>
              {confirmId === req._id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                      Confirm Delete
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Are you sure you want to delete this {confirmType === "pending" ? "request" : "connection"}?
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => setConfirmId(null)}
                      >
                        Back
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                        onClick={() => handleDelete(req._id, confirmType)}
                        disabled={deleting[req._id]}
                      >
                        {deleting[req._id] ? "Deleting..." : "Yes"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectionRequests;