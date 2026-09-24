# 🎓 UniSupport Pro — Student Support & Ticket Management System
> **Assignment 4 Submission — Product Engineering & Full-Stack Implementation**

UniSupport Pro is an enterprise-grade Student Support & Ticket Management platform engineered to streamline query resolution, automate Service Level Agreement (SLA) compliance, and provide executive visibility into institutional operational bottlenecks.

---

## 🌟 Key Features & Standout Implementations

### 1. ⏱️ Automated SLA & Escalation Engine (Standout Feature)
- **Dynamic SLA Calculation**:
  - `URGENT`: 4 Hours
  - `HIGH`: 12 Hours
  - `MEDIUM`: 24 Hours
  - `LOW`: 48 Hours
- **Real-Time SLA Badging & Live Countdown**:
  - 🟢 **On Track**: SLA active with remaining time breakdown.
  - 🟡 **Warning**: Critical countdown (< 2 hours remaining).
  - 🔴 **SLA BREACHED**: Automatic breach detection when deadline is exceeded.
- **Automated Multi-Tier Escalation Workflow**:
  - **Level 1 (Staff)** ➔ **Level 2 (Team Lead)** ➔ **Level 3 (Department Manager)**.
  - Automatic background SLA breach engine checks open tickets every 60s and auto-escalates past-deadline tickets to Management.
  - Manual 1-Click Escalation with audit trail logging and manager notifications.

### 2. 🔐 Role-Based Access Control (RBAC) & Scoped Views
- **Student**: Create ticket, select category & priority, attach files, track status timeline, reply to staff.
- **Staff**: View assigned queue, update ticket status, write **Private Internal Notes** (hidden from students), resolve tickets.
- **Manager / Admin**: Master ticket oversight, assign/reassign tickets, SLA monitoring, 1-click escalations, and executive analytics.

### 3. 📊 Executive Analytics & Reporting Dashboard
- Powered by **Recharts**:
  - **KPI Metrics**: Total Tickets, SLA Compliance %, Open vs Resolved, Escalated Count.
  - **Category Breakdown Chart**: Visualizes ticket counts vs SLA breaches per category (Fees, Docs, IT, Attendance, etc.).
  - **Ageing Bucket Analysis Chart**: Ticket distribution across time buckets (<12h, 12-24h, 24-48h, >48h).
  - **Staff Workload & Performance Table**: Live tracking of staff active tickets, resolution counts, and SLA breach rates.

### 4. 🚀 Zero-Config Database Fallback Strategy
- **Guaranteed Instant Setup**:
  1. Attempts primary MongoDB Atlas connection.
  2. Falls back to local MongoDB (`mongodb://127.0.0.1:27017/student_support`).
  3. Automatically launches `mongodb-memory-server` if no external database is available!
- **Auto-Seeded Demo Data**: Pre-loaded with demo accounts, sample tickets across all categories, SLA warning states, breached tickets, internal notes, and activity audit logs.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, React Router DOM, Recharts, Lucide Icons, Socket.IO Client, Axios.
- **Backend**: Node.js, Express.js, Mongoose, Socket.IO, JWT, bcryptjs, Multer, MongoDB Memory Server.

---

## ⚡ Quick Start Guide

### 1. Start Backend Server
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000` with WebSockets enabled on `ws://localhost:5000`.*

### 2. Start Frontend Application
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3001` (or `http://localhost:3000`).*

---

## 🔑 Pre-Seeded Live Demo Accounts (Password for all: `password123`)

| Role | Name | Email | Focus Area |
| :--- | :--- | :--- | :--- |
| **Student** | Rahul Verma | `student@college.edu` | Fees & IT Support Tickets |
| **Student** | Ananya Sharma | `student2@college.edu` | Documents & Attendance |
| **Staff** | Vikram Singh | `staff.fees@college.edu` | Fees & Finance Dept |
| **Staff** | Priya Patel | `staff.it@college.edu` | IT & Portal Support Dept |
| **Manager** | Prof. Rajesh Kumar | `manager@college.edu` | Executive Dashboard & Escalations |
| **Admin** | System Admin | `admin@college.edu` | Full System Administration |

*(Use the **sticky bottom bar** in the app to switch roles in 1 click during live demos!)*
