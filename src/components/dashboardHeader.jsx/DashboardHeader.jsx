import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context2/AuthContext';
const DashboardHeader = ({ onToggleSidebar }) => {
  //const [pageName, setPageName] = useState('');
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    //const pathname = window.location.pathname;
    //const segments = pathname.split('/').filter(segment => segment);
    //const lastSegment = segments[segments.length - 1] || 'Unknown';
    //setPageName(lastSegment);
  }, []);
  return (
    <div
      className="dashboard-header-modern d-flex justify-content-between align-items-center"
      style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '18px 32px',
        margin: '18px 0',
        minHeight: 72,
        position: 'relative',
        zIndex: 1100,
      }}
    >
      <div className="d-flex align-items-center dashboard-header-inside-left gap-3">
        <div
          className="sidebar-toggle-icon d-flex align-items-center justify-content-center"
          //onClick={onToggleSidebar}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#f5f7fa',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            // cursor: 'pointer',
            marginRight: 18,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" opacity="0.4" d="M15.7798 4.5H5.2202C4.27169 4.5 3.5 5.06057 3.5 5.75042C3.5 6.43943 4.27169 7 5.2202 7H15.7798C16.7283 7 17.5 6.43943 17.5 5.75042C17.5 5.06054 16.7283 4.5 15.7798 4.5Z"></path>
            <path fill="currentColor" d="M18.7798 10.75H8.2202C7.27169 10.75 6.5 11.3106 6.5 12.0004C6.5 12.6894 7.27169 13.25 8.2202 13.25H18.7798C19.7283 13.25 20.5 12.6894 20.5 12.0004C20.5 11.3105 19.7283 10.75 18.7798 10.75Z"></path>
            <path fill="currentColor" d="M15.7798 17H5.2202C4.27169 17 3.5 17.5606 3.5 18.2504C3.5 18.9394 4.27169 19.5 5.2202 19.5H15.7798C16.7283 19.5 17.5 18.9394 17.5 18.2504C17.5 17.5606 16.7283 17 15.7798 17Z"></path>
          </svg>
        </div>
        <div className="dashboard-heading text-capitalize" style={{ fontWeight: 700, fontSize: 26, color: '#222' }}>
          {/* {pageName} */}
          Landmark Admin Dashboard
        </div>
      </div>
      <div className="d-flex align-items-center dashboard-header-inside-right gap-3">
        <div
          className="user-icon d-flex align-items-center justify-content-center"
          aria-label="User profile"
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#f5f7fa',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <img
            src='https://pub-c5e31b5cdafb419fb247a8ac2e78df7a.r2.dev/public/assets/images/mock/avatar/avatar-25.webp'
            alt="User avatar"
            style={{ width: 44, height: 44, borderRadius: '50%' }}
          />
        </div>
        <div className="ms-2" style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#222', textTransform: 'capitalize' }}>{currentUser?.name}</div>
          <div style={{ fontSize: 14, color: '#888' }}>{currentUser?.email}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;