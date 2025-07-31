// import React, {memo} from 'react'
// import { Outlet } from 'react-router-dom'
// import DashboardHeader from '../../components/dashboardHeader.jsx/DashboardHeader'
// import DashboardSideBar from '../../components/dashboardSideBar/DashboardSideBar'
// const Index = memo(() => {
//   return (
//     <>
//     <div className='container-fluid'>


//     <div className='dashboard-wrapper'>
     
       
//             <DashboardSideBar />

//         <div className='dashboard-right'>
//           <div className='dashboard-right-header'>
//         <DashboardHeader />
//         </div>
//         <div className='dashboard-right-main'>
//         <Outlet />
//         </div>
//         </div>
//     </div>
//     </div>
//     </>
//   )
// })

// export default Index


import React, { memo, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../../components/dashboardHeader.jsx/DashboardHeader';
import DashboardSideBar from '../../components/dashboardSideBar/DashboardSideBar';

const Index = memo(() => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log("triggered")
    console.log("isSidebarOpen : " , isSidebarOpen)
    setIsSidebarOpen(!isSidebarOpen);
    console.log("isSidebarOpen2 : " , isSidebarOpen)
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [isSidebarOpen]);

  return (
    <div 
    //className="container-fluid"
    >
      <div className="dashboard-wrapper">
        <DashboardSideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`sidebar-overlay ${isSidebarOpen ? 'sidebar-overlay-active' : ''}`} onClick={toggleSidebar} />
        <div className="dashboard-right">
          <div className="dashboard-right-header">
            <DashboardHeader onToggleSidebar={toggleSidebar} />
          </div>
          <div className="dashboard-right-main">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Index;