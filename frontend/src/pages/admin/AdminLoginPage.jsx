import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const AdminLoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { adminLogin, error, isLoading } = useAuthStore();

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
			toast.success("Logged in successfully!", {
				id: loadingToast,
			});
			navigate("/admin/dashboard");
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
					Admin Login
				</h2>

				<form onSubmit={handleLogin}>
					<Input
						icon={Mail}
						type='email'
						placeholder='Admin Email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<Input
						icon={Lock}
						type='password'
						placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className='flex items-center justify-between mb-6'>
                        <Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>
                            Forgot password?
                        </Link>

                        <p className='text-sm text-gray-400'>
                           
                            <Link to='/login' className='text-green-400 hover:underline'>
                                Employee Login
                            </Link>
                        </p>
                    </div>
                    {error && <p className='text-red-500 font-semibold mb-4'>{error}</p>}

					<motion.button
						className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
						whileHover={{ scale: isLoading ? 1 : 1.02 }}
						whileTap={{ scale: isLoading ? 1 : 0.98 }}
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? <Loader className='animate-spin mx-auto' size={24} /> : "Login as Admin"}
					</motion.button>
				</form>
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-between'>
				<p className='text-sm text-gray-400'>
				Register an organization?{" "}
					<Link to='/admin/signup' className='text-green-400 hover:underline'>
						Register 
					</Link>
				</p>

			</div>
		</motion.div>
	);
};

export default AdminLoginPage; 