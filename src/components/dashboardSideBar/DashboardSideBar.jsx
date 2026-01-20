import React, { useState, useContext } from "react";
import "./DashboardSideBar.css";
import { Link, useLocation } from "react-router-dom";
import { AddPropertyIcon, AllProperties, MyProperties, AllUsersIcon, LogoutIcon, MapIcon, ChangePasswordIcon } from "../SvgIcons";
import { IconQrcode } from "@tabler/icons-react";
import { AuthContext } from "../../context2/AuthContext";



const DashboardSideBar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const [selectedItem, setSelectedItem] = useState("My Properties");
  const [sidebarCollapse, setSidebarCollapse] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mapsDropdownOpen, setMapsDropdownOpen] = useState(false);
  const location = useLocation();



  const handleLogout = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const LogoutDialog = ({ open, onClose }) => {
    if (!open) return null;
    return (
      <>
        <div className="modal-backdrop">
          <div className="modern-modal">
            <div className="modal-icon">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#fff5f5" />
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="modal-content">
              <h2 className="modal-title">Confirm Logout</h2>
              <div className="modal-subtext">Are you sure you want to logout from your account?</div>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button className="modal-btn" onClick={onClose} style={{ background: '#e2e8f0', color: '#333' }}>
                  CANCEL
                </button>
                <button className="modal-btn" onClick={handleLogout}>
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.25s;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .modern-modal {
            background: linear-gradient(135deg, #fff 80%, #fff5f5 100%);
            border-radius: 22px;
            box-shadow: 0 12px 48px 0 rgba(229,62,62,0.15), 0 1.5px 8px 0 rgba(229,62,62,0.08);
            min-width: 340px;
            max-width: 420px;
            width: 100%;
            padding: 2.7rem 2.7rem 2.2rem 2.7rem;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: modalPop 0.18s cubic-bezier(.4,2,.6,1) both;
          }
          @keyframes modalPop {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .modal-icon {
            margin-bottom: 0.7rem;
            margin-top: -0.5rem;
          }
          .modal-title {
            font-size: 15px;
            font-weight: 800;
            color: #222;
            margin-bottom: 0.7rem;
            text-align: center;
          }
          .modal-subtext {
            color: #666;
            font-size: 13px;
            margin-bottom: 2.1rem;
            text-align: center;
          }
          .modal-btn {
            flex: 1;
            background: #e53e3e;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 13px 0;
            font-size: 11.3px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-top: .5rem;
            cursor: pointer;
            transition: background 0.18s;
          }
          .modal-btn:hover {
            background: #c53030;
          }
          .modal-btn:first-child:hover {
            background: #cbd5e0;
          }
        `}</style>
      </>
    );
  };

  const menuItems = [
    // {
    //   name: "List Property",
    //   url: "/dashboard",
    //   icon: <AddPropertyIcon />,
    // },
    // {
    //   name: "All Properties",
    //   url: `https://landmarkplots.com/allproperties`,
    //   icon: <AllProperties />,
    // },
    {
      name: "All Properties",
      url: "/dashboard",
      icon: <MyProperties />,
    },
    {
      name: "All Users",
      url: "/all-users",
      icon: <AllUsersIcon />,
    },
    // Maps dropdown menu
    {
      name: "Maps",
      isDropdown: true,
      icon: <MapIcon />,
      subItems: [
        { name: "Add Map", url: "/add-map" },
        { name: "View Maps", url: "/view-maps" },
      ],
    },
    {
      name: "Change Password",
      url: "/change-password",
      icon: <ChangePasswordIcon />,
    },
    {
      name: "Review QR Code Generator",
      url: "/qr-generator",
      icon: <IconQrcode size={22} />,
    },
    {
      name: "Logout",
      url: "#",
      icon: <LogoutIcon />,
      onClick: (e) => {
        e.preventDefault();
        setShowLogoutDialog(true);
      }
    },
  ];

  return (
    <>
      <div
        className={`dashboard-sideBar-modern shadow-lg ${sidebarCollapse ? "sidebar-close" : "sidebar-open"} ${isSidebarOpen ? "open-mobile-sidebar" : ""}`}
        style={{
          background: "#fff",
          borderRadius: "18px",
          minHeight: "100vh",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          width: sidebarCollapse ? 70 : 240,
          transition: "width 0.2s cubic-bezier(.4,0,.2,1)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div className="sidebar-logo d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <img src="/favicon.png" alt="Logo" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <div className="sidebar-toggle-icon" onClick={toggleSidebar} style={{ cursor: "pointer" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" opacity="0.4" d="M15.7798 4.5H5.2202C4.27169 4.5 3.5 5.06057 3.5 5.75042C3.5 6.43943 4.27169 7 5.2202 7H15.7798C16.7283 7 17.5 6.43943 17.5 5.75042C17.5 5.06054 16.7283 4.5 15.7798 4.5Z"></path><path fill="currentColor" d="M18.7798 10.75H8.2202C7.27169 10.75 6.5 11.3106 6.5 12.0004C6.5 12.6894 7.27169 13.25 8.2202 13.25H18.7798C19.7283 13.25 20.5 12.6894 20.5 12.0004C20.5 11.3105 19.7283 10.75 18.7798 10.75Z"></path><path fill="currentColor" d="M15.7798 17H5.2202C4.27169 17 3.5 17.5606 3.5 18.2504C3.5 18.9394 4.27169 19.5 5.2202 19.5H15.7798C16.7283 19.5 17.5 18.9394 17.5 18.2504C17.5 17.5606 16.7283 17 15.7798 17Z"></path></svg>
          </div>
        </div>
        <div className="dashboardSideBar py-4">
          <div className="dashboardSidebar-inside d-inline-flex flex-column gap-2">
            <div className="sidebar-icon mobile-hidden mb-3" onClick={() => setSidebarCollapse(!sidebarCollapse)} style={{ cursor: "pointer", marginLeft: sidebarCollapse ? 0 : 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13.83 19a1 1 0 0 1-.78-.37l-4.83-6a1 1 0 0 1 0-1.27l5-6a1 1 0 0 1 1.54 1.28L10.29 12l4.32 5.36a1 1 0 0 1-.78 1.64" /></svg>
            </div>
            {menuItems.map((item, index) =>
              !item.isDropdown ? (
                <Link
                  key={item.name}
                  className={`menu-link-modern d-flex align-items-center gap-3 px-3 py-2 rounded-2 fw-semibold ${selectedItem === item.name ? "menu-link-selected-modern" : ""}`}
                  to={item.url}
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);
                    } else {
                      setSelectedItem(item.name);
                    }
                  }}
                  style={{
                    background: selectedItem === item.name ? "#e3f0ff" : "transparent",
                    color: selectedItem === item.name ? "#1976d2" : "#333",
                    transition: "background 0.2s, color 0.2s",
                    fontWeight: selectedItem === item.name ? 700 : 500,
                    boxShadow: selectedItem === item.name ? "0 2px 8px rgba(25, 118, 210, 0.08)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <span className="menu-icon" style={{ fontSize: 22 }}>{item.icon}</span>
                  {!sidebarCollapse && <span>{item.name}</span>}
                </Link>
              ) : (
                <div key={item.name} style={{ position: "relative" }}>
                  <div
                    className={`menu-link-modern d-flex align-items-center gap-3 px-3 py-2 rounded-2 fw-semibold ${item.subItems.some(sub => location.pathname === sub.url) ? "menu-link-selected-modern" : ""}`}
                    style={{
                      background: item.subItems.some(sub => location.pathname === sub.url) ? "#e3f0ff" : "transparent",
                      color: item.subItems.some(sub => location.pathname === sub.url) ? "#1976d2" : "#333",
                      fontWeight: item.subItems.some(sub => location.pathname === sub.url) ? 700 : 500,
                      boxShadow: item.subItems.some(sub => location.pathname === sub.url) ? "0 2px 8px rgba(25, 118, 210, 0.08)" : "none",
                      cursor: "pointer",
                    }}
                    onClick={() => setMapsDropdownOpen(!mapsDropdownOpen)}
                  >
                    <span className="menu-icon" style={{ fontSize: 22 }}>{item.icon}</span>
                    {!sidebarCollapse && <span>{item.name}</span>}
                    {!sidebarCollapse && (
                      <svg style={{ marginLeft: "auto", transition: "transform 0.2s", transform: mapsDropdownOpen ? "rotate(90deg)" : "rotate(0deg)" }} width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 6l6 6-6 6" /></svg>
                    )}
                  </div>
                  {mapsDropdownOpen && !sidebarCollapse && (
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: "100%",
                      background: "#fff",
                      borderRadius: 8,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      minWidth: 180,
                      zIndex: 10,
                    }}>
                      {item.subItems.map(sub => (
                        <Link
                          key={sub.name}
                          to={sub.url}
                          className="menu-link-modern d-flex align-items-center gap-2 px-3 py-2"
                          style={{
                            color: location.pathname === sub.url ? "#1976d2" : "#333",
                            fontWeight: location.pathname === sub.url ? 700 : 500,
                            background: location.pathname === sub.url ? "#e3f0ff" : "transparent",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setSelectedItem(item.name);
                            setMapsDropdownOpen(false);
                          }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <LogoutDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      />
    </>
  );
};

export default DashboardSideBar;
