# Capstone Management Platform (Jetlabs)

A premium, high-fidelity academic management portal designed to orchestrate capstone project lifecycles. Built with Next.js, TypeScript, TailwindCSS, Prisma, and PostgreSQL.

---

## 🌟 Key Features & Core Modules

### 1. Unified Authentication & RBAC
* Secure sign-in system powered by **Next-Auth** supporting three distinct roles: `STUDENT`, `FACULTY`, and `ADMIN`.
* **Login Safeguard**: Administrative activation/deactivation interceptor that blocks deactivated users immediately.

### 2. Centralized Student Workspace
* **Dashboard Cockpit**: Displays current project progression, open reviews, performance scores, and viva readiness.
* **8-Week Roadmap**: Weekly sprint selector allowing students to track, update, and manage automated task deliverables.
* **Evidence Submission Hub**: Interactive form to link GitHub URLs, demo links, details, and version-controlled files.
* **Evaluation Scorecard**: Read-only access to faculty rubrics scoring (Completeness, Quality, Documentation, Timeliness) and revision suggestions.

### 3. Centralized Faculty Advisor Workspace
* **Overview Analytics**: Dynamic cards for active guided projects, pending reviews, average progress, and submission throughput.
* **Assigned Teams Console**: Searchable team roster with filters for Batch, Week, Progress, and Health States.
* **Detailed Project View**: Visual weekly roadmap tracking, submission history logs, and student performance rosters.
* **Review Queue Board**: Interactive queue for reviewing student weekly submissions, submitting grade scores (0-10 rubrics), and providing feedback.

### 4. Centralized Admin Control Panel
* **System Telemetry**: Live indicators tracking active users, database transaction latencies, API request counts, and file storage metrics.
* **User Directory Management**: Searchable directory to verify, activate, deactivate, or reset student enrollment states.
* **System-Wide Auditing**: Telemetry stream logging all system events and operations.

### 5. Centralized Notifications Module
* **Drawer Console**: Premium slide-out glassmorphic panel integrated globally in the app shell.
* **Unread/Read State mutations**: Real-time filtering and status mutation triggers.

### 6. File Upload & Storage Management System
* **Disk Persistence**: Secure files storage using UUID prefixes to prevent filename collisions on disk.
* **Role-Restricted Downloads**: Security layer blocking cross-team downloads.
* **Versioning History Chains**: Support for uploading file replacements, linking prior versions, and maintaining an append-only timeline.

### 7. Analytics & Reporting System
* **KPI Summaries**: Computes progress distributions, grade averages, and task completion metrics.
* **Dynamic Charts**: Interactive Recharts components (Area, Line, Bar) presenting platform telemetry.
* **Reports Generator**: Exporter generating downloadable CSV spreadsheets.
* **Print Layouts**: Clean print-preview canvas matching `window.print()` specifications for exporting physical PDF summaries.

### 8. Appendix-Only Audit System
* Registers structured log records containing actor role, categories (e.g. `TEAM_MANAGEMENT`, `EVALUATION`), action descriptions, and IP addresses.
* **Side-by-Side State Diffs**: Stores previous and new states as serialized JSON diffs.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS, Framer Motion, Recharts
* **Backend**: Next.js Server Actions, Route Handlers, TypeScript
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Authentication**: NextAuth.js
* **Validation**: Zod Schemas

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) and a running PostgreSQL instance (or Neon DB).

### 2. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Sync
Apply database schemas and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Running the Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to access the portal.

### 5. Running Type Checks
Ensure TypeScript hygiene is intact:
```bash
npm run typecheck
```
