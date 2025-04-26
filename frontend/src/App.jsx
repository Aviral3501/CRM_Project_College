import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

// Layout and UI Components
import Layout from './components/Layout';
import LoadingSpinner from "./components/LoadingSpinner";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminSignupPage from "./pages/admin/AdminSignupPage";

// Main App Pages
import Dashboard from './pages/Dashboard';
import Leads from './pages/sales/Leads';
import Pipeline from './pages/sales/Pipeline';
import Customers from './pages/sales/Customers';
import Quotes from './pages/sales/Quotes';
import Projects from './pages/projects/Projects';
import Tasks from './pages/tasks/Tasks';
import Employees from './pages/employees/Employees';
import Analytics from './pages/analytics/Analytics';
import Notifications from './pages/notifications/Notifications';

import { useAuthStore } from "./store/authStore";
import { useUser } from "./context/UserContext";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	const { isLoggedIn, isVerified } = useUser();

	if (!isAuthenticated || !isLoggedIn()) {
		return <Navigate to='/login' replace />;
	}

	if (!isVerified()) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated } = useAuthStore();
	const { isLoggedIn, isVerified } = useUser();

	if (isAuthenticated && isLoggedIn() && isVerified()) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

const App = () => {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<>
			<Routes>
				{/* Public Auth Routes */}
				<Route path="/login" element={
					<RedirectAuthenticatedUser>
						<LoginPage />
					</RedirectAuthenticatedUser>
				} />
				<Route path="/signup" element={
					<RedirectAuthenticatedUser>
						<SignUpPage />
					</RedirectAuthenticatedUser>
				} />
				<Route path="/admin/login" element={
					<RedirectAuthenticatedUser>
						<AdminLoginPage />
					</RedirectAuthenticatedUser>
				} />
				<Route path="/admin/signup" element={
					<RedirectAuthenticatedUser>
						<AdminSignupPage />
					</RedirectAuthenticatedUser>
				} />
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />
				<Route path="/reset-password/:token" element={<ResetPasswordPage />} />

				{/* Protected Routes - All inside Layout */}
				<Route path="/" element={
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				}>
					<Route index element={<Navigate to="/dashboard" replace />} />
					<Route path="dashboard" element={<Dashboard />} />
					<Route path="sales/leads" element={<Leads />} />
					<Route path="sales/pipeline" element={<Pipeline />} />
					<Route path="sales/customers" element={<Customers />} />
					<Route path="sales/quotes" element={<Quotes />} />
					<Route path="projects" element={<Projects />} />
					<Route path="tasks" element={<Tasks />} />
					<Route path="employees" element={<Employees />} />
					<Route path="analytics" element={<Analytics />} />
					<Route path="notifications" element={<Notifications />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
};

export default App;