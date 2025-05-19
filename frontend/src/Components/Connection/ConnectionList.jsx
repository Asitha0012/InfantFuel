import { useGetConnectionsQuery, useDeleteConnectionMutation } from "../../redux/api/connections";
import { useSelector } from "react-redux";
import { useState } from "react";

const ConnectionList = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetConnectionsQuery();
  const [deleteConnection] = useDeleteConnectionMutation();
  const [deleting, setDeleting] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const connections = [
    ...(data?.asFrom || []).map((conn) => ({
      ...conn.to,
      _id: conn.to._id,
      direction: "to",
      connectionId: conn._id,
    })),
    ...(data?.asTo || []).map((conn) => ({
      ...conn.from,
      _id: conn.from._id,
      direction: "from",
      connectionId: conn._id,
    })),
  ];

  const handleDelete = async (connectionId) => {
    setDeleting((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await deleteConnection({ connectionId }).unwrap();
      refetch(); // Ensure the connection list and search list are updated
    } catch (error) {
      console.error("Failed to delete connection:", error);
    }
    setDeleting((prev) => ({ ...prev, [connectionId]: false }));
    setConfirmId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-900">My Connections</h2>
      {isLoading && <div className="text-gray-500">Loading...</div>}
      {!isLoading && connections.length === 0 && (
        <div className="text-gray-500">No connections found.</div>
      )}
      <ul className="divide-y">
        {connections.map((user) => (
          <li key={user._id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              {user.isAdmin ? (
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
                  {user.babyDetails && user.babyDetails.fullName && (
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
            <div className="mt-2 md:mt-0 flex gap-2">
              <span className="text-xs text-gray-400">
                {user.direction === "to"
                  ? userInfo.isAdmin
                    ? "Added"
                    : "Requested"
                  : "Connected"}
              </span>
              {userInfo.isAdmin && (
                <>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    disabled={deleting[user.connectionId]}
                    onClick={() => setConfirmId(user.connectionId)}
                  >
                    Delete
                  </button>
                  {confirmId === user.connectionId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          Confirm Delete
                        </h3>
                        <p className="mb-6 text-gray-600">
                          Are you sure you want to delete this connection?
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
                            onClick={() => handleDelete(user.connectionId)}
                            disabled={deleting[user.connectionId]}
                          >
                            {deleting[user.connectionId] ? "Deleting..." : "Yes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectionList;