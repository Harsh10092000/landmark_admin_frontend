import { useState, useContext } from "react";
import { AuthContext } from "../../context2/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../index.css";

const ACCENT = "#2563eb";
const CARD_BG = "#fff";
const PAGE_BG = "linear-gradient(135deg, #f4f6fb 0%, #e3eafc 100%)";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser, setLoginError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/adminlogin",
        { username, password },
        { withCredentials: true }
      );
      
      // Set user in context
      setUser(res.data.admin || res.data.user || res.data);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      setError(errorMsg);
      setLoginError(errorMsg);
      setIsLoading(false);
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
          maxWidth: 420,
          background: CARD_BG,
          borderRadius: 24,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.13), 0 1.5px 8px 0 rgba(31,38,135,0.06)",
          padding: "2.7rem 2.5rem 2.2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          border: "1.5px solid #e0e0e0",
        }}
      >
        {/* Logo */}
        <img
          src="https://landmarkplots.com/assets/img/logo/nav-log2.png"
          alt="Logo"
          style={{
            // width: 64,
            // height: 64,
            marginBottom: 18,
            marginTop: -10,
            objectFit: "contain",
            display: "block",
          }}
        />
        <div style={{ fontWeight: 800, fontSize: 30, color: "#222", marginBottom: 6, textAlign: "center", letterSpacing: 0.5 }}>
          Welcome Back!
        </div>
        <div style={{ color: "#888", fontSize: 16, marginBottom: 32, textAlign: "center" }}>
          Sign in to your admin dashboard
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontWeight: 600, color: "#444", marginBottom: 6, display: "block" }}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
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
              onFocus={e => (e.target.style.borderBottom = `2px solid ${ACCENT}`)}
              onBlur={e => (e.target.style.borderBottom = `2px solid #e0e0e0`)}
            />
            <label style={{ fontWeight: 600, color: "#444", marginBottom: 6, display: "block" }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                borderBottom: `2px solid #e0e0e0`,
                fontSize: 16,
                background: "transparent",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderBottom = `2px solid ${ACCENT}`)}
              onBlur={e => (e.target.style.borderBottom = `2px solid #e0e0e0`)}
            />
          </div>
          <div style={{ borderTop: "1px solid #f0f0f0", margin: "18px 0 12px 0" }} />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.95rem",
              background: ACCENT,
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              cursor: "pointer",
              marginBottom: 12,
              marginTop: 4,
              transition: "background 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#174ea6")}
            onMouseOut={e => (e.currentTarget.style.background = ACCENT)}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
          {error && (
            <div style={{ color: "#e53e3e", marginTop: 8, textAlign: "center", fontWeight: 500 }}>{error}</div>
          )}
        </form>
        <div style={{ width: "100%", textAlign: "center", marginTop: 8 }}>
          <a href="#" style={{ color: ACCENT, textDecoration: "none", fontWeight: 500, fontSize: 15 }}>
            Forgot My Password
          </a>
        </div>
        <div style={{ width: "100%", textAlign: "center", marginTop: 28, fontSize: 14, color: "#888" }}>
          <a
            href="https://landmarkplots.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: ACCENT,
              textDecoration: "none",
              fontWeight: 700,
              marginRight: 12,
            }}
          >
            Visit Website
          </a>
          <span style={{ color: "#bbb" }}>|</span>
          <a href="#" style={{ color: "#888", textDecoration: "none", marginLeft: 12 }}>
            Terms of use
          </a>
          <span style={{ color: "#bbb", margin: "0 8px" }}>|</span>
          <a href="#" style={{ color: "#888", textDecoration: "none" }}>
            Privacy policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;