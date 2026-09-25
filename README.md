# 🎓 UniSupport Pro — Student Support & Ticket Management System
> **Assignment 4 Submission — Product Engineering & Full-Stack Implementation**

UniSupport Pro is an enterprise-grade Student Support & Ticket Management platform engineered to streamline query resolution, automate Service Level Agreement (SLA) compliance, and provide executive visibility into institutional operational bottlenecks.

---

## 📌 Executive Summary & Product Thinking

In educational institutions, student queries regarding fees, documents, attendance, and IT support frequently suffer from **unclear ownership, zero SLA tracking, and missing escalation pathways**. 

UniSupport Pro shifts student support from a **passive ticket database** to an **active, SLA-enforced operational engine**:
1. **Dynamic SLA Calculation**: SLA windows set by priority (`URGENT`: 4h, `HIGH`: 12h, `MEDIUM`: 24h, `LOW`: 48h).
2. **Automated Multi-Tier Escalations**: Past-due tickets automatically escalate from Staff (Level 1) to Department Manager (Level 2).
3. **Role-Based Access Control (RBAC)**: Distinct workflows for **Students**, **Staff**, **Managers**, and **Admins**.
4. **Private Internal Notes**: Staff members collaborate via internal notes hidden from student view.
5. **Executive Visibility**: Visual management dashboards (Recharts) tracking SLA compliance, category bottlenecks, ticket ageing buckets, and staff workload distribution.

---

## 🏗️ Architecture & System Design

```
 ┌─────────────────────────────────────────────────────────┐
 │                   FRONTEND (Client)                     │
 │          React (Vite) + Tailwind CSS + Redux            │
 └────────────────────────────┬────────────────────────────┘
                              │
                    Axios / REST API + WebSockets
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │                   BACKEND (Server)                      │
 │                Node.js + Express.js                     │
 └──────────────┬───────────────────────────┬──────────────┘
                │                           │
 ┌──────────────▼───────────────┐  ┌────────▼──────────────┐
 │      SLA & Escalation        │  │      Socket.IO        │
 │  Service Worker (Periodic)   │  │ Real-Time Updates     │
 └──────────────┬───────────────┘  └───────────────────────┘
                │
 ┌──────────────▼──────────────────────────────────────────┐
 │                  MONGOOSE / MONGODB                     │
 │      3-Tier Fallback: Atlas ➔ Local Mongo ➔ In-Memory    │
 └─────────────────────────────────────────────────────────┘
```

### **Tech Stack**
- **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, React Router DOM, Recharts, Lucide Icons, Socket.IO Client, Axios.
- **Backend**: Node.js, Express.js, Mongoose, Socket.IO, JWT, bcryptjs, Multer.
- **Database Connection Strategy**: Built-in 3-tier fallback strategy (**Atlas Remote ➔ Local MongoDB ➔ In-Memory MongoDB Server**) guaranteeing **zero-configuration instant startup** for evaluators.

---

## ⚡ Key Engineering Decisions & Trade-offs

1. **Automated SLA Engine (`slaService.js`) — Background Worker vs. On-Demand Checks**
   - *Choice:* Combined a periodic 60-second background evaluation timer with runtime virtual getters (`isSlaBreached`).
   - *Trade-off:* Running a periodic background worker consumes minimal CPU cycles but guarantees that past-due tickets automatically transition to `isEscalated = true`, notify managers, and log audit entries even without active user API triggers.

2. **Real-Time Event Bus (Socket.IO) vs. HTTP Short Polling**
   - *Choice:* Used WebSockets for real-time ticket creation, status changes, escalations, and chat replies.
   - *Trade-off:* WebSockets require persistent connections, but eliminate heavy HTTP polling traffic and keep student and staff dashboards synchronized instantly.

3. **3-Tier Zero-Config Database Fallback Strategy**
   - *Choice:* Programmed backend database initialization (`db.js`) to attempt connection in order:  
     `1. MONGO_URI (Atlas Cloud) ➔ 2. Local MongoDB (127.0.0.1) ➔ 3. In-Memory MongoDB Server`.
   - *Rationale:* Eliminates database connection setup failures during testing.

4. **Immutable Audit Event Log (`TicketActivity`)**
   - *Choice:* Decoupled audit logs into a standalone collection rather than embedding state arrays inside the Ticket document.
   - *Rationale:* Provides an immutable, queryable history (`CREATED`, `ASSIGNED`, `REASSIGNED`, `INTERNAL_NOTE_ADDED`, `SLA_BREACHED`, `ESCALATED`, `RESOLVED`).

---

