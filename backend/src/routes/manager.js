import express from "express";
import { pool } from "../db.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken, requireRole("manager"));

// List all registered employees
router.get("/employees", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, date_joined FROM users WHERE role = 'employee' ORDER BY date_joined DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load employees" });
  }
});

// List all leave requests across all employees
router.get("/leaves", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT lr.id, lr.reason, lr.start_date, lr.end_date, lr.status, lr.remarks,
              lr.document_original_name, lr.created_at, lr.updated_at,
              u.username AS employee_username
       FROM leave_requests lr
       JOIN users u ON u.id = lr.user_id
       ORDER BY lr.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load leave requests" });
  }
});

// Approve or reject a leave request with remarks
router.patch("/leaves/:id", async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    const [result] = await pool.query(
      `UPDATE leave_requests SET status = ?, remarks = ? WHERE id = ?`,
      [status, remarks || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ?", [
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update leave request" });
  }
});

export default router;
