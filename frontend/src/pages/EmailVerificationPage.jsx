import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const EmailVerificationPage = () => {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();

	const { error, isLoading, verifyEmail } = useAuthStore();

	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			navigate("/");
			toast.success("Email verified successfully");
		} catch (error) {
			console.log(error);
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
	}, [code]);

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
					<motion.h2 
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text"
					>
						Verify Your Email
					</motion.h2>

					<motion.p 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.5 }}
						className="text-center text-gray-300 mb-8"
					>
						Enter the 6-digit code sent to your email address
					</motion.p>

					<form onSubmit={handleSubmit} className="space-y-8">
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.5 }}
							className="flex justify-between gap-2"
						>
							{code.map((digit, index) => (
								<motion.input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type="text"
									maxLength="6"
									value={digit}
									onChange={(e) => handleChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									whileFocus={{ scale: 1.05 }}
									className="w-12 h-14 text-center text-2xl font-bold bg-gray-700/50 text-white border-2 border-gray-600/50 rounded-lg 
											 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 
											 transition-all duration-200 backdrop-blur-sm
											 placeholder-gray-400"
								/>
							))}
						</motion.div>

						{error && (
							<motion.p 
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-red-500 font-semibold bg-red-500/10 p-3 rounded-lg text-center"
							>
								{error}
							</motion.p>
						)}

						<motion.button
							whileHover={{ scale: isLoading ? 1 : 1.02 }}
							whileTap={{ scale: isLoading ? 1 : 0.98 }}
							type="submit"
							disabled={isLoading || code.some((digit) => !digit)}
							className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 
									 text-white font-bold rounded-lg shadow-lg 
									 hover:from-green-600 hover:to-emerald-700 
									 focus:outline-none focus:ring-2 focus:ring-green-500 
									 focus:ring-offset-2 focus:ring-offset-gray-900 
									 transition duration-200 
									 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<div className="flex items-center justify-center gap-2">
									<svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									<span>Verifying...</span>
								</div>
							) : (
								"Verify Email"
							)}
						</motion.button>

						<motion.p 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.5 }}
							className="text-center text-sm text-gray-400 mt-4"
						>
							Didn't receive the code?{" "}
							<button 
								type="button"
								className="text-green-400 hover:text-green-300 font-medium hover:underline focus:outline-none"
							>
								Resend
							</button>
						</motion.p>
					</form>
				</div>
			</motion.div>
		</div>
	);
};
export default EmailVerificationPage;