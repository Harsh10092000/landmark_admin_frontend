import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context2/AuthContext";

const ChangePassword = () => {
  const { currentUser } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: send otp, 2: verify otp and update password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await axios.post(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/send-otp",
        { email: currentUser?.email || currentUser?.username }
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

  const handleUpdatePassword = async () => {
    const trimmedOtp = otp.trim();
    const trimmedNewPwd = newPassword.trim();
    const trimmedConfirmPwd = confirmPassword.trim();

    if (!trimmedOtp) {
      setError("OTP is required.");
      return;
    }
    if (trimmedNewPwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (trimmedNewPwd !== trimmedConfirmPwd) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await axios.post(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/update-password",
        { 
          email: currentUser?.email || currentUser?.username,
          otp: trimmedOtp, 
          newPassword: trimmedNewPwd 
        }
      );
      if (res.data.success) {
        setMsg("Password updated successfully!");
        setStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      setError("Failed to update password.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className='dashboard-main-wrapper'>
        <div className="tab_section_wrapper">
          <div className="tab_section">
            <div className="tab_section-item tab_section-item-selected">
              Change Password
            </div>
          </div>
        </div>
      </div>
      
      <div className='main-wrapper'>
        <div className='row myproperty-section'>
          <div className="myproperty-section-title-minimal">Change Password</div>
          
          {msg && <div style={{ color: "#388e3c", marginBottom: 12, padding: "0 15px" }}>{msg}</div>}
          {error && <div style={{ color: "#e53935", marginBottom: 12, padding: "0 15px" }}>{error}</div>}
          
          <div className="col-md-12 inside-section-wrapper">
            <label className="myproperty-label">Email Address</label>
            <input
              type="email"
              className="myproperty-location-input"
              value={currentUser?.email || currentUser?.username || ""}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          
          {step === 1 && (
            <div className="col-md-12 inside-section-wrapper">
              <label className="myproperty-label">Send OTP</label>
              <div style={{ fontSize: '0.85em', color: '#666', marginBottom: 8 }}>
                Click the button below to send OTP to your email
              </div>
            </div>
          )}
          
          {step === 2 && (
            <>
              <div className="col-md-6 inside-section-wrapper">
                <label className="myproperty-label">OTP <span style={{ color: '#ec161e' }}>*</span></label>
                <input
                  type="text"
                  className="myproperty-location-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
                {error && <div className="myproperty-error-msg">{error}</div>}
              </div>
              
              <div className="col-md-6 inside-section-wrapper">
                <label className="myproperty-label">New Password <span style={{ color: '#ec161e' }}>*</span></label>
                <input
                  type="password"
                  className="myproperty-location-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
                {error && <div className="myproperty-error-msg">{error}</div>}
              </div>
              
              <div className="col-md-6 inside-section-wrapper">
                <label className="myproperty-label">Confirm Password <span style={{ color: '#ec161e' }}>*</span></label>
                <input
                  type="password"
                  className="myproperty-location-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                {error && <div className="myproperty-error-msg">{error}</div>}
              </div>
            </>
          )}
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={step === 1 ? handleSendOtp : handleUpdatePassword}
            disabled={loading}
            style={{
              background: '#1a73e8',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(26, 115, 232, 0.2)',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = '#1557b0';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(26, 115, 232, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = '#1a73e8';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(26, 115, 232, 0.2)';
              }
            }}
          >
            {loading ? (step === 1 ? "Sending..." : "Updating...") : (step === 1 ? "Send OTP" : "Update Password")}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;