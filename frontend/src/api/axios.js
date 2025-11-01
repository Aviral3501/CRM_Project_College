import axios from 'axios';

// Determine baseURL based on environment
const getBaseURL = () => {
    // Check for explicit VITE_BASE_URL in environment
    if (import.meta.env.VITE_BASE_URL) {
        return import.meta.env.VITE_BASE_URL;
    }
    
    // In production, use relative path (proxy handles it)
    if (import.meta.env.MODE === "production") {
        return "/api";
    }
    
    // Development: use localhost by default
    return "http://localhost:5000/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // CRITICAL: Allows cookies to be sent cross-origin
});

// No token interceptor needed - using httpOnly cookies that are automatically sent

export default api; 