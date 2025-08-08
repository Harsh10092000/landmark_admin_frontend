import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ACCENT = "#2563eb";
const CARD_BG = "#fff";
const PAGE_BG = "linear-gradient(135deg, #f4f6fb 0%, #e3eafc 100%)";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email/username, 2: otp + new password
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmed = identity.trim();
    if (!trimmed) {
      setError("Email or Username is required.");
      return;
    }
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await axios.post(
        (import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV) + "/api/admin/send-otp",
        { email: trimmed }
      );
      if (res.data.success) {
        setStep(2);
        setMsg("OTP sent to your email.");
      } else {
        setError(res.data.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    const trimmedPwd = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (!trimmedOtp) {
      setError("OTP is required.");
      return;
    }
    if (trimmedPwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (trimmedPwd !== trimmedConfirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const res = await axios.post(
        (import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV) + "/api/admin/update-password",
        { email: identity.trim(), otp: trimmedOtp, newPassword: trimmedPwd }
      );
      if (res.data.success) {
        setMsg("Password updated successfully. You can now sign in.");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      setError("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAGE_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: CARD_BG,
          borderRadius: 24,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13), 0 1.5px 8px 0 rgba(31,38,135,0.06)",
          padding: "2.4rem 2.2rem 2rem 2.2rem",
          border: "1.5px solid #e0e0e0",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 26, color: "#222", marginBottom: 6, textAlign: "center" }}>
          Forgot Password
        </div>
        <div style={{ width: "100%", textAlign: "center", marginTop: 8, marginBottom: 20 }}>
          <Link to="/login" style={{ color: ACCENT, textDecoration: "none", fontWeight: 500, fontSize: 15 }}>
            Back to Login
          </Link>
        </div>
        <div style={{ color: "#666", fontSize: 15, marginBottom: 20, textAlign: "center" }}>
          {step === 1 ? "Enter your email or username to receive an OTP." : "Enter the OTP and your new password."}
        </div>

        {msg && <div style={{ color: "#388e3c", marginBottom: 12 }}>{msg}</div>}
        {error && <div style={{ color: "#e53935", marginBottom: 12 }}>{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label style={{ fontWeight: 600, color: "#444", marginBottom: 6, display: "block" }}>Email or Username</label>
            <input
              type="text"
              placeholder="Enter email or username"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                borderBottom: `2px solid #e0e0e0`,
                fontSize: 16,
                marginBottom: 22,
                background: "transparent",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderBottom = `2px solid ${ACCENT}`)}
              onBlur={(e) => (e.target.style.borderBottom = `2px solid #e0e0e0`)}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.95rem",
                background: ACCENT,
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#174ea6")}
              onMouseOut={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleUpdatePassword}>
            <label style={{ fontWeight: 600, color: "#444", marginBottom: 6, display: "block" }}>OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                borderBottom: `2px solid #e0e0e0`,
                fontSize: 16,
                marginBottom: 22,
                background: "transparent",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderBottom = `2px solid ${ACCENT}`)}
              onBlur={(e) => (e.target.style.borderBottom = `2px solid #e0e0e0`)}
            />

            <label style={{ fontWeight: 600, color: "#444", marginBottom: 6, display: "block" }}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                borderBottom: `2px solid #e0e0e0`,
                fontSize: 16,
                marginBottom: 22,
                background: "transparent",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderBottom = `2px solid ${ACCENT}`)}
              onBlur={(e) => (e.target.style.borderBottom = `2px solid #e0e0e0`)}
            />

            <label style={{ fontWeight: 600, color: "#444", marginBottom: 6, display: "block" }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                borderBottom: `2px solid #e0e0e0`,
                fontSize: 16,
                marginBottom: 22,
                background: "transparent",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderBottom = `2px solid ${ACCENT}`)}
              onBlur={(e) => (e.target.style.borderBottom = `2px solid #e0e0e0`)}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.95rem",
                background: ACCENT,
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#174ea6")}
              onMouseOut={(e) => (e.currentTarget.style.background = ACCENT)}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


