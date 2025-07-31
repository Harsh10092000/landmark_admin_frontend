import React, { useState } from "react";
import axios from "axios";

const ChangePassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+newpass
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await axios.post(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/send-otp",
        { email }
      );
      if (res.data.success) {
        setStep(2);
        setMsg("OTP sent to your email.");
      } else {
        setError(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Failed to send OTP.");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await axios.post(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/reset-password",
        { email, otp, newPassword }
      );
      if (res.data.success) {
        setMsg("Password reset successful! You can now login.");
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        setError(res.data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Failed to reset password.");
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-main-wrapper" style={{ background: "#f7fafd", minHeight: 0, padding: "40px 0" }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(25,118,210,0.08)",
        padding: 32,
        minWidth: 340,
        maxWidth: 400,
        margin: "40px auto"
      }}>
        <h2 style={{ color: "#1976d2", fontWeight: 700, marginBottom: 24, textAlign: "left", fontSize: 22 }}>Change Password</h2>
        {msg && <div style={{ color: "#388e3c", marginBottom: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#e53935", marginBottom: 12 }}>{error}</div>}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label className="myproperty-label">Email Address</label>
            <input
              type="email"
              className="myproperty-location-input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ marginBottom: 16 }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "12px 0",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer"
              }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <label className="myproperty-label">OTP</label>
            <input
              type="text"
              className="myproperty-location-input"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              style={{ marginBottom: 16 }}
            />
            <label className="myproperty-label">New Password</label>
            <input
              type="password"
              className="myproperty-location-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{ marginBottom: 16 }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "12px 0",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer"
              }}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;