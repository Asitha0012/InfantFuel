import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PageLayout = () => {
  const [selectedProfile, setSelectedProfile] = useState("");
  const navigate = useNavigate();

  const handleSelection = (event) => {
    setSelectedProfile(event.target.value);
  };

  const onProceed = () => {
    if (selectedProfile === "Parents") {
      navigate("/parentprofile");
    } else if (selectedProfile === "Healthcare Providers") {
      navigate("/profilehealth");
    } else {
      alert("Please select a profile type before proceeding.");
    }
  };

  return (
    <div className="flex w-screen h-screen">
      <div className="flex-1 flex flex-col items-center justify-between p-5 bg-white">
        <div className="mt-5">
          <img
            className="h-52 object-contain"
            src="assets/InfantFuel logo-04.png"
            alt="Logo"
          />
        </div>
        <div className="flex-1 flex justify-center items-center p-5 max-w-full">
          <img
            className="h-72 w-72 object-cover"
            src="src/assets/pagelayout.jpg"
            alt="Center Image"
          />
        </div>
        <div className="mb-5 text-center">
          <p className="text-base text-gray-800">
            {selectedProfile === "Parents"
              ? "Start your journey to track and support your baby’s growth with ease."
              : selectedProfile === "Healthcare Providers"
              ? "Effortlessly track and monitor the growth of babies in your care."
              : "Please select a profile type to proceed."}
          </p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-start bg-[#FFE7C7] p-5">
        <div className="p-5 md:px-20">
          <h1 className="text-4xl mb-2 text-indigo-500 font-bold">Welcome!</h1>
          <p className="text-lg mb-5 text-gray-600">
            Please select your profile type
          </p>
          <div className="mb-5">
            <label className="block text-base mb-2 text-gray-800">
              <input
                type="radio"
                className="mr-2"
                name="profileType"
                value="Parents"
                onChange={handleSelection}
              />
              Parents
            </label>
            <label className="block text-base mb-2 text-gray-800">
              <input
                type="radio"
                className="mr-2"
                name="profileType"
                value="Healthcare Providers"
                onChange={handleSelection}
              />
              Healthcare Providers
            </label>
          </div>
          <button
            className="px-24 py-2 text-base text-white bg-indigo-500 rounded-md cursor-pointer hover:bg-blue-800"
            onClick={onProceed}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;