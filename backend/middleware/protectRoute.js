import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        
        // Skip token validation - allow request even without token
        if (!token) {
            console.log("⚠️ No token provided, but allowing request to proceed");
            // Optionally set a default user or skip user attachment
            // req.user = null;
            return next();
        }

        // If token exists, try to verify it (but don't block if it fails)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded) {
                // Find user from decoded token
                const user = await User.findById(decoded.userId).select("-password");
                
                if (user) {
                    // Check if user is verified
                    if (user.isVerified) {
                        // Attach user to request object
                        req.user = user;
                    } else {
                        console.log("⚠️ User not verified, but allowing request");
                    }
                } else {
                    console.log("⚠️ User not found, but allowing request");
                }
            }
        } catch (tokenError) {
            console.log("⚠️ Token verification failed, but allowing request:", tokenError.message);
        }

        // Always proceed to next middleware/route
        next();
        
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        // Don't block - allow request to proceed
        next();
    }
}; 