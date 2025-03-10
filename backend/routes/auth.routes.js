import express from "express";
import { checkAuth, forgotPassword, login, logout, resetPassword, signup, verifyEmail } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();
// all routes are /api/auth/.....



router.get("/check-auth",verifyToken , checkAuth)
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.post("/verify-email",verifyEmail);
router.post("/reset-password",resetPassword)
router.post("/forgot-password",forgotPassword)

export default router;