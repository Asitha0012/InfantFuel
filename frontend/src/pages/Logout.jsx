import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logout()); // Clear user info from Redux and localStorage
    toast.success("Logged out successfully!");
    navigate("/login"); // Redirect to login page
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold text-gray-700">Logging out...</h1>
    </div>
  );
};

export default Logout;
