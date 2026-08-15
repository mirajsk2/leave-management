# Employee Leave Management System

A full-stack web app with employee/manager authentication, role-based access, a leave
application + approval workflow, file uploads, and in-app notifications.

## Architecture & design decisions

- **Frontend:** React (Vite) + React Router. Auth state (JWT + user) lives in
  `localStorage` and is exposed via `AuthContext`. `ProtectedRoute` blocks access to a
  page unless the user is logged in and has the right role, so employees can never open
  manager pages and vice versa.
- **Backend:** Node.js + Express. JWT-based auth (`Authorization: Bearer <token>`).
  `authenticateToken` middleware verifies the token on every protected route;
  `requireRole('manager')` additionally locks down all `/api/manager/*` routes.
- **Database:** MySQL (via `mysql2`), connecting to a local MySQL server by default. Two
  tables: `users` (role is either `employee` or `manager`) and `leave_requests` (status
  is `pending` / `approved` / `rejected`).
- **File uploads:** Handled with `multer`, saved to disk on the backend
  (`backend/uploads/`), and served back through an authenticated download route
  (`GET /api/leaves/:id/document`) so only the owning employee or the manager can fetch
  the file — it's never a public static folder.
- **Manager account:** There is no "create manager" endpoint anywhere in the app. The one
  manager account (`manager@gcu.in` by default) is created by a one-time seed script,
  matching the brief's requirement that only a predefined account can reach the Manager
  Portal.
- **Notifications:** No email/SMS. The frontend compares each leave request's status
  against what it last saw (stored per-user in `localStorage`) and fires an in-app toast
  whenever a request flips to `approved` or `rejected`.

## Project structure

```
leave-management/
  backend/       Express API + PostgreSQL access + file uploads
  frontend/      React (Vite) app
```

## 1. Run it locally

You'll need Node.js 18+ and a MySQL server running locally (MySQL Workbench, XAMPP,
or `mysql` CLI — any of these is fine, as long as the server is running).

First, create an empty database:

```sql
CREATE DATABASE leave_management;
```

### Backend

```bash
cd backend
cp .env.example .env
# edit .env: set DB_USER / DB_PASSWORD to your local MySQL credentials,
# and set JWT_SECRET to any long random string
npm install
npm run seed     # creates tables + the manager account (+ sample data if enabled)
npm run dev       # starts the API on http://localhost:5000
```

If `npm run seed` can't connect, double-check `DB_HOST`, `DB_PORT` (3306 by default),
`DB_USER`, and `DB_PASSWORD` in `backend/.env` match your local MySQL setup, and that
the `leave_management` database exists.

### Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000 is correct for local dev
npm install
npm run dev              # starts the app on http://localhost:5173
```

Open `http://localhost:5173`. Log in as the manager with the credentials from
`backend/.env` (`MANAGER_EMAIL` / `MANAGER_PASSWORD`), or register a new employee
account.

## 2. Push to GitHub

From the `leave-management` folder:

```bash
git init
git add .
git commit -m "Initial commit: leave management system"
```

Then on GitHub: create a new empty repository (no README/gitignore, you already have
those), copy the URL it gives you, and run:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

`.env` files are already git-ignored on both sides, so no secrets get committed.

## 3. Deploy

You need three things: a hosted MySQL database, the backend API, and the frontend.
Render's free tier doesn't include managed MySQL, so use one of these free MySQL hosts
instead — either works the same way from here on:

- [Aiven](https://aiven.io) — free MySQL plan
- [Railway](https://railway.app) — MySQL from their template marketplace (also hosts
  your backend if you'd rather keep everything on one platform)
- [Clever Cloud](https://www.clever-cloud.com) — free MySQL add-on

### Step A — Database

1. Create a MySQL instance on whichever provider you pick.
2. Note the host, port, username, password, and database name it gives you — you'll use
   these as `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` below.

### Step B — Backend (Render)

1. Go to [render.com](https://render.com) → New → Web Service → connect your GitHub repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (Render dashboard → Environment):
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — from Step A
   - `JWT_SECRET` — a long random string
   - `MANAGER_EMAIL` = `manager@gcu.in`
   - `MANAGER_PASSWORD` — your choice, document it for the demo
   - `CORS_ORIGIN` — your frontend URL (you'll get this in Step C — you can add it after)
   - `SEED_SAMPLE_DATA` = `true` (optional, for demo data)
6. Deploy. Once it's live, open the Render **Shell** tab for the service and run:
   ```bash
   npm run seed
   ```
   This creates the tables and the manager account in your hosted database.
7. Note your backend's public URL, e.g. `https://leave-backend.onrender.com`.

> Free Render web services spin down after inactivity and take ~30–60s to wake up on
> the next request — normal for the free tier, not a bug.

### Step C — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → import your GitHub repo.
2. Root directory: `frontend`
3. Framework preset: Vite (auto-detected).
4. Add environment variable: `VITE_API_URL` = your Render backend URL from Step B.
5. Deploy. Vercel gives you a URL like `https://leave-management.vercel.app`.
6. Go back to Render → your backend's environment variables → set `CORS_ORIGIN` to that
   Vercel URL exactly (no trailing slash) → save (it will redeploy automatically).

### Step D — Verify the full workflow

1. Open your Vercel URL, register a new employee, apply for leave with a file attached.
2. Log out, log in as the manager, open **Leave Requests**, approve or reject it with a
   remark.
3. Log back in as the employee — the status is updated and a toast notification
   appears.

## Sample / demo credentials

- **Manager:** `manager@gcu.in` / whatever you set as `MANAGER_PASSWORD`
- **Sample employee** (only created if `SEED_SAMPLE_DATA=true`): `jane_employee` /
  `Employee@123`, with one pending leave request already submitted.
