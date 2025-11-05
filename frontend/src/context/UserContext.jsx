import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// Create the context
const UserContext = createContext();

// Get BASE_URL from environment or use default
const getBaseUrl = () => {
  if (import.meta.env.VITE_BASE_URL) {
    // console.log('Using VITE_BASE_URL from environment:', import.meta.env.VITE_BASE_URL);
    return import.meta.env.VITE_BASE_URL;
  }
  
  // If NODE_ENV is production, use relative path
  if (import.meta.env.MODE === "production") {
    console.log('Using production relative path /api');
    return "/api";
  }
  
  // Default to localhost for development for backend
  console.log('Using development URL: http://localhost:5000/api');
  return "http://localhost:5000/api";
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    user_id: '',
    organization_id: '',
    role: '',
    status: '',
    permissions: [],
    isVerified: false
  });
  
  // Add BASE_URL to the context
  const BASE_URL = getBaseUrl();
  console.log('UserContext initialized with BASE_URL:', BASE_URL);

  // Initialize user data from cookie on component mount
  useEffect(() => {
    const storedUserData = Cookies.get('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
      }
    }
  }, []);

  // Set user data and update cookie
  const setUser = (data) => {
    // Extract only the needed fields
    const userInfo = {
      name: data.name || '',
      email: data.email || '',
      user_id: data.user_id || '',
      organization_id: data.organization_id || '',
      role: data.role || '',
      status: data.status || '',
      permissions: data.permissions || [],
      isVerified: data.isVerified || false
    };
    
    // Update state
    setUserData(userInfo);
    
    // Set cookie (expires in 7 days)
    Cookies.set('userData', JSON.stringify(userInfo), { expires: 7 });
  };

  // Clear user data and remove cookie
  const clearUser = () => {
    setUserData({
      name: '',
      email: '',
      user_id: '',
      organization_id: '',
      role: '',
      status: '',
      permissions: [],
      isVerified: false
    });
    Cookies.remove('userData');
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!userData.user_id;
  };

  // Check if user is admin
  const isAdmin = () => {
    return userData.role === 'admin';
  };

  // Check if user is verified
  const isVerified = () => {
    return userData.isVerified;
  };

  const value = {
    userData,
    setUser,
    clearUser,
    isLoggedIn,
    isAdmin,
    isVerified,
    BASE_URL
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext; 