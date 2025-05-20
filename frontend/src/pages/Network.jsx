import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ConnectionSearch from "../Components/Connection/ConnectionSearch";
import ConnectionRequests from "../Components/Connection/ConnectionRequests";
import ConnectionList from "../Components/Connection/ConnectionList";
import { useEffect, useState } from "react";

const Network = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user profile from your backend API
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.fullName) {
          setDisplayName(data.fullName);
        } else if (data.name) {
          setDisplayName(data.name);
        } else {
          setDisplayName("");
        }
      } catch {
        setDisplayName("");
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-orange-50">
        <Navbar />
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Greeting */}
            {!loading && displayName && (
              <div className="mb-8 text-3xl font-extrabold text-indigo-500 text-center drop-shadow-sm">
                Hello {displayName} !
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
              <h1 className="text-3xl font-extrabold mb-6 text-indigo-500 text-center tracking-tight drop-shadow-sm">
                My Network
              </h1>
              <div className="mb-8">
                <ConnectionSearch />
              </div>
              {/* Optionally, fetch user role from API and show requests for providers */}
              <div className="mb-8">
                <div className="bg-orange-50 rounded-xl shadow p-4">
                  <h2 className="text-lg font-semibold text-orange-700 mb-3">Connection Requests</h2>
                  <ConnectionRequests />
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl shadow p-4">
                <h2 className="text-lg font-semibold text-blue-700 mb-3">Your Connections</h2>
                <ConnectionList />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Network;