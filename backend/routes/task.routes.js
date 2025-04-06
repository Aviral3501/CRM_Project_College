import express from "express";
import { createTask, getUserTasks } from "../controllers/task.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protectRoute);

// POST /api/get-task - Get all tasks for the logged-in user
router.post("/get-task", getUserTasks);

// POST /api/create-task - Create a new task
router.post("/create-task", createTask);

export default router; 