import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";
console.log(import.meta.env);


axios.defaults.withCredentials = true;

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
			const response = await axios.post(`${API_URL}/signup`, { 
				email, 
				password, 
				name,
				organizationName
			});
			if (response.data.success) {
				// Store user data in cookie
				Cookies.set('userData', JSON.stringify(response.data.user), { expires: 7 });
				
				set({ user: response.data.user, isAuthenticated: true, isLoading: false });
				return response.data;
			}
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			throw error;
		}
	},

	// Admin signup
	adminSignup: async (adminData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/admin/signup`, adminData);
			
			// Store user data in cookie
			Cookies.set('userData', JSON.stringify(response.data.admin), { expires: 7 });
			
			set({ user: response.data.admin, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error creating organization", isLoading: false });
			throw error;
		}
	},

	// Common login for both admin and employee
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL+"cdscdssd"}/login`, { email, password });
			
			// Store user data in cookie
			Cookies.set('userData', JSON.stringify(response.data.user), { expires: 7 });
			
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
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
			const response = await axios.post(`${API_URL}/admin/login`, { email, password });
			
			// Store user data in cookie
			Cookies.set('userData', JSON.stringify(response.data.user), { expires: 7 });
			
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			
			// Remove user data from cookie
			Cookies.remove('userData');
			
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			
			// Update user data in cookie
			Cookies.set('userData', JSON.stringify(response.data.user), { expires: 7 });
			
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			// Handle both cases: with token (user exists) or without token (user is null)
			if (response.data.success && response.data.user) {
				// User is authenticated
				set({ 
					user: response.data.user, 
					isAuthenticated: true, 
					isCheckingAuth: false 
				});
			} else {
				// No token or no user - not authenticated but no error
				set({ 
					user: null, 
					isAuthenticated: false, 
					isCheckingAuth: false,
					error: null 
				});
			}
		} catch (error) {
			// Even on error, just mark as not authenticated - don't throw
			console.log("checkAuth: No active session or error:", error.response?.data?.message || error.message);
			set({ 
				user: null, 
				isAuthenticated: false, 
				isCheckingAuth: false,
				error: null 
			});
		}
	},
	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
}));