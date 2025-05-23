import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import s3Routes from "./routes/s3Routes.js";




// Initialize Express app and configuration variables
const app = express();
const port = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Remove or set Cross-Origin-Opener-Policy header to avoid browser blocking
app.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Opener-Policy');
  next();
});

// Middleware to parse incoming JSON requests
app.use(express.json());

// --- Mount Routers --- //
async function startServer() {
  // Mount routes
  app.use('/api/auth', authRoutes());
  app.use('/api/s3', s3Routes());





  // Start the Express server on the configured port
  app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
}

// Start the server and handle startup errors
startServer().catch((err) => {
  console.error("❌ Server startup failed:", err);
  process.exit(1);
});

// Graceful shutdown handler for SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("Server shutting down...");
  process.exit(0);
});