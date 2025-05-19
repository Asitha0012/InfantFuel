import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useSearchUsersQuery,
  useSendRequestMutation,
  useAddConnectionDirectMutation,
  useGetConnectionsQuery,
  useDeleteRequestMutation,
} from "../../redux/api/connections";

const ConnectionSearch = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [actionStatus, setActionStatus] = useState({});

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: results = [], isFetching } = useSearchUsersQuery(
    debounced ? { q: debounced } : {},
    { skip: !debounced }
  );
  const { data: connectionsData, refetch } = useGetConnectionsQuery();
  const [sendRequest] = useSendRequestMutation();
  const [addDirect] = useAddConnectionDirectMutation();
  const [deleteRequest] = useDeleteRequestMutation();

  // Find all connected and pending request user IDs from backend data
  const connectedIds = new Set([
    ...(connectionsData?.asFrom || []).filter(c => c.status === "accepted").map((c) => c.to._id),
    ...(connectionsData?.asTo || []).filter(c => c.status === "accepted").map((c) => c.from._id),
  ]);
  const pendingIds = new Set([
    ...(connectionsData?.asFrom || []).filter(c => c.status === "pending").map((c) => c.to._id),
  ]);

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

  const handleCancelRequest = async (to) => {
    setActionStatus((prev) => ({ ...prev, [to]: "pending" }));
    try {
      await deleteRequest({ connectionId: findPendingConnectionId(to) }).unwrap();
      setActionStatus((prev) => ({ ...prev, [to]: undefined }));
      refetch();
    } catch {
      setActionStatus((prev) => ({ ...prev, [to]: "error" }));
    }
  };

  // Helper to find the pending connectionId for a user
  const findPendingConnectionId = (toId) => {
    const pending = (connectionsData?.asFrom || []).find(
      (c) => c.to._id === toId && c.status === "pending"
    );
    return pending ? pending._id : null;
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
                {connectedIds.has(user._id) ? (
                  <span className="text-green-600 font-semibold">
                    {userInfo.isAdmin ? "Added" : "Connected"}
                  </span>
                ) : userInfo.isAdmin ? (
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
                ) : pendingIds.has(user._id) ? (
                  <>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      disabled={actionStatus[user._id] === "pending"}
                      onClick={() => handleCancelRequest(user._id)}
                    >
                      {actionStatus[user._id] === "pending"
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                    <span className="text-orange-600 text-xs mt-1">
                      Request has been successfully sent
                    </span>
                  </>
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