import jwt from "jsonwebtoken"; 

// Function to generate a JWT token and set it as a cookie
export const generateTokenAndSetCookie = (res, userId) => {
	// Create a JWT token with user ID and a secret, set to expire in 7 days
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d", 
	});

	
	res.cookie("token", token, {
		httpOnly: true,
		secure: true, // ✅ force HTTPS-only cookies always
		sameSite: "none", // ✅ allow cross-origin
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	  });
	  

	return token; // Return the generated token
};