import axios from "axios";
import { create } from "zustand";
import Cookies from "js-cookie";

// ✅ API base URL
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/auth`;

// ✅ Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies, etc.
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Optional request interceptor (no CORS headers)
axiosInstance.interceptors.request.use(
  (config) => {
    // you can log or modify config here
    return config;
  },
  (error) => Promise.reject(error)
);
// ✅ Zustand store
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  // Employee signup
  signup: async ({ email, password, name, organizationName }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/signup`, {
        email,
        password,
        name,
        organizationName,
      });
      if (response.data.success) {
        Cookies.set("userData", JSON.stringify(response.data.user), { expires: 7 });
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        return response.data;
      }
    } catch (error) {
      set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
      throw error;
    }
  },

  // Admin signup
  adminSignup: async (adminData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/admin/signup`, adminData);
      Cookies.set("userData", JSON.stringify(response.data.admin), { expires: 7 });
      set({ user: response.data.admin, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error creating organization", isLoading: false });
      throw error;
    }
  },

  // Common login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/login`, { email, password });
      Cookies.set("userData", JSON.stringify(response.data.user), { expires: 7 });
      set({ isAuthenticated: true, user: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  // Admin login
  adminLogin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/admin/login`, { email, password });
      Cookies.set("userData", JSON.stringify(response.data.user), { expires: 7 });
      set({ isAuthenticated: true, user: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post(`/logout`);
      Cookies.remove("userData");
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/verify-email`, { code });
      Cookies.set("userData", JSON.stringify(response.data.user), { expires: 7 });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
      throw error;
    }
  },

  // Check authentication
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axiosInstance.get(`/check-auth`);
      set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      set({ error: null, isCheckingAuth: false, isAuthenticated: false });
      console.error(error);
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/forgot-password`, { email });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/reset-password/${token}`, { password });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error resetting password",
      });
      throw error;
    }
  },
}));
