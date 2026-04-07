# TaskFlow — Smart Task & Activity Management System

A full-stack task management system built with Node.js, Express, React, Vite, Tailwind CSS v4, PostgreSQL (Neon), Socket.io, and Google Gemini AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL via Neon (cloud, no local install) |
| Auth | JWT Access Token + Refresh Token |
| Real-time | Socket.io |
| AI Feature | Google Gemini flash-latest |
| State | Zustand + TanStack Query |
| Caching | node-cache (in-memory) |
| Rate Limiting | express-rate-limit |

---

## Features

- JWT authentication with refresh token rotation
- Role-based access control (Admin / User)
- Full CRUD for tasks with filters, sorting, pagination
- Activity log for every task change
- Real-time task updates via Socket.io
- AI-powered task summarization (Gemini)
- In-memory caching layer
- Rate limiting on all API routes
- Fully responsive UI

---

## Prerequisites

- Node.js v25.1+
- npm v11.6.4+
- A [Neon](https://neon.tech) account (free)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/bhaskarRao-22/smart-task-manager.git
cd smart-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/db?sslmode=verify-full
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_long_random_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## First Time Usage

1. Go to `http://localhost:5173/register`
2. Register with **role: admin** — first admin registration is accepted
3. Register 4+ more users with role: user
4. Login and start creating tasks!

---

## Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root to `backend/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, set root to `frontend/`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
4. Deploy!

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register user | Public |
| POST | /api/auth/login | Login | Public |
| POST | /api/auth/refresh | Refresh token | Public |
| POST | /api/auth/logout | Logout | Public |
| GET | /api/auth/me | Get current user | Auth |
| GET | /api/tasks | Get tasks (filter/sort/page) | Auth |
| POST | /api/tasks | Create task | Auth |
| GET | /api/tasks/:id | Get single task | Auth |
| PUT | /api/tasks/:id | Update task | Auth |
| DELETE | /api/tasks/:id | Delete task | Auth |
| POST | /api/tasks/:id/summarize | AI summarize | Auth |
| GET | /api/activities/task/:id | Task activities | Auth |
| GET | /api/activities | All activities | Admin |
| GET | /api/users | All users | Admin |
| PUT | /api/users/:id | Update user | Auth |
| PATCH | /api/users/:id/toggle-status | Toggle active | Admin |

---

## Assumptions & Trade-offs

- **Neon PostgreSQL** used to avoid local database setup
- **In-memory cache** (node-cache) used instead of Redis for simplicity
- **Admin role** is only granted to first registrant who selects admin
- **Access tokens** expire in 15 minutes; refresh tokens in 7 days
- **AI summarization** requires description of 20+ characters
- Socket.io broadcasts task events globally (all connected clients)