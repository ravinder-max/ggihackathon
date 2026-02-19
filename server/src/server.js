import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import recordsRouter from "./routes/records.js";
import aiRouter from "./routes/ai.js";
import emergencyRouter from "./routes/emergency.js";
import { env } from "./config/env.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/records", recordsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/emergency", emergencyRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "medledger-server" });
});

async function start() {
  await mongoose.connect(env.mongoUri);
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

start().catch(error => {
  console.error("Server startup failed", error);
  process.exit(1);
});
