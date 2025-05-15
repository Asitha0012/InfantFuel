import { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useProfileMutation, useGetProfileQuery } from "../redux/api/users";
import { toast } from "react-toastify";

// Move initialUser outside the component to avoid unnecessary re-creation
const initialUser = {
  name: "",
  email: "",
  phone: "",
  address: "",
  birthdate: "",
  bloodGroup: "",
  avatar: "",
  professionalRegistrationNumber: "",
  position: "",
};

const Profile = () => {
  const [updateProfile] = useProfileMutation();
  const { data: userInfo, isLoading } = useGetProfileQuery();

  // Normalize userType for reliable comparison
  const userType = userInfo?.userType?.toLowerCase?.();

  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(initialUser);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // Update local state when userInfo changes (including after logout)
  useEffect(() => {
    if (userInfo) {
      setUser({
        name: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.contactNumber || "",
        address: userInfo.address || userInfo.workplaceAddress || "",
        birthdate: userInfo.babyDetails?.dateOfBirth || "",
        bloodGroup: userInfo.babyDetails?.bloodGroup || "",
        avatar: userInfo.profilePicture || "",
        professionalRegistrationNumber: userInfo.professionalRegistrationNumber || "",
        position: userInfo.position || "",
      });
      setEditedUser({
        name: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.contactNumber || "",
        address: userInfo.address || userInfo.workplaceAddress || "",
        birthdate: userInfo.babyDetails?.dateOfBirth || "",
        bloodGroup: userInfo.babyDetails?.bloodGroup || "",
        avatar: userInfo.profilePicture || "",
        professionalRegistrationNumber: userInfo.professionalRegistrationNumber || "",
        position: userInfo.position || "",
      });
      setPreviewAvatar("");
      setAvatarFile(null);
    } else {
      // Clear all fields on logout or when userInfo is not available
      setUser(initialUser);
      setEditedUser(initialUser);
      setPreviewAvatar("");
      setAvatarFile(null);
      setEditMode(false);
      setChangePassword(false);
      setPasswords({ current: "", new: "", confirm: "" });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection and preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // Upload image and return URL
  const uploadProfilePicture = async (file) => {
    const data = new FormData();
    data.append("image", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });
    if (!res.ok) throw new Error("Image upload failed");
    const result = await res.json();
    return result.url;
  };

  const handleSave = async () => {
    if (changePassword && passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      let profilePictureUrl = editedUser.avatar;
      if (avatarFile) {
        profilePictureUrl = await uploadProfilePicture(avatarFile);
      }

      const updatedData = {
        fullName: editedUser.name,
        email: editedUser.email,
        contactNumber: editedUser.phone,
        profilePicture: profilePictureUrl,
      };

      if (userType === "parent") {
        updatedData.address = editedUser.address;
        updatedData.babyDetails = {
          dateOfBirth: editedUser.birthdate,
          bloodGroup: editedUser.bloodGroup,
        };
      }

      if (userType === "healthcareprovider") {
        updatedData.workplaceAddress = editedUser.address;
        updatedData.professionalRegistrationNumber = editedUser.professionalRegistrationNumber;
        updatedData.position = editedUser.position;
      }

      if (changePassword) {
        updatedData.password = passwords.new;
      }

      await updateProfile(updatedData).unwrap();
      toast.success("Profile updated successfully!");
      setUser({ ...editedUser, avatar: profilePictureUrl });
      setEditMode(false);
      setChangePassword(false);
      setPasswords({ current: "", new: "", confirm: "" });
      setPreviewAvatar("");
      setAvatarFile(null);
    } catch (error) {
      toast.error(error.data?.message || error.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setEditMode(false);
    setChangePassword(false);
    setPasswords({ current: "", new: "", confirm: "" });
    setPreviewAvatar("");
    setAvatarFile(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-gray-600">Loading...</span>
      </div>
    );
  }

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
                {previewAvatar || editedUser.avatar ? (
                  <img
                    src={previewAvatar || editedUser.avatar}
                    alt="Avatar"
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <span>👤</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                {/* Full Name */}
                <div>
                  <p className="text-sm font-semibold">Full Name</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                  ) : (
                    <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                      {user.name || "-"}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                  ) : (
                    <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                      {user.email || "-"}
                    </p>
                  )}
                </div>
                {/* Phone Number */}
                <div>
                  <p className="text-sm font-semibold">Phone Number</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                  ) : (
                    <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                      {user.phone || "-"}
                    </p>
                  )}
                </div>
                {/* Address */}
                <div>
                  <p className="text-sm font-semibold">
                    {userType === "healthcareprovider"
                      ? "Workplace Address"
                      : "Address"}
                  </p>
                  {editMode ? (
                    <input
                      type="text"
                      name="address"
                      value={editedUser.address}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                    />
                  ) : (
                    <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                      {user.address || "-"}
                    </p>
                  )}
                </div>

                {/* Parent-specific fields */}
                {userType === "parent" && (
                  <>
                    <div>
                      <p className="text-sm font-semibold">Date of Birth(Child)</p>
                      {editMode ? (
                        <input
                          type="date"
                          name="birthdate"
                          value={editedUser.birthdate}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        />
                      ) : (
                        <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                          {user.birthdate ? user.birthdate.split("T")[0] : "-"}
                        </p>
                      )}
                    </div>
                    <div>
                <p className="text-sm font-semibold">Blood Group</p>
                   {editMode ? (
                    <select
                     name="bloodGroup"
                     value={editedUser.bloodGroup || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                      </select>
                      ) : (
                      <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                        {user.bloodGroup || "-"}
                      </p>
                    )}
                  </div>
                  </>
                )}

                {/* Healthcare provider-specific fields */}
                {userType === "healthcareprovider" && (
                  <>
                    <div>
                      <p className="text-sm font-semibold">Professional Registration Number</p>
                      {editMode ? (
                        <input
                          type="text"
                          name="professionalRegistrationNumber"
                          value={editedUser.professionalRegistrationNumber}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        />
                      ) : (
                        <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                          {user.professionalRegistrationNumber || "-"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Position/Designation</p>
                      {editMode ? (
                        <input
                          type="text"
                          name="position"
                          value={editedUser.position}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 w-full"
                        />
                      ) : (
                        <p className="border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[40px]">
                          {user.position || "-"}
                        </p>
                      )}
                    </div>
                  </>
                )}
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