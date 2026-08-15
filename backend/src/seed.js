import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log("Running schema migration...");
  const schemaSql = fs.readFileSync(
    path.join(__dirname, "migrations", "schema.sql"),
    "utf-8"
  );

  // Strip full-line comments first, then split into individual statements -
  // mysql2's pool.query() doesn't run multiple ;-separated statements at once.
  const withoutComments = schemaSql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await pool.query(statement);
  }
  console.log("Schema is up to date.");

  const managerEmail = process.env.MANAGER_EMAIL || "manager@gcu.in";
  const managerPassword = process.env.MANAGER_PASSWORD || "Manager@123";

  const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [
    managerEmail,
  ]);

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash(managerPassword, 10);
    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'manager')",
      [managerEmail, passwordHash]
    );
    console.log(`Manager account created: ${managerEmail} / ${managerPassword}`);
  } else {
    console.log(`Manager account already exists: ${managerEmail}`);
  }

  if (process.env.SEED_SAMPLE_DATA === "true") {
    const sampleUsername = "jane_employee";
    const samplePassword = "Employee@123";

    let sampleUserId;
    const [existingEmployee] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [sampleUsername]
    );

    if (existingEmployee.length === 0) {
      const hash = await bcrypt.hash(samplePassword, 10);
      const [inserted] = await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'employee')",
        [sampleUsername, hash]
      );
      sampleUserId = inserted.insertId;
      console.log(`Sample employee created: ${sampleUsername} / ${samplePassword}`);
    } else {
      sampleUserId = existingEmployee[0].id;
      console.log(`Sample employee already exists: ${sampleUsername}`);
    }

    const [existingLeave] = await pool.query(
      "SELECT id FROM leave_requests WHERE user_id = ?",
      [sampleUserId]
    );

    if (existingLeave.length === 0) {
      await pool.query(
        `INSERT INTO leave_requests (user_id, reason, start_date, end_date, status)
         VALUES (?, 'Family function', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'pending')`,
        [sampleUserId]
      );
      console.log("Sample leave request created (pending).");
    }
  }

  await pool.end();
  console.log("Seed complete.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});