import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getDashboardPath } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();

  /* ✅ Redirect if logged in */
  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role));
    }
  }, [user, navigate]);

  /* ================= SEND OTP ================= */
  const handleSendOtp = async () => {
    if (mobile.length !== 10) return;

    setLoading(true);
    const success = await sendOtp(mobile);

    if (success) {
      setStep(2);
    }

    setLoading(false);
  };

  /* ================= VERIFY OTP ================= */
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    const success = await verifyOtp(mobile, otp);

    if (success) {
      // redirect handled by useEffect
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Login with Mobile" : "Enter OTP"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <Label>Mobile Number</Label>
              <Input
                type="tel"
                placeholder="Enter mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <Button onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <Label>OTP</Label>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;