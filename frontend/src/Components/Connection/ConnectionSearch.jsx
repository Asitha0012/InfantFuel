import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useSearchUsersQuery,
  useSendRequestMutation,
  useAddConnectionDirectMutation,
  useDeleteRequestMutation,
} from "../../redux/api/connections";

const ConnectionSearch = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [actionStatus, setActionStatus] = useState({});
  const [confirmCancelId, setConfirmCancelId] = useState(null); // For confirmation modal

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: results = [], isFetching, refetch } = useSearchUsersQuery(
    debounced ? { q: debounced } : {},
    { skip: !debounced }
  );
  const [sendRequest] = useSendRequestMutation();
  const [addDirect] = useAddConnectionDirectMutation();
  const [deleteRequest] = useDeleteRequestMutation();

  const handleSendRequest = async (to) => {
    setActionStatus((prev) => ({ ...prev, [to]: "pending" }));
    try {
      await sendRequest({ to }).unwrap();
      setActionStatus((prev) => ({ ...prev, [to]: "sent" }));
      refetch();
    } catch {
      setActionStatus((prev) => ({ ...prev, [to]: "error" }));
    }
  };

  const handleAddDirect = async (to) => {
    setActionStatus((prev) => ({ ...prev, [to]: "pending" }));
    try {
      await addDirect({ to }).unwrap();
      setActionStatus((prev) => ({ ...prev, [to]: "added" }));
      refetch();
    } catch {
      setActionStatus((prev) => ({ ...prev, [to]: "error" }));
    }
  };

  const handleCancelRequest = async (to, connectionId) => {
    setActionStatus((prev) => ({ ...prev, [to]: "pending" }));
    try {
      await deleteRequest({ connectionId }).unwrap();
      setActionStatus((prev) => ({ ...prev, [to]: undefined }));
      refetch();
    } catch {
      setActionStatus((prev) => ({ ...prev, [to]: "error" }));
    }
    setConfirmCancelId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">Search Network</h2>
      <input
        type="text"
        className="border rounded px-3 py-2 flex-1 mb-4 w-full"
        placeholder={
          userInfo.isAdmin
            ? "Search by baby or parent name"
            : "Search by provider name or registration number"
        }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isFetching && <div className="text-gray-500">Searching...</div>}
      {debounced && !isFetching && results.length === 0 && (
        <div className="text-gray-500">No results found.</div>
      )}
      {debounced && (
        <ul className="divide-y">
          {results.map((user) => (
            <li key={user._id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                {user.professionalRegistrationNumber ? (
                  <>
                    <div className="font-semibold text-lg">{user.fullName}</div>
                    <div className="text-sm text-gray-600">
                      Reg No: {user.professionalRegistrationNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      Contact: {user.contactNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.position}
                    </div>
                    <div className="text-sm text-gray-600">{user.district}</div>
                  </>
                ) : (
                  <>
                    {user.babyDetails?.fullName && (
                      <div className="text-sm text-blue-700 font-semibold">
                        Baby name: {user.babyDetails.fullName}
                      </div>
                    )}
                    <div className="font-semibold text-lg">{user.fullName}</div>
                    <div className="text-sm text-gray-600">
                      Address: {user.address}
                    </div>
                    <div className="text-sm text-gray-600">
                      Contact: {user.contactNumber}
                    </div>
                  </>
                )}
              </div>
              <div className="mt-2 md:mt-0 flex flex-col items-end">
                {user.connectionStatus === "accepted" ? (
                  <span className="text-green-600 font-semibold">
                    {userInfo.isAdmin ? "Added" : "Connected"}
                  </span>
                ) : userInfo.isAdmin ? (
                  user.connectionStatus === "pending" ? (
                    <span className="text-orange-600 font-semibold">
                      Pending
                    </span>
                  ) : (
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      disabled={actionStatus[user._id] === "pending" || actionStatus[user._id] === "added"}
                      onClick={() => handleAddDirect(user._id)}
                    >
                      {actionStatus[user._id] === "added"
                        ? "Added"
                        : actionStatus[user._id] === "pending"
                        ? "Adding..."
                        : "Add Direct"}
                    </button>
                  )
                ) : user.connectionStatus === "pending" && user.connectionId ? (
                  <>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      disabled={actionStatus[user._id] === "pending"}
                      onClick={() => setConfirmCancelId(user._id)}
                    >
                      {actionStatus[user._id] === "pending"
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                    <span className="text-green-600 text-xs mt-1">
                      Request has been successfully sent
                    </span>
                    {/* Confirmation Modal */}
                    {confirmCancelId === user._id && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Confirm Cancel
                          </h3>
                          <p className="mb-6 text-gray-600">
                            Are you sure you want to cancel this request?
                          </p>
                          <div className="flex justify-end space-x-2">
                            <button
                              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                              onClick={() => setConfirmCancelId(null)}
                            >
                              Back
                            </button>
                            <button
                              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                              onClick={() => handleCancelRequest(user._id, user.connectionId)}
                              disabled={actionStatus[user._id] === "pending"}
                            >
                              {actionStatus[user._id] === "pending"
                                ? "Cancelling..."
                                : "Yes, Cancel"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : user.connectionStatus === "pending" ? (
                  <span className="text-orange-600 text-xs mt-1">
                    (Unable to cancel: missing connectionId)
                  </span>
                ) : (
                  <button
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    disabled={actionStatus[user._id] === "pending"}
                    onClick={() => handleSendRequest(user._id)}
                  >
                    {actionStatus[user._id] === "pending"
                      ? "Sending..."
                      : "Send Request"}
                  </button>
                )}
                {actionStatus[user._id] === "error" && (
                  <div className="text-red-600 text-xs mt-1">Error. Try again.</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConnectionSearch;