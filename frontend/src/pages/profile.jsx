import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useProfileMutation } from "../redux/api/users"; // Import the mutation hook
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth); // Get logged-in user info from Redux
  const [updateProfile] = useProfileMutation(); // Mutation for updating profile

  const initialUser = {
    name: "",
    email: "",
    phone: "",
    address: "",
    birthdate: "",
    avatar: "",
  };

  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(initialUser);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // Fetch user details on component mount
  useEffect(() => {
    if (userInfo) {
      setUser({
        name: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.contactNumber || "",
        address: userInfo.address || "",
        birthdate: userInfo.babyDetails?.dateOfBirth || "",
        avatar: userInfo.profilePicture || "",
      });
      setEditedUser({
        name: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.contactNumber || "",
        address: userInfo.address || "",
        birthdate: userInfo.babyDetails?.dateOfBirth || "",
        avatar: userInfo.profilePicture || "",
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser((prev) => ({ ...prev, avatar: reader.result }));
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (changePassword && passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      const updatedData = {
        fullName: editedUser.name,
        email: editedUser.email,
        contactNumber: editedUser.phone,
        address: editedUser.address,
        babyDetails: {
          dateOfBirth: editedUser.birthdate,
        },
        profilePicture: editedUser.avatar,
      };

      if (changePassword) {
        updatedData.password = passwords.new;
      }

      // Use the mutation to update the profile
      await updateProfile(updatedData).unwrap();
      toast.success("Profile updated successfully!");
      setUser(editedUser);
      setEditMode(false);
      setChangePassword(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast.error(error.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setEditMode(false);
    setChangePassword(false);
    setPasswords({ current: "", new: "", confirm: "" });
    setPreviewAvatar("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow px-6 py-12 md:px-16 lg:px-32">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-6 text-center">
            User Profile
          </h1>

          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 shadow-md overflow-hidden">
                {editedUser.avatar ? (
                  <img
                    src={previewAvatar || editedUser.avatar}
                    alt="Avatar"
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <span>👶</span>
                )}
              </div>
              {editMode && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                {[
                  { label: "Full Name", name: "name" },
                  { label: "Email", name: "email" },
                  { label: "Phone Number", name: "phone" },
                  { label: "Address", name: "address" },
                  { label: "Date of Birth", name: "birthdate" },
                ].map(({ label, name }) => (
                  <div key={name}>
                    <p className="text-sm font-semibold">{label}</p>
                    {editMode ? (
                      <input
                        type={name === "birthdate" ? "date" : "text"}
                        name={name}
                        value={editedUser[name]}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                      />
                    ) : (
                      <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                        {user[name] || "-"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Change Password Section */}
              {editMode && (
                <div className="mt-6">
                  <label className="inline-flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={changePassword}
                      onChange={(e) => setChangePassword(e.target.checked)}
                    />
                    Change Password
                  </label>

                  {changePassword && (
                    <div className="space-y-4 mt-2">
                      <div>
                        <p className="text-sm font-semibold">Current Password</p>
                        <input
                          type="password"
                          name="current"
                          value={passwords.current}
                          onChange={handlePasswordChange}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">New Password</p>
                        <input
                          type="password"
                          name="new"
                          value={passwords.new}
                          onChange={handlePasswordChange}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Confirm New Password</p>
                        <input
                          type="password"
                          name="confirm"
                          value={passwords.confirm}
                          onChange={handlePasswordChange}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 text-center space-x-4">
                {editMode ? (
                  <>
                    <button
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 shadow-sm"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 shadow-sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 shadow-sm"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
