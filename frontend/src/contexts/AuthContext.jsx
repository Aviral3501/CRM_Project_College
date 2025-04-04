import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true,
    error: null,
    login: async () => {},
    adminLogin: async () => {},
    signup: async () => {},
    adminSignup: async () => {},
    logout: async () => {},
    verifyEmail: async () => {},
    forgotPassword: async () => {},
    resetPassword: async () => {},
});

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const {
        user,
        isAuthenticated,
        isLoading,
        isCheckingAuth,
        error,
        login,
        adminLogin,
        signup,
        adminSignup,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        checkAuth,
    } = useAuthStore();

    // Check authentication status when the app loads
    useEffect(() => {
        checkAuth();
    }, []);

    // Enhanced logout with navigation
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Utility function to check if user is admin
    const isAdmin = user?.role === 'admin';

    // Utility function to check if email is verified
    const isEmailVerified = user?.isEmailVerified ?? false;

    const value = {
        user,
        isAuthenticated,
        isLoading,
        isCheckingAuth,
        error,
        isAdmin,
        isEmailVerified,
        login,
        adminLogin,
        signup,
        adminSignup,
        logout: handleLogout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        // Additional helper methods
        getUserFullName: () => user?.name || 'User',
        getUserEmail: () => user?.email || '',
        getUserOrganization: () => user?.organization || '',
        getUserId: () => user?.user_id || '',
    };

    // Show loading spinner while checking authentication
    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 