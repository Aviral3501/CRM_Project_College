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


const allowedOrigins = process.env.FRONTEND_URLS?.split(",") || ["*"];

console.log("ALLOWD ORIGINS :",allowedOrigins)

// Use CORS middleware
app.use(
	cors({
	  origin: function (origin, callback) {
		if (!origin) return callback(null, true); // allow curl, Postman, etc.
		if (allowedOrigins.includes(origin)) {
		  // ✅ reflect exact allowed origin in response header
		  return callback(null, origin);
		}
		return callback(new Error("CORS blocked for origin: " + origin));
	  },
	  credentials: true,
	  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	})
  );
// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());



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

console.log("process.env.VITE_BACKEND_URL =",process.env.VITE_BACKEND_URL)

if (process.env.NODE_ENV === "production") {
	console.log("here")
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