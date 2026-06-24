import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import authRouter from "./routes/auth";
import projectsRouter from "./routes/projects";
import testimonialsRouter from "./routes/testimonials";
import ticketsRouter from "./routes/tickets";
import mediaRouter from "./routes/media";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "./uploads")));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/media", mediaRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n  Solide API → http://localhost:${PORT}\n`);
});
