import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import projectRoutes from "./routes/project.routes.js";
import orgUserRoutes from "./routes/orgUser.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import clientRoutes from "./routes/client.routes.js";
import pipelineRoutes from "./routes/pipeline.routes.js";
import quoteRoutes from "./routes/quote.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();


// Helper function to check if origin is actually localhost (with any port)
const isLocalhost = (origin) => {
    if (!origin) return false;
    try {
        const url = new URL(origin);
        // Check if hostname is exactly 'localhost' or '127.0.0.1'
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
    } catch (error) {
        return false;
    }
};

// Define allowed origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://crm-project-college.vercel.app", // Vercel deployed frontend
    process.env.CLIENT_URL, // Your deployed frontend URL (if set)
    process.env.FRONTEND_URL, // Alternative env variable name
].filter(Boolean); // Remove undefined values

// Use CORS middleware - allow localhost and origins in allowed list
app.use(cors({ 
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl, mobile apps)
        if (!origin) return callback(null, true);
        
        // Allow if in allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        // Allow if actually localhost (with any port) - SECURE check using URL parsing
        else if (isLocalhost(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // CRITICAL: Allow credentials (cookies)
}));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.get("/", (req, res) => res.send("bakcend root API working"));
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/org-users", orgUserRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// 404 handler
app.use((req, res) => {
	console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
	res.status(404).json({
		success: false,
		message: 'Route not found'
	});
});

app.listen(PORT, () => {
	connectDB();
	console.log(`Server is running on port: ${PORT}`);
});