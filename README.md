# Full-Stack Student Management System

**Course:** Full-Stack Web Development | 23CM4121  
**Institution:** Anil Neerukonda Institute of Technology and Sciences (ANITS Autonomous)  
**Student:** M. Surya Prabhath | Reg. No.: A24126552094  
**Department:** CSE (AI&ML)

---

## 🎯 Case Study Overview

A college requires a full-stack web application to manage student records stored in a MongoDB database. The application must support all four fundamental CRUD operations on the `students` collection, along with aggregation queries for analytics, a React frontend for user interaction, and a RESTful Express.js backend.

---

## 🏗️ Architecture

```
college-student-management/
├── backend/                        # Node.js + Express.js REST API
│   ├── server.js                   # Entry point: Express app + MongoDB connection
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   └── src/
│       ├── middleware/
│       │   └── auth.js             # JWT Authentication & Role-based Authorization
│       ├── models/
│       │   ├── User.js             # Mongoose User schema (admin/student)
│       │   └── Student.js          # Mongoose Student schema with indexes
│       ├── routes/
│       │   ├── auth.js             # POST /api/auth/register, /login
│       │   └── students.js         # Full CRUD + Aggregation endpoints
│       └── scripts/
│           └── seed.js             # Database seeding script
├── frontend/                       # React 18 + Vite
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                # App entry point
│       ├── App.jsx                 # Admin dashboard (Students + Analytics tabs)
│       ├── Auth.jsx                # Login & Registration component
│       ├── api.js                  # Axios instance with auto Bearer token injection
│       └── style.css               # Responsive CSS
└── MongoDB_Student_CRUD_Queries.js # Q4 Case Study: mongosh CRUD script
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios |
| Backend | Node.js 18+, Express.js 4 |
| Database | MongoDB 7, Mongoose 8 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Responsive Vanilla CSS |

---

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB Community Server or MongoDB Atlas

### 1. Start MongoDB
```bash
# Local MongoDB
mongod --dbpath /data/db

# Or configure MongoDB Atlas URI in backend/.env
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env     # Edit MONGODB_URI, JWT_SECRET, ADMIN_SETUP_KEY
npm run seed             # Seed sample students + demo accounts
npm run dev              # API at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # UI at http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Student | surya.prabhath@anits.edu.in | student123 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public (student) |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register-admin` | Setup key required |

### Students (CRUD — Q4)
| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/students` | Admin | (a) Insert student record |
| GET | `/api/students` | Authenticated | (b) Retrieve all students |
| PUT | `/api/students/:regNo` | Admin | (c) Update student record |
| PATCH | `/api/students/:regNo/department` | Admin | (c) Update department only |
| DELETE | `/api/students/:regNo` | Admin | (d) Delete student record |
| GET | `/api/students/analytics/stats` | Admin | Aggregation: dept counts, GPA, tuition |

---

## 🗄️ MongoDB Operations (Q4)

Run `MongoDB_Student_CRUD_Queries.js` in `mongosh`:
```bash
mongosh < MongoDB_Student_CRUD_Queries.js
```

Operations covered:
- **(a)** `insertOne()` — Insert a student record  
- **(b)** `find({})` — Retrieve all student records  
- **(c)** `updateOne()` with `$set` — Update department  
- **(d)** `deleteOne()` — Delete a student record  
- **Bonus:** `aggregate()` pipeline — Department-wise stats, avg GPA, total tuition  

---

## 📊 Evaluation Rubric Mapping

| # | Component | Implementation |
|---|-----------|---------------|
| 1 | Problem understanding & system design | Architecture documented above; frontend-backend-database workflow |
| 2 | MongoDB database design | `students` schema with 8 fields, `collegeDB` database, createdAt, indexes |
| 3 | CRUD operations | POST / GET / PUT / DELETE endpoints in `src/routes/students.js` |
| 4 | Aggregation & indexing | `$group`, `$project`, `$sort` pipeline; unique + compound indexes |
| 5 | React frontend development | Form, table listing, search/filter, analytics dashboard |
| 6 | Express.js backend development | RESTful routes, JWT auth, error handling, Mongoose |
| 7 | Cloud deployment | Deploy backend on Render, frontend on Vercel, DB on MongoDB Atlas |
| 8 | Testing, documentation & demonstration | This README, seed script, test cases in CRUD queries file |

---

## 🌐 Cloud Deployment Guide

### MongoDB Atlas
1. Create a free M0 cluster at https://cloud.mongodb.com
2. Set Database Access user with password
3. Whitelist `0.0.0.0/0` in Network Access
4. Copy the connection string to `MONGODB_URI` in your environment

### Backend on Render
1. Push code to GitHub
2. New Web Service → connect repo → `backend/` as root
3. Build: `npm install` | Start: `node server.js`
4. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_SETUP_KEY`

### Frontend on Vercel
1. Import repo in Vercel → set Root Directory to `frontend`
2. Build: `npm run build` | Output: `dist`
3. Add `VITE_API_URL` env var pointing to your Render backend URL
4. Update `frontend/src/api.js` baseURL with the deployed backend URL

---

## 📝 Fine Calculation Note

Late fee / tuition penalty if applicable: configurable via environment variables and extendable in the Student schema.

---

*ANITS Autonomous | Department of Computer Science and Engineering (AI&ML)*
