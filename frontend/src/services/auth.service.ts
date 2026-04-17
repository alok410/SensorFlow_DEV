import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= SEND OTP ================= */
export const sendOTP = async (data) => {
  const res = await axios.post(`${API_URL}/auth/send-otp`, data);
  return res.data;
};

/* ================= VERIFY OTP ================= */
export const verifyOTP = async (data) => {
  const res = await axios.post(`${API_URL}/auth/verify-otp`, data);
  return res.data;
};