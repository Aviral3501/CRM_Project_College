// frontend/src/api/axios.js
import axios from 'axios';

const api = axios.create({
    // ✅ Always use the full backend URL from the environment variable
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;