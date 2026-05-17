# 🎯 AtomAlign — Goal Setting & Tracking Portal

**Atomberg's internal HRMS portal for Goal Setting, Tracking, Approval, and Reporting**

---

## 📋 Problem Statement

Atomberg needed a digital platform to replace manual goal-setting processes. AtomAlign enables:
- Employees to create, submit, and track quarterly goals
- Managers to review, approve/reject, and add check-in feedback
- Admin/HR to monitor progress, manage users, and generate reports

---

## ✨ Features

### 🔐 Authentication
- JWT-based login with role-based access control
- Three roles: Employee, Manager, Admin
- Persistent sessions via localStorage

### 👤 Employee
- Dashboard with goal stats and quarterly progress chart
- Create goals with multi-goal form (max 8, total 100% weightage)
- Submit goal sheet for manager approval
- Quarterly check-in updates (Q1–Q4)
- View notifications

### 👔 Manager
- Team performance overview with bar chart
- Approve / reject goals with comments
- Inline edit goal target & weightage
- Add structured check-in comments per quarter
- View planned vs actual achievement

### 🛠️ Admin / HR
- Full user management (CRUD)
- Admin dashboard with pie chart + department stats
- Unlock locked goals
- Export achievement reports to CSV
- Complete audit trail with filtering and pagination

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (running locally on port 27017)

### 1. Clone / Navigate to project
```bash
cd AtomVision
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
The `.env` file is pre-configured. Edit if needed:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/atomalign
JWT_SECRET=atomalign_super_secret_jwt_key_2024
JWT_EXPIRE=7d
```

### 4. Seed the Database
```bash
cd backend
npm run seed
```

### 5. Start Backend
```bash
npm run dev
```
Backend runs on: http://localhost:5000

### 6. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 7. Start Frontend
```bash
npm run dev
```
Frontend runs on: http://localhost:3000

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@atomalign.com | password123 |
| Manager | manager@atomalign.com | password123 |
| Admin | admin@atomalign.com | password123 |

---

## 📁 Project Structure

```
AtomAlign/
├── backend/
│   ├── config/db.js
│   ├── controllers/          # Business logic
│   ├── middleware/            # Auth + roleCheck
│   ├── models/               # MongoDB schemas
│   ├── routes/               # Express routers
│   ├── seed/seed.js          # Demo data seeder
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/       # Sidebar, Header, Layout
        │   └── ui/           # StatCard, ProgressBar, Modal, StatusBadge
        ├── context/          # AuthContext
        ├── pages/
        │   ├── Login.jsx
        │   ├── employee/     # Dashboard, Goals, CreateGoal, CheckIns
        │   ├── manager/      # Dashboard, Approvals, CheckIns
        │   └── admin/        # Dashboard, Users, Reports, AuditLogs
        ├── routes/           # ProtectedRoute
        └── services/api.js   # Axios API layer
```

---

## 🌐 Frontend Routes

| Path | Role | Description |
|------|------|-------------|
| /login | All | Login page |
| /employee/dashboard | Employee | Goal stats + charts |
| /employee/create-goal | Employee | Create goal form |
| /employee/goals | Employee | My goals list |
| /employee/checkins | Employee | Quarterly updates |
| /manager/dashboard | Manager | Team overview |
| /manager/approvals | Manager | Review & approve goals |
| /manager/checkins | Manager | Team check-ins |
| /admin/dashboard | Admin | System overview |
| /admin/users | Admin | User management |
| /admin/reports | Admin | Achievement reports |
| /admin/audit-logs | Admin | Audit trail |

---

## 🔌 Key API Endpoints

```
POST   /api/auth/login              Login
POST   /api/auth/register           Register
GET    /api/auth/me                 My profile

GET    /api/goals                   My goals (employee)
POST   /api/goals                   Create goal
POST   /api/goals/submit            Submit goal sheet
PUT    /api/goals/:id/quarterly     Update Q achievement

GET    /api/manager/goals           Team goals
PUT    /api/manager/goals/:id/approve
PUT    /api/manager/goals/:id/reject
POST   /api/manager/goals/:id/comment

GET    /api/admin/dashboard
GET    /api/admin/audit-logs
PUT    /api/admin/goals/:id/unlock

GET    /api/reports                 Achievement report (CSV export)
GET    /api/users                   All users (Admin)
```

---

## 🚢 Deployment Notes

### Environment Variables (Production)
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/atomalign
JWT_SECRET=<strong-secret-key>
NODE_ENV=production
```

### Build Frontend
```bash
cd frontend
npm run build
```

Serve the `dist/` folder with nginx or a Node static server.

---

## 👥 Demo Journey

1. **Employee** logs in → Creates 4 goals (total 100% weightage) → Submits
2. **Manager** logs in → Reviews submitted goals → Approves (goals get locked)
3. **Employee** goes to Check-ins → Updates Q1 achievement
4. **Manager** adds Q1 check-in comment
5. **Admin** views Reports → Exports CSV → Checks Audit Logs

---

*Built for Atomberg Hackathon 2024-25 • AtomAlign v1.0*
