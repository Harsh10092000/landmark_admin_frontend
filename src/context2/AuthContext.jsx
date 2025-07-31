
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading
  const [error, setError] = useState(null);

  // Function to check if admin session exists
  const checkAdminSession = async () => {
    try {
      setIsLoading(true);
      
      // First, try to get user from localStorage as backup
      const storedUser = localStorage.getItem('adminUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setError(null);
      }

      // Then check with server
      const response = await axios.get(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/checkSession",
        { withCredentials: true }
      );
      
      if (response.data.success && response.data.admin) {
        const adminData = response.data.admin;
        setCurrentUser(adminData);
        setError(null);
        // Update localStorage with fresh data
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      } else {
        // If server says no session, clear localStorage too
        localStorage.removeItem('adminUser');
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      // If server check fails, keep the localStorage data if it exists
      // This prevents logout on network issues
      if (!localStorage.getItem('adminUser')) {
        setCurrentUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set user after successful login
  const setUser = (userData) => {
    setCurrentUser(userData);
    setError(null);
    // Store in localStorage for persistence
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  // Function to set error
  const setLoginError = (errorMsg) => {
    setError(errorMsg);
  };

  // Function to handle logout
  const logout = async () => {
    try {
      // Call logout API to clear server session
      await axios.post(
        import.meta.env.NODE_ENV==='production' ? import.meta.env.VITE_BACKEND_PROD : import.meta.env.VITE_BACKEND_DEV + "/api/admin/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Clear local state and localStorage regardless of API success
      setCurrentUser(null);
      setError(null);
      localStorage.removeItem('adminUser');
      // Redirect to login
      window.location.href = '/login';
    }
  };

  // Check session on component mount
  useEffect(() => {
    checkAdminSession();
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser, 
      logout, 
      setUser, 
      setLoginError, 
      isLoading, 
      error,
      checkAdminSession // Export this function in case you need to refresh session manually
    }}>
      {children}
    </AuthContext.Provider>
  );
};
