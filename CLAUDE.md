# CLAUDE.md — CommuniHealth (NGO Community Health Platform)
> Keep this file in the ROOT of your project. Every AI tool reads this automatically.

## Project Overview
Full-stack MERN health management platform for rural NGOs and ASHA workers in India.
Enables digitization of patient records, vaccination tracking, and consultation history.
Built as preparation for JPMorgan Code for Good hackathon — social impact + full-stack = perfect combo.

## Architecture
```
React Frontend (Vite + Tailwind)   ← deployed on Vercel
          ↓  JWT in Authorization header
Express.js REST API (Node.js 20)   ← deployed on Render
          ↓
     Mongoose ODM
          ↓
  MongoDB Atlas (free 512MB)
```

## Tech Stack
- **Frontend**: React 18 (Vite), React Router DOM v6, Axios, Recharts, Tailwind CSS
- **Backend**: Node.js 20, Express.js 4, Mongoose 8
- **Auth**: JWT (jsonwebtoken), bcryptjs
- **Database**: MongoDB Atlas (cloud, free tier)
- **Extras**: express-validator, cors, dotenv, json2csv (CSV export)
- **Deploy**: Render (backend, free), Vercel (frontend, free)

## Directory Structure
```
communihealth/
├── backend/
│   ├── server.js           ← Express app + DB connect + routes mount
│   ├── routes/
│   │   ├── auth.js         ← /api/auth/*
│   │   ├── patients.js     ← /api/patients/*
│   │   ├── consultations.js← /api/consultations/*
│   │   └── stats.js        ← /api/stats/dashboard
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   └── Consultation.js
│   ├── middleware/
│   │   └── auth.js         ← verifyToken + roleCheck
│   ├── seeds/
│   │   └── seedData.js     ← sample patients/consultations (run once)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Router setup
│   │   ├── api/
│   │   │   └── axios.js     ← base URL + JWT interceptor + 401 redirect
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← user state, login/logout functions
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── charts/
│   │   │       ├── VillageBarChart.jsx
│   │   │       ├── DiagnosisPieChart.jsx
│   │   │       └── RegistrationLineChart.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Patients.jsx
│   │       ├── PatientDetail.jsx
│   │       └── AddPatient.jsx
│   ├── .env
│   └── vite.config.js
└── README.md
```

## Key Commands
```bash
# Backend
cd backend
npm install
cp .env.example .env       # fill in MONGODB_URI and JWT_SECRET
node seeds/seedData.js     # seed sample data (run ONCE)
npm run dev                # nodemon server.js, port 5000

# Frontend
cd frontend
npm install
# set VITE_API_URL=http://localhost:5000 in .env
npm run dev                # Vite, port 5173
```

## Environment Variables
```
# backend/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/communihealth
JWT_SECRET=your-super-secret-key-256-bits
PORT=5000
NODE_ENV=development

# frontend/.env
VITE_API_URL=http://localhost:5000
```

## API Endpoints Reference
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | /api/auth/register | No | - | Register health worker |
| POST | /api/auth/login | No | - | Login, get JWT |
| GET | /api/auth/me | Yes | All | Get current user |
| POST | /api/patients | Yes | admin, worker | Create patient |
| GET | /api/patients | Yes | All | List + search + filter |
| GET | /api/patients/:id | Yes | All | Patient detail |
| PATCH | /api/patients/:id | Yes | admin, worker | Update patient |
| POST | /api/patients/:id/vaccines | Yes | admin, worker | Add vaccine |
| GET | /api/patients/export/csv | Yes | admin | Export all as CSV |
| POST | /api/consultations | Yes | admin, worker | Create consultation |
| GET | /api/consultations/patient/:id | Yes | All | Patient's consultations |
| GET | /api/consultations/recent | Yes | All | Last 20 consultations |
| GET | /api/stats/dashboard | Yes | All | All dashboard numbers |

## Data Models (key fields only)

### Patient
```js
patientId: "PT-1703123456789"   // auto-generated
name, age, gender, village, district, phone, bloodGroup
vaccines: [{ name, date, status: 'completed'|'pending'|'overdue' }]
medicalHistory: [String]
registeredBy: ObjectId → User
```

### Consultation
```js
patient: ObjectId → Patient     // required, populate on GET
healthWorker: ObjectId → User
consultationDate: Date
symptoms: [String]
diagnosis: String               // required
prescription: [{ medicine, dosage, duration }]
followUpDate: Date
```

## Coding Conventions
- Backend: CommonJS (require/module.exports) — not ES modules
- Frontend: ES modules (import/export)
- All mongoose queries use async/await with try/catch
- Routes must validate input using express-validator before processing
- JWT token expiry: 7 days ('7d')
- Password: bcrypt saltRounds = 10
- All list endpoints support pagination: ?page=1&limit=10
- Patient search: case-insensitive regex on name field
- NEVER send password field in responses (use .select('-password') on queries)

## Frontend Conventions
- All API calls go through src/api/axios.js — NEVER import axios directly
- Auth state lives in AuthContext — use useAuth() hook in components
- Protected pages use <ProtectedRoute> wrapper
- Charts live in src/components/charts/ — each chart is its own component
- Color scheme: primary teal #0d9488, background #f0fdf4
- Font: Plus Jakarta Sans (import in index.html)

## Role-Based Access
- admin: full access (create, read, update, export, view all)
- health_worker: create + read + update (no export, no admin views)
- viewer: read only (no create, no update, no export)
- roleCheck middleware usage: router.post('/', verifyToken, roleCheck(['admin','health_worker']), controller)

## Seeded Demo Accounts
```
Admin:   admin@communihealth.org / Admin@123
Worker:  worker@communihealth.org / Worker@123
Viewer:  viewer@communihealth.org / Viewer@123
```

## DO NOT
- Do not use var — use const/let only
- Do not put business logic in routes — use separate controller functions
- Do not return raw mongoose documents — use .lean() or .toJSON() or manually select fields
- Do not use synchronous bcrypt methods (bcrypt.hashSync) — use async bcrypt.hash()
- Do not commit .env files
- Do not forget CORS configuration in server.js for Vercel domain

## Current Status
- [ ] MongoDB Atlas cluster created
- [ ] Backend models + routes implemented
- [ ] JWT auth middleware working
- [ ] Seed data loaded
- [ ] React app with routing set up
- [ ] Dashboard with charts
- [ ] Patient CRUD pages
- [ ] Add consultation modal
- [ ] CSV export working
- [ ] Deployed: Render + Vercel
- [ ] README with social impact framing
