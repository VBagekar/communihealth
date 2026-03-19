# CommuniHealth 🏥

### Digital health management for rural communities and NGOs

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat&logo=express)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens)](https://jwt.io)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## The Problem

Over 600 million people in rural India rely on ASHA workers (Accredited Social Health Activists) and ANMs for primary healthcare. Yet most of these frontline workers still manage patient records with pen and paper — leading to missed vaccinations, lost consultation history, and zero visibility into village-level health trends. CommuniHealth replaces those paper registers with a fast, offline-friendly digital platform built specifically for the realities of rural healthcare.

---

## Live Demo

| | Link |
|---|---|
| 🌐 Frontend | https://communihealth.vercel.app |
| ⚙️ Backend API | https://communihealth.onrender.com |

**Demo credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@communihealth.org | Admin@123 |
| Health Worker | worker@communihealth.org | Worker@123 |
| Viewer | viewer@communihealth.org | Viewer@123 |

---

## Features

- **Role-based access control** — Admin, Health Worker, and Viewer roles with JWT authentication
- **Patient registry** — Register patients with full demographics, medical history, and blood group
- **Consultation tracking** — Record symptoms, diagnoses, prescriptions, and follow-up dates
- **Vaccination schedules** — Track vaccine status with color-coded overdue/pending/completed indicators
- **Analytics dashboard** — Village health statistics, top diagnoses, vaccination coverage %, patient trends
- **Search and filter** — Find patients by name, village, gender, or blood group instantly
- **CSV export** — Export full patient data for offline reporting (admin only)
- **Seed data** — 10 sample patients from Wardha, Nagpur, Yavatmal, Amravati, Chandrapur

---

## Screenshots

**Dashboard** — Real-time stats cards, Recharts bar/pie/line charts, recent consultations table

**Patient List** — Card grid with vaccination status badges, search bar, village filter

**Add Patient** — Multi-step form: Basic Info → Medical History → Vaccine Records

---

## Architecture

```
┌─────────────────────────────────┐
│   React 18 + Vite (Vercel)      │
│   Tailwind CSS + Recharts       │
│   Axios + React Router DOM v6   │
└────────────┬────────────────────┘
             │ JWT in Authorization header
             ▼
┌─────────────────────────────────┐
│   Express.js REST API (Render)  │
│   Node.js 20 + Mongoose ODM     │
│   express-validator + bcryptjs  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   MongoDB Atlas (Mumbai region) │
│   Free tier · 512MB             │
└─────────────────────────────────┘
```

---

## API Reference

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /api/auth/register | No | — | Register health worker |
| POST | /api/auth/login | No | — | Login, receive JWT |
| GET | /api/auth/me | Yes | All | Get current user |
| POST | /api/patients | Yes | admin, worker | Create patient |
| GET | /api/patients | Yes | All | List with search + filter + pagination |
| GET | /api/patients/:id | Yes | All | Patient detail with consultation history |
| PATCH | /api/patients/:id | Yes | admin, worker | Update patient info |
| POST | /api/patients/:id/vaccines | Yes | admin, worker | Add vaccination record |
| GET | /api/patients/export/csv | Yes | admin | Export all patients as CSV |
| POST | /api/consultations | Yes | admin, worker | Create consultation |
| GET | /api/consultations/patient/:id | Yes | All | All consultations for a patient |
| GET | /api/consultations/recent | Yes | All | Last 20 consultations |
| PATCH | /api/consultations/:id | Yes | admin, worker | Update consultation |
| GET | /api/stats/dashboard | Yes | All | Dashboard stats aggregation |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) or local MongoDB

### Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in MONGODB_URI and JWT_SECRET in .env
node seeds/seedData.js   # seed sample data (run once)
npm run dev              # starts on port 5000
```

### Frontend

```bash
cd frontend
npm install
# create frontend/.env with:
# VITE_API_URL=http://localhost:5000
npm run dev              # starts on port 5173
```

### Environment Variables

```bash
# backend/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/communihealth
JWT_SECRET=your-256-bit-secret
PORT=5000
NODE_ENV=development

# frontend/.env
VITE_API_URL=http://localhost:5000
```

---

## Deployment

| Service | Purpose | Config |
|---------|---------|--------|
| MongoDB Atlas | Database | Free M0, Mumbai region |
| Render | Backend API | Root dir: `backend`, start: `node server.js` |
| Vercel | Frontend | Root dir: `frontend`, framework: Vite |

---

## Data Models

### Patient
```
patientId     "PT-1703123456789" (auto-generated)
name, age, gender, village, district, phone, bloodGroup
vaccines      [{ name, date, status: completed|pending|overdue }]
medicalHistory [String]
registeredBy  → User
```

### Consultation
```
patient       → Patient
healthWorker  → User
consultationDate, symptoms[], diagnosis
prescription  [{ medicine, dosage, duration }]
followUpDate, notes
```

---

## Future Improvements

- **AI symptom analysis** — flag high-risk patients using ML on consultation history
- **WhatsApp notifications** — vaccine reminders via Twilio WhatsApp API for ASHA workers
- **Offline mode** — PWA with IndexedDB sync for areas with poor connectivity
- **Multi-language support** — Hindi, Marathi, Telugu for local health workers
- **Photo records** — attach prescription images and X-rays to consultations

---

## Built For

This project was built as preparation for the **JPMorgan Code for Good hackathon** — an event where technologists build solutions for NGOs in 24 hours. CommuniHealth represents exactly that intersection: modern full-stack engineering applied to a real social problem affecting millions of people across rural India.

---

## License

MIT © 2024 Vaishnavi Bagekar