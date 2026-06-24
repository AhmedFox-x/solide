import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import sharp from "sharp";

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || "./uploads",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|glb|obj/.test(path.extname(file.originalname).toLowerCase());
    const mime = /image\/|video\/|model\/|glb|obj/.test(file.mimetype);
    cb(null, ext || mime);
  },
});

router.get("/", requireAuth, async (_req, res) => {
  try {
    const files = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ files });
  } catch (err) {
    console.error("Failed to fetch media:", err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let url = `/uploads/${req.file.filename}`;
    let mimeType = req.file.mimetype;
    let mediaType = mimeType.startsWith("video") ? "video" : mimeType.includes("model") || mimeType.includes("glb") ? "3d" : "image";

    if (mediaType === "image" && mimeType !== "image/webp") {
      const webpName = `${uuid()}.webp`;
      const webpPath = path.join(process.env.UPLOAD_DIR || "./uploads", webpName);
      await sharp(req.file.path).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toFile(webpPath);
      url = `/uploads/${webpName}`;
      mimeType = "image/webp";
    }

    const file = await prisma.media.create({
      data: {
        filename: req.file.filename,
        url,
        mimeType,
        sizeBytes: req.file.size,
        mediaType,
        altText: (req.body.altText as string) || null,
      },
    });
    res.status(201).json({ file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.media.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete media:", err);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
