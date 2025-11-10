import express from "express";
import { 
    checkAuth, 
    forgotPassword, 
    login, 
    logout, 
    resetPassword, 
    signup, 
    verifyEmail, 
    adminSignup 
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { Organization } from "../models/org.model.js";

const router = express.Router();
// all routes are /api/auth/.....

// Admin routes
router.post("/admin/signup", adminSignup);
router.post("/admin/login", login); // Using same login endpoint as it handles role checking

// Employee routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Common routes
router.get("/check-auth", verifyToken, checkAuth);
router.post("/verify-email", verifyEmail);
router.post("/reset-password/:token", resetPassword);
router.post("/forgot-password", forgotPassword);

// Organizations list route
router.post("/organizations", async (req, res) => {
    try {
        const organizations = await Organization.find({})
            .select('name industry address website org_id createdAt totalRevenue')
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean();
        
        console.log(`Found ${organizations.length} organizations`); // Debug log

        if (!organizations || organizations.length === 0) {
            return res.status(200).json({
                success: true,
                organizations: [],
                message: "No organizations found"
            });
        }

        res.status(200).json({
            success: true,
            count: organizations.length,
            organizations: organizations.map(org => ({
                org_id: org.org_id,
                name: org.name,
                industry: org.industry || 'Not specified',
                address: org.address || 'Not specified',
                website: org.website || 'N/A',
                createdAt: org.createdAt,
                totalRevenue: org.totalRevenue || 0
            }))
        });
    } catch (error) {
        console.error("Error fetching organizations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch organizations",
            error: error.message
        });
    }
});

export default router;