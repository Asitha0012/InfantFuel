import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import ConnectionSearch from "../Components/Connection/ConnectionSearch";
import ConnectionRequests from "../Components/Connection/ConnectionRequests";
import ConnectionList from "../Components/Connection/ConnectionList";
import { useSelector } from "react-redux";

const Network = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">My Network</h1>
        <div className="mb-8">
          <ConnectionSearch />
        </div>
        {userInfo?.isAdmin && (
          <div className="mb-8">
            <ConnectionRequests />
          </div>
        )}
        <ConnectionList />
      </div>
      <Footer />
    </>
  );
};

export default Network;