// frontend/src/api/axios.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL

console.log("this is the backend url:",API_URL)

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // allow all origins (you can restrict this in production)
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

export default axiosInstance;