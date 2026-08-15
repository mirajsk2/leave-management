import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

// Employee self-registration only. Managers can never be created through this route.
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [
      username,
    ]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'employee')",
      [username, passwordHash]
    );

    const [rows] = await pool.query(
      "SELECT id, username, role, date_joined FROM users WHERE id = ?",
      [result.insertId]
    );
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
