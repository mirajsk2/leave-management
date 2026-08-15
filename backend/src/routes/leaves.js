import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomUUID();
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// All routes here require a logged-in user
router.use(authenticateToken);

// Apply for leave (employee submits, file goes to disk not just a text field)
router.post("/", upload.single("document"), async (req, res) => {
  try {
    const { reason, startDate, endDate } = req.body;
    if (!reason || !startDate || !endDate) {
      return res.status(400).json({ error: "reason, startDate and endDate are required" });
    }

    const documentPath = req.file ? req.file.filename : null;
    const documentOriginalName = req.file ? req.file.originalname : null;

    const [result] = await pool.query(
      `INSERT INTO leave_requests (user_id, reason, start_date, end_date, document_path, document_original_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, reason, startDate, endDate, documentPath, documentOriginalName]
    );

    const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit leave request" });
  }
});

// View own leave history
router.get("/mine", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, reason, start_date, end_date, status, remarks, document_original_name, created_at, updated_at
       FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load leave history" });
  }
});

// Download/view the supporting document - owner or manager only
router.get("/:id/document", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ?", [
      req.params.id,
    ]);
    const leave = rows[0];
    if (!leave) return res.status(404).json({ error: "Not found" });

    const isOwner = leave.user_id === req.user.id;
    const isManager = req.user.role === "manager";
    if (!isOwner && !isManager) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!leave.document_path) {
      return res.status(404).json({ error: "No document attached" });
    }

    const filePath = path.join(UPLOAD_DIR, leave.document_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }
    res.download(filePath, leave.document_original_name || leave.document_path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

export default router;
