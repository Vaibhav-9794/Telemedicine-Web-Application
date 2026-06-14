# 🏥 MediCare — Telemedicine Web Application

A full-stack telemedicine platform with real-time video consultations, AI symptom checking, appointment management, and comprehensive patient health records.

## ✨ Features

- **Video Consultations** — WebRTC-powered face-to-face sessions
- **Real-time Chat** — Socket.io instant messaging between patients & doctors
- **AI Symptom Checker** — Intelligent symptom analysis with doctor recommendations
- **Appointment System** — Search, book, accept/reject appointments
- **Prescriptions** — Doctor-issued prescriptions with PDF download
- **Medical Reports** — Upload and manage X-rays, lab reports, CT scans
- **Patient Health Records** — Blood group, allergies, medications, BMI tracking
- **Admin Dashboard** — User management, verification, contact messages
- **Email Notifications** — Nodemailer + Gmail SMTP for contact form
- **Dark Mode** — Full dark/light theme support

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | JSON file-based (JSONDatabase class) |
| Real-time | Socket.io, WebRTC |
| Auth | JWT (JSON Web Tokens) |
| Email | Nodemailer + Gmail SMTP |
| 3D Graphics | Three.js |

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ 
- npm 9+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Telemedicine-Web-Application

# Backend
cd backend
cp .env.example .env    # Edit with your values
npm install

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-strong-secret-here
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=your-admin-email@gmail.com
CORS_ORIGINS=http://localhost:3000
```

> **Gmail App Password**: Go to https://myaccount.google.com/apppasswords → Generate for "Mail"

### 3. Seed Demo Data

```bash
cd backend
node seed.js
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

Open http://localhost:3000

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Patient | john@patient.com | password123 |
| Doctor | dr.smith@doctor.com | password123 |
| Admin | admin@medicare.com | password123 |

---

## 🐳 Docker Deployment

```bash
# Build and run both services
docker compose up -d --build

# View logs
docker compose logs -f
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000

---

## ☁️ Cloud Deployment

### Option 1: Render (Recommended — Free Tier)

**Backend:**
1. Create a new **Web Service** on [Render](https://render.com)
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add environment variables from `.env.example`

**Frontend:**
1. Create a new **Web Service**
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Set `NEXT_PUBLIC_API_URL` to your backend URL

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend && railway init && railway up

# Deploy frontend
cd ../frontend && railway init && railway up
```

### Option 3: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
cd frontend
npx vercel --prod
```
Set `NEXT_PUBLIC_API_URL` in Vercel project settings.

**Backend on Render:** Follow Option 1 backend steps.

### Option 4: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone project
git clone <repo> && cd Telemedicine-Web-Application

# Backend
cd backend && npm ci --omit=dev
cp .env.example .env  # Configure
pm2 start server.js --name medicare-api

# Frontend  
cd ../frontend && npm ci && npm run build
pm2 start npm --name medicare-web -- start

# Nginx reverse proxy (optional)
sudo apt install nginx
```

---

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js          # JSON database engine
│   ├── controllers/          # Route handlers
│   ├── middleware/auth.js     # JWT auth + role guard
│   ├── routes/               # Express route definitions
│   ├── services/             # Email, AI, PDF services
│   ├── data/                 # JSON database files (auto-created)
│   ├── public/uploads/       # Uploaded medical reports
│   └── server.js             # Express + Socket.io entry
│
├── frontend/
│   ├── src/app/              # Next.js App Router pages
│   ├── src/components/       # Reusable React components
│   ├── src/context/          # Auth, Theme, Toast providers
│   ├── src/hooks/            # Custom React hooks
│   └── next.config.mjs       # Next.js configuration
│
├── docker-compose.yml        # Docker Compose orchestration
├── Dockerfile.backend        # Backend container
├── Dockerfile.frontend       # Frontend container (multi-stage)
└── .gitignore
```

## 🔒 Security

- JWT authentication with configurable secret
- Password hashing with bcryptjs
- CORS whitelist in production
- Rate limiting on contact form (5 per 15 min)
- Honeypot spam protection
- Security headers (XSS, clickjacking, MIME sniffing)
- Input validation on all endpoints
- No sensitive data in client responses

## 📄 License

MIT
