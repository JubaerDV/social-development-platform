import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import healthRoutes from "./routes/health.routes.js";
import eventRoutes from "./routes/events.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/events", eventRoutes);

export default app;
