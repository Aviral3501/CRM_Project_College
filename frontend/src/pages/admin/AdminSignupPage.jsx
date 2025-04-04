import { motion } from "framer-motion";
import Input from "../../components/Input";
import { Loader, Lock, Mail, User, Building, Globe, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import axios from "axios";

const AdminSignupPage = () => {
	const [organizationName, setOrganizationName] = useState("");
	const [industry, setIndustry] = useState("");
	const [location, setLocation] = useState("");
	const [website, setWebsite] = useState("");
	const [adminName, setAdminName] = useState("");
	const [adminEmail, setAdminEmail] = useState("");
	const [adminPassword, setAdminPassword] = useState("");
	
	const navigate = useNavigate();
	const { adminSignup, error, isLoading } = useAuthStore();

	const handleSignUp = async (e) => {
		e.preventDefault();

		// Basic validation
		if (!organizationName || !industry || !location || !adminName || !adminEmail || !adminPassword) {
			toast.error("Please fill in all required fields");
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(adminEmail)) {
			toast.error("Please enter a valid email address");
			return;
		}

		// Password strength validation
		if (adminPassword.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return;
		}

		const loadingToast = toast.loading("Creating organization...");

		try {
			await adminSignup({
				organizationName,
				industry,
				location,
				website,
				adminName,
				adminEmail,
				adminPassword,
			});

			toast.success("Organization created successfully!", {
				id: loadingToast,
			});
			
			// Clear form
			setOrganizationName("");
			setIndustry("");
			setLocation("");
			setWebsite("");
			setAdminName("");
			setAdminEmail("");
			setAdminPassword("");

			// Navigate to email verification
			navigate("/verify-email");
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Something went wrong";
			toast.error(errorMessage, {
				id: loadingToast,
			});
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Register Organization
				</h2>

				<form onSubmit={handleSignUp}>
					<h3 className='text-lg font-semibold text-green-400 mb-3'>Organization Details</h3>
					<Input
						icon={Building}
						type='text'
						placeholder='Organization Name *'
						value={organizationName}
						onChange={(e) => setOrganizationName(e.target.value)}
						required
					/>
					<Input
						icon={Building}
						type='text'
						placeholder='Industry *'
						value={industry}
						onChange={(e) => setIndustry(e.target.value)}
						required
					/>
					<Input
						icon={MapPin}
						type='text'
						placeholder='Location *'
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						required
					/>
					<Input
						icon={Globe}
						type='url'
						placeholder='Website (Optional)'
						value={website}
						onChange={(e) => setWebsite(e.target.value)}
					/>

					<h3 className='text-lg font-semibold text-green-400 mb-3 mt-6'>Admin Details</h3>
					<Input
						icon={User}
						type='text'
						placeholder='Admin Name *'
						value={adminName}
						onChange={(e) => setAdminName(e.target.value)}
						required
					/>
					<Input
						icon={Mail}
						type='email'
						placeholder='Admin Email *'
						value={adminEmail}
						onChange={(e) => setAdminEmail(e.target.value)}
						required
					/>
					<Input
						icon={Lock}
						type='password'
						placeholder='Admin Password *'
						value={adminPassword}
						onChange={(e) => setAdminPassword(e.target.value)}
						required
					/>
					
					{error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
					<PasswordStrengthMeter password={adminPassword} />

					<motion.button
						className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
						whileHover={{ scale: isLoading ? 1 : 1.02 }}
						whileTap={{ scale: isLoading ? 1 : 0.98 }}
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Register Organization"}
					</motion.button>
				</form>
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-between'>
				<p className='text-sm text-gray-400'>
					Already have an organization?{" "}
					<Link to='/admin/login' className='text-green-400 hover:underline'>
						Login as Admin
					</Link>
				</p>
				<p className='text-sm text-gray-400'>
					Employee?{" "}
					<Link to='/login' className='text-green-400 hover:underline'>
						Login here
					</Link>
				</p>
			</div>
		</motion.div>
	);
};

export default AdminSignupPage; 