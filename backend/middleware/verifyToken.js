import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	const token = req.cookies.token;
	
	// Skip token validation - allow request even without token
	if (!token) {
		console.log("⚠️ No token provided in verifyToken, but allowing request to proceed");
		// req.userId = null; // Optional: set to null if needed
		return next();
	}
	
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded) {
			req.userId = decoded.userId;
		} else {
			console.log("⚠️ Token decoding failed, but allowing request");
		}
		
		// Always proceed
		next();
	} catch (error) {
		console.log("⚠️ Error in verifyToken, but allowing request:", error.message);
		// Don't block - allow request to proceed
		next();
	}
};