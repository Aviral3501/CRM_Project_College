import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import { useAuthStore } from "../../store/authStore";
import { useUser } from "../../context/UserContext";
import toast from "react-hot-toast";

const AdminLoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { adminLogin, error, isLoading } = useAuthStore();
	const { setUser } = useUser();

	const handleLogin = async (e) => {
		e.preventDefault();

		// Basic validation
		if (!email || !password) {
			toast.error("Please fill in all fields");
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		const loadingToast = toast.loading("Logging in...");

		try {
			const response = await adminLogin(email, password);
			
			// Update the global context with user data
			setUser(response.user);
			
			toast.success("Logged in successfully!", {
				id: loadingToast,
			});
			navigate("/dashboard");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
			toast.error(errorMessage, {
				id: loadingToast,
			});
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 relative">
			{/* Background Gradients */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_rgba(31,41,55,0.4),transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(16,185,129,0.2),transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,_rgba(59,130,246,0.2),transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(236,72,153,0.2),transparent_50%)]"></div>
			</div>

			{/* Main Content */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full relative z-10 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
			>
				<div className="p-8">
					<h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
						Admin Login
					</h2>

					<form onSubmit={handleLogin} className="space-y-4">
						<Input
							icon={Mail}
							type="email"
							placeholder="Admin Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>

						<Input
							icon={Lock}
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>

						<div className="flex items-center justify-between">
							<Link to="/forgot-password" className="text-sm text-green-400 hover:underline">
								Forgot password?
							</Link>
							<Link to="/login" className="text-sm text-green-400 hover:underline">
								Employee Login
							</Link>
						</div>

						{error && <p className="text-red-500 font-semibold">{error}</p>}

						<motion.button
							className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							whileHover={{ scale: isLoading ? 1 : 1.02 }}
							whileTap={{ scale: isLoading ? 1 : 0.98 }}
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader className="animate-spin mx-auto" size={24} />
							) : (
								"Login as Admin"
							)}
						</motion.button>
					</form>
				</div>

				<div className="px-8 py-4 bg-gray-900/50 backdrop-blur-sm flex justify-between">
					<p className="text-sm text-gray-400">
						Register an organization?{" "}
						<Link to="/admin/signup" className="text-green-400 hover:underline">
							Register
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default AdminLoginPage; 