# StudentOS — AI-Powered Student Productivity & Placement Platform

StudentOS is a full-stack web application designed for students to manage academic assignments, track class attendance thresholds, monitor job/placement applications, and leverage AI for exam study planning and resume analysis.

---

## 🌟 Key Features

1. **JWT Authentication & Security**
   - User registration and login with bcrypt password hashing.
   - Protected API routes and persistent user sessions.

2. **Student Dashboard Analytics**
   - Overall attendance average percentage & low attendance alerts.
   - Pending task deadlines and job application funnel statistics.

3. **Assignments & Task Manager**
   - Full CRUD operations with priority tags (High, Medium, Low).
   - Filtering by status, priority, subject, and real-time search.

4. **Attendance Tracker**
   - Track attended vs total classes per subject.
   - Instant calculation of attendance percentage.
   - Warning indicators when attendance drops below 75%.

5. **Placement & Job Tracker**
   - Application status funnel: Applied, Assessment, Interview, Offer, Rejected.
   - Notes & next action item tracking.

6. **AI Study Planner**
   - Generates structured exam study roadmaps based on target date, subjects, chapters, and available daily hours.

7. **AI Resume & JD Analyzer**
   - Match score percentage gauge, skill gap extraction, and resume optimization suggestions.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, CSS (Glassmorphic dark design system), Lucide Icons
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Database**: SQLite3
- **AI Integration**: Server-side Google Gemini API integration with intelligent heuristic fallback engine

---

## 🚀 Running the Project Locally

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
The Express server will run on `http://localhost:5000`.

### 2. Start Frontend React Client
```bash
cd client
npm install
npm run dev
```
The React frontend will run on `http://localhost:3000`.

---

## 📑 Resume Bullet Points

- Built a full-stack student productivity and placement platform using React, Node.js, Express, and SQLite.
- Implemented JWT-based authentication, protected REST APIs, and user-specific data isolation.
- Developed assignment, attendance, and job-application workflows with dashboard analytics.
- Integrated AI-powered study-plan generation and resume-to-job-description skill gap analysis.
