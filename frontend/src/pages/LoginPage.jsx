import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { useUser } from "../context/UserContext";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [organizationName, setOrganizationName] = useState("");
	const navigate = useNavigate();

	const { login, isLoading, error } = useAuthStore();
	const { setUser } = useUser();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const response = await login(email, password, organizationName);
			if (response.success) {
				// Update the global context with user data
				setUser(response.user);
				navigate('/dashboard');
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
			<div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_rgba(31,41,55,0.4),transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_rgba(16,185,129,0.2),transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,_rgba(59,130,246,0.2),transparent_50%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(236,72,153,0.2),transparent_50%)]"></div>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full relative z-10 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
			>
				<div className='p-8'>
					<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						Welcome Back
					</h2>

					<form onSubmit={handleLogin}>
						{/* <Input
							icon={Building}
							type='text'
							placeholder='Organization Name'
							value={organizationName}
							onChange={(e) => setOrganizationName(e.target.value)}
						/> */}

						<Input
							icon={Mail}
							type='email'
							placeholder='Email Address'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>

						<Input
							icon={Lock}
							type='password'
							placeholder='Password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>

						<div className='flex items-center justify-between mb-6'>
							<Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>
								Forgot password?
							</Link>
							<Link to='/admin/login' className='text-sm text-green-400 hover:underline'>
								Admin Login
							</Link>
						</div>
						{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Login"}
						</motion.button>
					</form>
				</div>
				<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
					<p className='text-sm text-gray-400'>
						Don't have an account?{" "}
						<Link to='/signup' className='text-green-400 hover:underline'>
							Sign up
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default LoginPage;