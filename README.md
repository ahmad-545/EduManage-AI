# 🎓 EduManage AI — Modern Academy & School Management CMS

EduManage AI is a full-featured, multi-tenant-style role-based School and Academy Management CMS built for academies, tuition centers, and schools.

---

## ✨ Features & Role Portals

### 👑 1. Super Admin Portal
- **Direct Free-Text Class & Section Entry**: No restrictive dropdowns; simply type `"Class 10"`, `"Section A"`, and the system auto-resolves or creates the class cohort.
- **Student Admissions & Credentials**: Set custom student passwords, view credentials locally, and auto-dispatch via WhatsApp.
- **Teacher Assignment & Multi-Lecture Timetable**: Assign educators to classes/subjects with day-wise slots and room numbers.
- **Fee Management**: Track pending, partial, and paid tuition fees with quick clearance actions.
- **Academic Setup**: Manage class cohorts, subjects, and teacher verification requests.

### 👨‍🏫 2. Educator / Teacher Portal
- **Day-Wise Lecture Timetable**: Tabbed schedule (`Monday (3)`, `Tuesday (2)`, `Wednesday (3)`...) matching university CMS style (Minhaj University layout).
- **Class-Wise Lecture Organization**: Clean cards showing Class & Section, Subject, Timing, and Room.
- **One-Click Attendance & Marks**: Direct action buttons on every lecture card to mark attendance or record test/exam marks.
- **AI Performance Diagnostics**: Integrated OpenAI analytics to spot struggling students and provide academic recommendations.

### 🎒 3. Student & Parent Portal
- **Minhaj CMS Style Lecture Schedule Timetable**: Day tabs showing the number of lectures per day (`Monday`, `Tuesday`, etc.) with cyan pill cards (`Lecture 1`, `Lecture 2`...) detailing Subject, Time, Room, and Faculty email.
- **Profile & Course Overviews**: View enrolled subjects, teacher details, subject attendance progress %, and quiz averages.
- **Datesheet & Exam Schedule**: Comprehensive examination timetable with dates, morning/evening shifts, and venues.
- **Printable Roll Number Slip**: Official student examination slip with candidate details, subject datesheet, instructions, and signature fields.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org)
- **Styling:** Vanilla CSS + Tailwind CSS (Light / White & Sky Blue Theme)
- **Database:** MongoDB with [Mongoose](https://mongoosejs.com)
- **Authentication:** [NextAuth.js](https://next-auth.js.org) (Role-based Credentials Provider)
- **AI Diagnostics:** OpenAI API (`gpt-4o-mini`)
- **Icons:** [Lucide React](https://lucide.dev)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ahmad-545/EduManage-AI.git
cd EduManage-AI

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update your credentials in `.env.local`.

### 4. Seed Super Administrator
Create the initial Super Admin account:
```bash
npm run seed:admin
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT License. Built for modern educational institutions.
