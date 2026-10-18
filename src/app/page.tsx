'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  Database,
  CheckCircle2,
  Users,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  ArrowRight,
  BookOpen,
  Lock,
  UserPlus,
  LogIn,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { registerUser, loginUser, currentUser } = useStore();

  const [authMode, setAuthMode] = useState<'view' | 'register_student' | 'register_teacher' | 'login'>('view');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [course, setCourse] = useState('B.Tech CSE');
  const [studentClass, setStudentClass] = useState('B.Tech CSE - 3rd Year');
  const [customClass, setCustomClass] = useState('');
  const [section, setSection] = useState('A');
  const [invitationCode, setInvitationCode] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'teacher'>('student');

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !rollNumber) return;

    let finalCourse = 'B.Tech CSE';
    let finalYear = 3;

    if (studentClass === 'Other' && customClass.trim()) {
      finalCourse = customClass.trim();
      finalYear = 1;
    } else if (studentClass.includes(' - ')) {
      const parts = studentClass.split(' - ');
      finalCourse = parts[0];
      const yearMatch = parts[1]?.match(/\d+/);
      if (yearMatch) finalYear = parseInt(yearMatch[0], 10);
    }

    registerUser({
      email,
      fullName,
      role: 'student',
      rollNumber,
      department,
      course: finalCourse,
      academicYear: finalYear,
      section,
      invitationCode: invitationCode.trim() || undefined,
    });
    router.push('/dashboard');
  };

  const handleRegisterTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    registerUser({
      email,
      fullName,
      role: 'teacher',
      department,
      course,
      section: 'Faculty',
    });
    router.push('/classrooms');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = loginUser(email, loginRole);
    if (res.success) {
      if (loginRole === 'teacher') {
        router.push('/classrooms');
      } else {
        router.push('/dashboard');
      }
    } else {
      setLoginError(res.message || 'Invalid login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-3 bg-white shadow-xl shadow-indigo-500/10 border-2 border-slate-200/90 flex items-center justify-center hover:scale-105 transition">
                <Image
                  src="/logo.png"
                  alt="TeachQL Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-100 border border-indigo-300 rounded-full text-indigo-900 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Classroom SQL Assessment Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Your SQL Classroom. <br />
              <span className="text-indigo-700">One Connected Learning Platform.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
              TeachQL empowers faculty members to manage multiple student cohorts, build custom SQL question banks, conduct timed tests with isolated query execution, and grade submissions effortlessly.
            </p>

            {/* Registration & Authentication Flow Buttons */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md max-w-xl mx-auto space-y-4">
              <div className="flex border-b border-slate-200 pb-3 gap-2 justify-center text-xs font-bold">
                <button
                  onClick={() => setAuthMode('register_student')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === 'register_student' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🎓 Register as Student
                </button>
                <button
                  onClick={() => setAuthMode('register_teacher')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === 'register_teacher' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  👨‍🏫 Register as Teacher
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    authMode === 'login' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🔑 Sign In
                </button>
              </div>

              {/* STUDENT REGISTRATION FORM */}
              {authMode === 'register_student' && (
                <form onSubmit={handleRegisterStudent} className="space-y-3 text-left text-xs font-bold text-slate-800">
                  <span className="block text-center text-indigo-700 font-extrabold text-sm">
                    Student Registration (Required to access classroom questions)
                  </span>
                  <div>
                    <label className="block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-800">University Roll Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 21CS145"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs font-mono"
                    />
                  </div>

                  {/* Class and Section Selection Boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-slate-800">Class / Program & Year *</label>
                      <select
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs bg-white text-slate-900 font-semibold"
                      >
                        <option value="B.Tech CSE - 3rd Year">B.Tech CSE - 3rd Year</option>
                        <option value="B.Tech CSE - 2nd Year">B.Tech CSE - 2nd Year</option>
                        <option value="B.Tech CSE - 4th Year">B.Tech CSE - 4th Year</option>
                        <option value="B.Tech CSE - 1st Year">B.Tech CSE - 1st Year</option>
                        <option value="BCA - 2nd Year">BCA - 2nd Year</option>
                        <option value="BCA - 3rd Year">BCA - 3rd Year</option>
                        <option value="MCA - 1st Year">MCA - 1st Year</option>
                        <option value="MCA - 2nd Year">MCA - 2nd Year</option>
                        <option value="M.Tech CSE - 1st Year">M.Tech CSE - 1st Year</option>
                        <option value="Other">Other / Custom Class...</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-800">Class Section *</label>
                      <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs bg-white text-slate-900 font-semibold"
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>
                    </div>
                  </div>

                  {studentClass === 'Other' && (
                    <div>
                      <label className="block mb-1 text-slate-800">Specify Class Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. B.Sc Data Science - 2nd Year"
                        value={customClass}
                        onChange={(e) => setCustomClass(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block mb-1 text-slate-800">
                      Classroom Code <span className="text-slate-500 font-normal">(Optional — e.g. TQL-CSE3-A7K9)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter classroom code to join immediately"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs font-mono uppercase bg-slate-50 placeholder:normal-case"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">College Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg shadow-sm text-xs transition"
                  >
                    Complete Student Registration & Access Questions &rarr;
                  </button>
                </form>
              )}

              {/* TEACHER REGISTRATION FORM */}
              {authMode === 'register_teacher' && (
                <form onSubmit={handleRegisterTeacher} className="space-y-3 text-left text-xs font-bold text-slate-800">
                  <span className="block text-center text-emerald-800 font-extrabold text-sm">
                    Faculty Registration (Create classrooms & manage assessments)
                  </span>
                  <div>
                    <label className="block mb-1">Faculty Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Priya Nair"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science & Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Official Faculty Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="faculty@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg shadow-sm text-xs transition"
                  >
                    Register as Teacher & Create Classroom &rarr;
                  </button>
                </form>
              )}

              {/* LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3 text-left text-xs font-bold text-slate-800">
                  <span className="block text-center text-slate-900 font-extrabold text-sm">
                    Sign In to TeachQL
                  </span>
                  <div>
                    <label className="block mb-1">Role</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="loginRole"
                          checked={loginRole === 'student'}
                          onChange={() => setLoginRole('student')}
                          className="text-indigo-600"
                        />
                        <span>Student</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="loginRole"
                          checked={loginRole === 'teacher'}
                          onChange={() => setLoginRole('teacher')}
                          className="text-indigo-600"
                        />
                        <span>Teacher / Faculty</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="user@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                    />
                  </div>
                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg shadow-sm text-xs transition"
                  >
                    Log In & Go to Dashboard &rarr;
                  </button>
                </form>
              )}

              {authMode === 'view' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setAuthMode('register_student')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    Register as Student
                  </button>
                  <button
                    onClick={() => setAuthMode('register_teacher')}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    Register as Teacher
                  </button>
                  <button
                    onClick={() => setAuthMode('login')}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars with High Contrast */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Multi-Classroom Isolation</h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Every room has independent rosters, tests, materials, and leaderboards. Students in Section A cannot access Section B materials or tests.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Isolated SQL Execution</h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Queries run in an ephemeral WebAssembly database sandbox with timeout protection, row caps, and automated result normalization evaluation.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-900 font-bold flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Automated & Manual Grading</h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Objective SQL queries are scored automatically. Theory questions queue in the teacher evaluation workspace for partial marking and constructive feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-white py-6 text-center text-xs font-bold text-slate-700">
        TeachQL • Production-Grade SQL Assessment Platform for Academic Institutions
      </footer>
    </div>
  );
}
