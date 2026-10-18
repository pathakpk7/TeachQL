'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  Users,
  BookOpen,
  FileCheck2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    classrooms,
    assessments,
    attempts,
    getEnrolledClassrooms,
    getTeacherClassrooms,
    setCurrentRoom,
  } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-slate-300 rounded-2xl text-center space-y-4 shadow-sm">
        <Users className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-700 font-medium">
          Please register as a Student or Teacher on the home page to access the TeachQL platform.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          Go to Sign In / Register &rarr;
        </Link>
      </div>
    );
  }

  const isTeacher = currentUser.role === 'teacher';

  if (isTeacher) {
    const teacherRooms = getTeacherClassrooms(currentUser.id);
    const totalStudents = teacherRooms.reduce((sum, r) => sum + (r.student_count || 0), 0);
    const totalTests = assessments.length;
    const pendingEvaluations = attempts.filter((a) => a.status === 'submitted').length;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Faculty Dashboard
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Welcome back, {currentUser.full_name}. Here is an overview of your active classrooms, tests, and student progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/classrooms"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create Classroom
            </Link>
            <Link
              href="/question-bank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" /> Question Bank
            </Link>
          </div>
        </div>

        {/* 4 Key Metric Cards with Strong Contrast */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm hover:border-indigo-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Classrooms</span>
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{teacherRooms.length}</span>
              <span className="text-xs font-semibold text-slate-600 ml-2">Across 2 departments</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm hover:border-emerald-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enrolled Students</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{totalStudents}</span>
              <span className="text-xs font-bold text-emerald-800 ml-2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+4 this week</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm hover:border-sky-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assessments</span>
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{totalTests}</span>
              <span className="text-xs font-semibold text-slate-600 ml-2">2 currently active</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm hover:border-amber-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pending Evaluation</span>
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-700">{pendingEvaluations}</span>
              <Link href="/evaluations" className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline">
                Open queue &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Managed Classrooms Overview */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Classrooms</h2>
              <p className="text-xs text-slate-500">Select a classroom to access assessments, student submissions, or materials.</p>
            </div>
            <Link href="/classrooms" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {teacherRooms.map((room) => (
              <div key={room.id} className="p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-base">{room.name}</h3>
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {room.course} • Yr {room.academic_year}
                    </span>
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      Code: {room.invitation_code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{room.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>👥 {room.student_count} Enrolled</span>
                    <span>📝 {assessments.filter((a) => a.classroom_id === room.id).length} Tests</span>
                    <span>🏢 Section {room.section}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <Link
                    href={`/classrooms/${room.id}`}
                    onClick={() => setCurrentRoom(room)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition"
                  >
                    Open Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Evaluation Highlight Queue */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Submissions Awaiting Evaluation</h2>
            </div>
            <Link href="/evaluations" className="text-xs font-semibold text-indigo-600 hover:underline">
              Go to Full Evaluation Workspace &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {attempts.filter((a) => a.status === 'submitted').map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{attempt.student?.full_name}</span>
                    <span className="text-xs text-slate-500 font-mono">({attempt.student?.roll_number})</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Needs Evaluation</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Submitted answers for <span className="font-medium text-slate-800">Mid-Term SQL Assessment</span>. Contains subjective database theory questions.
                  </p>
                </div>

                <Link
                  href="/evaluations"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
                >
                  Grade Submission
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STUDENT VIEW
  const enrolledRooms = getEnrolledClassrooms(currentUser.id);
  const enrolledRoomIds = enrolledRooms.map((r) => r.id);
  const availableTests = assessments.filter((a) => enrolledRoomIds.includes(a.classroom_id));
  const myAttempts = attempts.filter((a) => a.student_id === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Welcome, <span className="font-semibold text-slate-800">{currentUser.full_name}</span> ({currentUser.roll_number}) • <span className="text-indigo-700 font-bold">{currentUser.course} (Sec {currentUser.section})</span>.
            Track your tests, practice SQL queries, and monitor class performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" /> Practice SQL
          </Link>
          <Link
            href="/classrooms"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Users className="w-4 h-4 text-indigo-600" /> Join Classroom
          </Link>
        </div>
      </div>

      {/* Student Summary Cards with High-Contrast Color Grading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Questions Solved</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">18</span>
            <span className="text-xs font-bold text-emerald-700">85% Correct</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tests Attempted</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-700">{myAttempts.length}</span>
            <span className="text-xs font-semibold text-slate-600">Submissions graded</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Average Test Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">
              {myAttempts.length > 0
                ? `${Math.round(
                    myAttempts.reduce((sum, a) => sum + (a.total_score || 0), 0) / myAttempts.length
                  )} / 25`
                : '20 / 25'}
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Grade A
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Practice Streak</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-700">🔥 3 Days</span>
            <span className="text-xs font-semibold text-slate-600">12 queries run</span>
          </div>
        </div>
      </div>

      {/* Enrolled Classrooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Enrolled Classrooms</h2>
          <Link href="/classrooms" className="text-xs font-semibold text-indigo-600 hover:underline">
            Manage or Join another room &rarr;
          </Link>
        </div>

        {enrolledRooms.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">You are not enrolled in any classroom yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Ask your teacher for your section's invitation code (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">TQL-CSE3-A7K9</code>) and enter it to access tests.
            </p>
            <Link
              href="/classrooms"
              className="inline-flex px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Enter Room Code
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrolledRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Sec {room.section} • Yr {room.academic_year}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Code: {room.invitation_code}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-2">{room.name}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{room.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    📝 {assessments.filter((a) => a.classroom_id === room.id).length} assessments available
                  </span>
                  <Link
                    href={`/classrooms/${room.id}`}
                    onClick={() => setCurrentRoom(room)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Enter Classroom &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming / Available Tests */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Classroom Assessments</h2>
          <span className="text-xs text-slate-500">Only showing tests for your enrolled classrooms</span>
        </div>

        <div className="divide-y divide-slate-100">
          {availableTests.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No assessments assigned to your enrolled classrooms yet.
            </div>
          ) : (
            availableTests.map((test) => {
              const attempt = myAttempts.find((a) => a.assessment_id === test.id);
              return (
                <div key={test.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{test.title}</h3>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize">
                        {test.assessment_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{test.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span>⏱️ {test.duration_minutes} Mins</span>
                      <span>🎯 {test.total_marks} Marks</span>
                      <span>📅 Due {new Date(test.end_time).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    {attempt ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" /> Submitted ({attempt.total_score} pts)
                      </span>
                    ) : (
                      <Link
                        href={`/test/${test.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        Start Assessment &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
