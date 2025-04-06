import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import api from '../api/axios';

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [organizationName, setOrganizationName] = useState("");
	const [organizations, setOrganizations] = useState([]);
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				const response = await api.post('/auth/organizations');
				if (response.data.success) {
					setOrganizations(response.data.organizations);
					console.log("Fetched organizations:", response.data.organizations);
				}
			} catch (error) {
				console.error("Error fetching organizations:", error);
				toast.error("Failed to load organizations");
			}
		};

		fetchOrganizations();
	}, []);

	const handleSignUp = async (e) => {
		e.preventDefault();

		// Trim the organization name to remove any whitespace
		const trimmedOrgName = organizationName.trim();

		// Basic validation
		if (!name || !email || !password || !trimmedOrgName) {
			toast.error("Please fill in all required fields");
			return;
		}

		// Debug log to check values
		console.log("Signup values:", {
			email,
			password,
			name,
			organizationName: trimmedOrgName
		});

		const loadingToast = toast.loading("Creating account...");

		try {
			// Make sure all parameters are passed in the correct order
			await signup({
				email,
				password,
				name,
				organizationName: trimmedOrgName
			});
			
			toast.success("Account created successfully!", {
				id: loadingToast,
			});
			navigate("/verify-email");
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
						Create Account
					</h2>

					<form onSubmit={handleSignUp}>
						<div className="relative mb-4">
							<select
								className="w-full p-3 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 backdrop-blur-xl"
								value={organizationName}
								onChange={(e) => {
									console.log("Selected organization:", e.target.value);
									setOrganizationName(e.target.value);
								}}
								required
							>
								<option value="">Select Organization</option>
								{organizations.map((org) => (
									<option key={org.org_id} value={org.name}>
										{org.name} - {org.industry}
									</option>
								))}
							</select>
							<Building className="absolute right-3 top-3 text-gray-400" size={20} />
						</div>

						<Input
							icon={User}
							type="text"
							placeholder="Full Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="mb-4"
						/>

						<Input
							icon={Mail}
							type="email"
							placeholder="Email Address"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mb-4"
						/>

						<Input
							icon={Lock}
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mb-4"
						/>

						{error && (
							<p className="text-red-500 font-semibold mt-2 mb-4">{error}</p>
						)}

						<PasswordStrengthMeter password={password} />

						<motion.button
							className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							whileHover={{ scale: isLoading ? 1 : 1.02 }}
							whileTap={{ scale: isLoading ? 1 : 0.98 }}
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader className="animate-spin mx-auto" size={24} />
							) : (
								"Sign Up"
							)}
						</motion.button>
					</form>
				</div>

				<div className="px-8 py-4 bg-gray-900/50 backdrop-blur-sm flex justify-between">
					<p className="text-sm text-gray-400">
						Already have an account?{" "}
						<Link to="/login" className="text-green-400 hover:underline">
							Login
						</Link>
					</p>
					<Link
						to="/admin/signup"
						className="text-sm text-green-400 hover:underline"
					>
						Register Organization
					</Link>
				</div>
			</motion.div>
		</div>
	);
};

export default SignUpPage;