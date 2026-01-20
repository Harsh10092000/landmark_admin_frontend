
import { useContext } from 'react';
import './App.css'
import Dashboard from './pages/dashboard/Dashboard'
import MyProperty from './pages/myProperty/MyProperty'
import { AuthContext } from './context2/AuthContext';
import SessionOutLoginAgain from './components/Table/SessionOutLoginAgain';
import Loading from './components/Loading';
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  Outlet
} from "react-router-dom";
// import Table from './pages/table/Table';
import Index from './pages/index/Index';
import LoginRequired from './components/Table/LoginRequired';
import Login from './pages/login/Login';
import ViewyMaps from './pages/CityMaps/ViewMaps';
import AddMap from './pages/CityMaps/AddMap';
import EditMap from './pages/CityMaps/EditMap';
import ChangePassword from './pages/changePassword/ChangePassword';
import ForgotPassword from './pages/forgotPassword/ForgotPassword';
import AllRegUsers from './pages/allRegUsers/AllRegUsers';
import QRCodeGenerator from './pages/tools/QRCodeGenerator';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useContext(AuthContext);

  // Show loading while checking session
  if (isLoading) {
    return <Loading />;
  }

  // Show login required if no user
  if (!currentUser) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      {
        path: "all-users",
        element: <AllRegUsers />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "view-maps",
        element: <ViewyMaps />
      },
      {
        path: "add-map",
        element: <AddMap />
      },
      {
        path: "edit-map",
        element: <EditMap />
      },
      {
        path: "change-password",
        element: <ChangePassword />
      },
      {
        path: "qr-generator",
        element: <QRCodeGenerator />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
