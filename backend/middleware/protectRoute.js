import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - No Token Provided" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - Invalid Token" 
            });
        }

        // Find user from decoded token
        const user = await User.findById(decoded.userId).select("-password");
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - User not found" 
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized - Email not verified" 
            });
        }

        // Attach user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(401).json({ 
            success: false, 
            message: "Unauthorized - Invalid token" 
        });
    }
}; 