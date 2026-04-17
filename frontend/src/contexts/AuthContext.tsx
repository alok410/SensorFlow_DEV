import React, { createContext, useContext, useState, useEffect } from "react";
import { sendOTP, verifyOTP } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // ✅ Load user on refresh (FIXES LOGOUT ISSUE)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  /* ================= SEND OTP ================= */
  const sendOtpHandler = async (mobile) => {
    try {
      await sendOTP({ mobile });

      toast({
        title: "OTP Sent",
        description: "Check your mobile number",
      });

      return true;
    } catch (err) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Error sending OTP",
        variant: "destructive",
      });
      return false;
    }
  };

  /* ================= VERIFY OTP (LOGIN) ================= */
  const verifyOtpHandler = async (mobile, otp) => {
    try {
      const data = await verifyOTP({ mobile, otp });

      // ✅ Save session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      toast({
        title: "Login Successful",
        description: `Welcome ${data.user.name}`,
      });

      return true;
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "Invalid OTP",
        variant: "destructive",
      });
      return false;
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sendOtp: sendOtpHandler,
        verifyOtp: verifyOtpHandler,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);