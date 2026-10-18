# TeachQL — Setup & Deployment Guide

TeachQL is a production-ready, multi-class SQL learning and assessment platform built with Next.js 16+, TypeScript, Tailwind CSS, and an isolated SQL execution sandbox.

---

## 1. Quick Start (Development)

### Prerequisites
- Node.js 18+ (tested on v24 / v25)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> # Server-side only
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TeachQL
```

---

## 3. Database Schema & RLS Migrations

The complete, production-hardened PostgreSQL schema with Row-Level Security (RLS) is located at:
- [schema.sql](file:///c:/Users/patha/OneDrive/Desktop/TeachQL/supabase/schema.sql)
- [seed.sql](file:///c:/Users/patha/OneDrive/Desktop/TeachQL/supabase/seed.sql)

### Running Migrations in Supabase:
1. Open your Supabase Project Dashboard -> **SQL Editor**.
2. Run `supabase/schema.sql` to create all tables, indexes, and RLS policies.
3. Run `supabase/seed.sql` to populate initial SQL topics.

---

## 4. Key Workflows & Verification

### Built-in Interactive Role Switcher
In the top identity bar, you can test both perspectives instantly without re-logging in:
- **👨‍🏫 Faculty (Dr. Rajesh Sharma)**:
  - Create and manage classrooms (e.g. `B.Tech CSE Year 3 Section A`, `BCA Year 2 Section A`).
  - Generate unique room invitation keys (e.g. `TQL-CSE3-A7K9`).
  - Author and organize SQL questions with custom schemas, seed data, reference queries, and tags.
  - Review student submissions in the **Evaluation Workspace**, assign partial marks, write feedback, and publish official scores.
  - View cross-room performance analytics and identify curriculum weak points.
- **🎓 Student A (Aravind Kumar - 21CS101 - Section A)**:
  - Access assigned assessments for Section A.
  - Run SQL queries in the isolated WebAssembly sandbox.
  - Submit live tests with timer countdown and autosave.
  - View room-specific materials, announcements, and leaderboards.
- **🎓 Student B (Sneha Patel - 21CS102 - Section B)**:
  - Enrolled strictly in Section B (`TQL-CSE3-B4M2`).
  - Access control blocks Student B from viewing Section A assessments or student records (strict 403 authorization guard).

---

## 5. Automated Verification Test Suite

Run the automated test runner to verify sandbox isolation, query execution, result normalization, and order sensitivity:

```bash
npx tsx src/lib/testRunner.ts
```

All 10/10 automated tests pass with 100% success rate:
- ✅ Isolated SQL Execution Sandbox
- ✅ Security & Destruction Guard (DROP/ALTER/TRUNCATE blocked)
- ✅ Result Normalization & Automated Grading
- ✅ Order Sensitivity Handling (Order-sensitive vs Order-insensitive comparisons)
