import express from "express";
import { getUserTasks, createTask } from "../controllers/task.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Changed from GET to POST
router.post("/fetch-tasks", verifyToken, getUserTasks);

// Create task route (already POST)
router.post("/create", verifyToken, createTask);

export default router; 