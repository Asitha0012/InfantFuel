import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import Loader from "../Components/Loader";
import { useRegisterMutation } from "../redux/api/users";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProfileParent = () => {
  const [formData, setFormData] = useState({
    parentFullName: "",
    address: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    babyFullName: "",
    dateOfBirth: "",
    gender: "",
    birthWeightKg: "",
    birthWeightG: "",
    height: "",
    bloodGroup: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error message when user starts typing
  };

  const handleRegister = async () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.parentFullName) newErrors.parentFullName = "Parent/Guardian full name is required.";
    if (!formData.address) newErrors.address = "Address is required.";
    if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.babyFullName) newErrors.babyFullName = "Baby's full name is required.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Baby's date of birth is required.";
    if (!formData.gender) newErrors.gender = "Baby's gender is required.";
    if (!formData.birthWeightKg && !formData.birthWeightG) newErrors.birthWeight = "Baby's birth weight is required.";

    setErrors(newErrors);

    // If no errors, proceed with form submission
    if (Object.keys(newErrors).length === 0) {
      try {
        const birthWeight = `${formData.birthWeightKg}kg ${formData.birthWeightG}g`;
        await register({
          userType: "parent",
          fullName: formData.parentFullName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          contactNumber: formData.contactNumber,
          babyDetails: {
            fullName: formData.babyFullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            birthWeight,
            birthHeight: formData.height,
            bloodGroup: formData.bloodGroup,
          },
        }).unwrap();

        toast.success("Registration successful!");
        navigate("/login");
      } catch (error) {
        toast.error(error.data?.message || "Registration failed!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-indigo-500 mb-16">
          Setup Your Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Parent/Guardian Details */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-2 border-b border-gray-100">
              Parent/Guardian Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="parentFullName"
                  value={formData.parentFullName}
                  onChange={handleInputChange}
                  placeholder="Enter Full Name"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.parentFullName && <p className="text-sm text-red-500 mt-1">{errors.parentFullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
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

          {/* Baby Details */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 pb-2 border-b border-gray-100">
              Baby Details
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="babyFullName"
                  value={formData.babyFullName}
                  onChange={handleInputChange}
                  placeholder="Enter Full Name"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.babyFullName && <p className="text-sm text-red-500 mt-1">{errors.babyFullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Boy"
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>Boy</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Girl"
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span>Girl</span>
                  </label>
                </div>
                {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth weight <span className="text-rose-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    name="birthWeightKg"
                    value={formData.birthWeightKg}
                    onChange={handleInputChange}
                    placeholder="kg"
                    className="w-32 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                  <input
                    type="number"
                    name="birthWeightG"
                    value={formData.birthWeightG}
                    onChange={handleInputChange}
                    placeholder="g"
                    className="w-32 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                </div>
                {errors.birthWeight && <p className="text-sm text-red-500 mt-1">{errors.birthWeight}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Height/Length
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="cm"
                    className="w-32 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group (optional)
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add a profile picture
                </label>
                <input
                  type="file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                />
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

export default ProfileParent;