## 🛡️ Edge Cases & Failure Scenarios Handled

| Scenario / Edge Case | System Behavior & Mitigation |
| :--- | :--- |
| **Server Crash / Downtime during active SLA** | On server reboot, `slaService.js` scans all un-resolved tickets, evaluates elapsed timestamps against `slaDeadline`, and instantly catches up on any missed escalations. |
| **Unauthorized Access (RBAC Breach)** | Server-side JWT middleware verifies user roles. Students attempting to access `/api/tickets/stats`, trigger escalations, or view internal staff notes receive `403 Forbidden`. |
| **Unassigned Ticket Routing Failure** | If no staff exists for a specific department (e.g., Hostel), the ticket defaults to `status: Created` with `assignedTo: null` and surfaces on the Manager's master assignment queue. |
| **Malicious / Corrupted File Uploads** | Multer middleware validates file extension types (`.pdf`, `.png`, `.jpg`, `.docx`, `.txt`) and caps file sizes at 10MB. |

---

## 🤖 Mandatory AI Usage Report

```markdown
Mandatory AI Usage Report
======================================================================
AI TOOL USED: Gemini 3.6 Flash (Antigravity AI Agent)

WHAT I ASKED AI TO DO:
1. Architect and implement a full-stack Student Support & Ticket Management system using Node.js, Express, MongoDB, React, Tailwind CSS, and Redux Toolkit.
2. Build an automated SLA calculation and multi-tier escalation engine (Urgent 4h, High 12h, Medium 24h, Low 48h) with real-time breach detection.
3. Create role-based dashboards (Student, Staff, Manager, Admin), private internal staff notes, audit timeline logging, and executive analytics using Recharts.

PROMPT THAT WAS MOST USEFUL:
"Design an SLA + automatic escalation system for Assignment 4: Student Support & Ticket Management. SLA deadlines should be calculated based on priority (Urgent 4h, High 12h, Medium 24h, Low 48h). Open tickets exceeding SLA must automatically escalate to Management level with an audit log and real-time socket alert."

CODE GENERATED BY AI: What part?
- Backend: Express routes, JWT auth middleware, Mongoose schemas (User, Ticket, TicketMessage, TicketActivity, Notification), SLA worker (slaService.js), and database seeder.
- Frontend: Redux Toolkit slices (authSlice, ticketSlice), TicketDetailModal with status stepper & internal notes, ExecutiveAnalytics with Recharts graphs, and TicketCard with live SLA badges.

CODE I MODIFIED: What part?
- Updated Mongoose pre-save password hashing hook to handle modern async signatures.
- Adjusted User schema department validation to support student academic majors alongside staff administrative departments.
- Tuned frontend module bundler dependencies (`react-is` resolution for Recharts).
- Refined dashboard navigation layout to streamline user login.

AI OUTPUT THAT WAS WRONG:
1. In the initial Mongoose pre-save hook, a `next` callback parameter was passed alongside an `async function`, causing a runtime `next is not a function` error in modern Mongoose v9.
2. In the initial Vite frontend build, `recharts` failed bundle resolution due to a missing explicit `react-is` dependency.

HOW I IDENTIFIED THE PROBLEM:
- Inspected backend terminal logs showing `❌ Error seeding demo data: next is not a function`.
- Analyzed Vite build output showing `Rolldown failed to resolve import "react-is"`.

HOW I FIXED IT:
- Rewrote the Mongoose pre-save hook using async/await without the callback parameter.
- Ran `npm install react-is` in the frontend project directory to resolve the chart bundler dependency.
======================================================================
```

---

## 🔑 Pre-Seeded Demo Accounts (Password for all: `password123`)

| Role | Name | Email | Focus Area |
| :--- | :--- | :--- | :--- |
| **Student** | Rahul Verma | `student@college.edu` | Fees & IT Support Tickets |
| **Student** | Ananya Sharma | `student2@college.edu` | Documents & Attendance |
| **Staff** | Vikram Singh | `staff.fees@college.edu` | Fees & Finance Dept |
| **Staff** | Priya Patel | `staff.it@college.edu` | IT & Portal Support Dept |
| **Manager** | Prof. Rajesh Kumar | `manager@college.edu` | Executive Dashboard & Escalations |
| **Admin** | System Admin | `admin@college.edu` | Full System Administration |

*(Use the **quick login buttons** on the login screen to switch roles seamlessly during testing!)*

---

## ⚡ Quick Start Guide

### 1. Start Backend Server
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000` with WebSockets on `ws://localhost:5000`.*

### 2. Start Frontend Application
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3001` (or `http://localhost:3000`).*
