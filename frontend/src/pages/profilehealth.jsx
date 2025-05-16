import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import Loader from "../Components/Loader";
import { useRegisterMutation } from "../redux/api/users";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profilehealth = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    workplaceAddress: "",
    district: "",
    gramaNiladhariDivision: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    professionalRegistrationNumber: "",
    profilePicture: "", // preview URL
    profilePictureFile: null, // file for upload
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
    "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
    "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        profilePictureFile: files[0],
        profilePicture: URL.createObjectURL(files[0]), // For preview
      }));
    } else {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: "" });
    }
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

  const handleRegister = async () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.workplaceAddress.trim()) newErrors.workplaceAddress = "Workplace address is required.";
    if (!formData.district.trim()) newErrors.district = "Please select a district.";
    if (!formData.gramaNiladhariDivision.trim()) newErrors.gramaNiladhariDivision = "Grama Niladhari Division is required.";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.position.trim()) newErrors.position = "Position/Designation is required.";
    if (!formData.professionalRegistrationNumber.trim()) newErrors.professionalRegistrationNumber = "Professional Registration Number is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        let profilePictureUrl = "";
        if (formData.profilePictureFile) {
          profilePictureUrl = await uploadProfilePicture(formData.profilePictureFile);
        }
        await register({
          userType: "healthcareProvider",
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          workplaceAddress: formData.workplaceAddress,
          district: formData.district,
          gramaNiladhariDivision: formData.gramaNiladhariDivision,
          contactNumber: formData.contactNumber,
          position: formData.position,
          professionalRegistrationNumber: formData.professionalRegistrationNumber,
          profilePicture: profilePictureUrl, // Send the uploaded image URL or empty string
        }).unwrap();

        toast.success("Registration successful!");
        navigate("/login");
      } catch (error) {
        toast.error(error.data?.message || error.message || "Registration failed!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-indigo-600 mb-16">
          Setup Your Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Side: Personal Details */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-2 border-b border-gray-100">
              Healthcare Provider Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter Full Name"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workplace Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="workplaceAddress"
                  value={formData.workplaceAddress}
                  onChange={handleInputChange}
                  placeholder="Workplace Address"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.workplaceAddress && <p className="text-sm text-red-500 mt-1">{errors.workplaceAddress}</p>}
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district}</p>}
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grama Niladhari Division <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gramaNiladhariDivision"
                    value={formData.gramaNiladhariDivision}
                    onChange={handleInputChange}
                    placeholder="Grama Niladhari Division"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                  {errors.gramaNiladhariDivision && <p className="text-sm text-red-500 mt-1">{errors.gramaNiladhariDivision}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Contact number"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.contactNumber && <p className="text-sm text-red-500 mt-1">{errors.contactNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Email"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set Password"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Right Side: Professional Details */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-2 border-b border-gray-100">
              Professional Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position/Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Position/Designation"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.position && <p className="text-sm text-red-500 mt-1">{errors.position}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Registration Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="professionalRegistrationNumber"
                  value={formData.professionalRegistrationNumber}
                  onChange={handleInputChange}
                  placeholder="Professional Registration Number"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.professionalRegistrationNumber && <p className="text-sm text-red-500 mt-1">{errors.professionalRegistrationNumber}</p>}
              </div>
              {/* Profile Picture (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-200"
                />
                {formData.profilePicture && (
                  <img
                    src={formData.profilePicture}
                    alt="Profile Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-full border"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Register Button */}
        <div className="mt-12 flex justify-center">
          {isLoading ? (
            <Loader />
          ) : (
            <button
              onClick={handleRegister}
              className="px-32 bg-indigo-600 text-white py-4 rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Register
            </button>
          )}
        </div>
        <div className="text-center mt-6">
          <span className="text-gray-600">If you already have an account</span>
          <a
            href="/login"
            className="text-indigo-500 font-medium ml-1 hover:text-indigo-700 transition-colors"
          >
            Login here!
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profilehealth;