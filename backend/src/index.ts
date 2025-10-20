import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import petRoutes from "./routes/pets";
import careRoutes from "./routes/care";
import { authenticateToken } from "./middleware/auth";
import { updateCareEvent } from "./controllers/careController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced request/response logging
app.use((req, res, next) => {
  const start = Date.now();

  // Log request
  console.log("\n" + "=".repeat(60));
  console.log(`➡️  ${req.method} ${req.path}`);

  // Log request body (excluding passwords)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "***";
    console.log("📦 Body:", JSON.stringify(sanitizedBody, null, 2));
  }

  // Log query params
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("🔍 Query:", req.query);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - start;
    console.log(`⬅️  Response: ${res.statusCode} (${duration}ms)`);

    // Log error responses
    if (res.statusCode >= 400) {
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        console.log("❌ Error:", parsed.error || parsed.message || data);
      } catch {
        console.log("❌ Error:", data);
      }
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log("✅ Success");
    }

    console.log("=".repeat(60));
    return originalSend.call(this, data);
  };

  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", petRoutes);
app.use("/api/pets", careRoutes);

// Care event update route (separate from pet-scoped routes)
app.patch("/api/care/events/:id", authenticateToken, updateCareEvent);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
