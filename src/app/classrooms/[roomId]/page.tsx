'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  Users,
  FileCheck2,
  BookOpen,
  Bell,
  Trophy,
  Plus,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Send,
  UserCheck,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Lock,
  Upload,
} from 'lucide-react';

export default function ClassroomHubPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const {
    currentUser,
    classrooms,
    assessments,
    materials,
    announcements,
    attempts,
    getEnrolledClassrooms,
    getRoomStudents,
    addMaterial,
    addAnnouncement,
    addAssessment,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'roster' | 'tests' | 'materials' | 'announcements' | 'leaderboard'>('roster');

  // Modal states for direct teacher actions
  const [showTestModal, setShowTestModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // New Test Form State
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestDuration, setNewTestDuration] = useState(45);
  const [newTestMarks, setNewTestMarks] = useState(25);

  // New Material Form State
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatDesc, setNewMatDesc] = useState('');
  const [newMatType, setNewMatType] = useState<'pdf' | 'document' | 'sql' | 'link' | 'note'>('pdf');
  const [newMatUrl, setNewMatUrl] = useState('');
  const [newMatContent, setNewMatContent] = useState('');

  // New Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnPinned, setNewAnnPinned] = useState(false);

  // Verify access authorization
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-slate-300 rounded-2xl text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-700 font-medium">
          Please sign in or register to access this classroom hub.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          Sign In / Register &rarr;
        </Link>
      </div>
    );
  }

  const isTeacher = currentUser.role === 'teacher';
  const targetRoom = classrooms.find((c) => c.id === roomId);

  if (!targetRoom) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900">Classroom Not Found</h2>
        <p className="text-sm text-slate-700">The classroom identifier requested does not exist or has been removed.</p>
        <Link href="/classrooms" className="inline-block px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm">
          Return to Classrooms
        </Link>
      </div>
    );
  }

  // Authorization Check: Student must belong to this room
  if (!isTeacher) {
    const enrolled = getEnrolledClassrooms(currentUser.id).some((r) => r.id === roomId);
    if (!enrolled) {
      return (
        <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-rose-700 mx-auto" />
          <h2 className="text-lg font-extrabold text-rose-950">Access Denied (403 Forbidden)</h2>
          <p className="text-xs text-rose-900 font-medium">
            You are not enrolled in <strong>{targetRoom.name}</strong>. Students cannot view assessments, materials, or student details of unauthorized rooms.
          </p>
          <Link
            href="/classrooms"
            className="inline-block px-4 py-2 bg-rose-700 text-white text-xs font-bold rounded-lg hover:bg-rose-800 transition"
          >
            Back to Authorized Rooms
          </Link>
        </div>
      );
    }
  }

  const roomTests = assessments.filter((a) => a.classroom_id === roomId);
  const roomMaterials = materials.filter((m) => m.classroom_id === roomId);
  const roomAnnouncements = announcements.filter((a) => a.classroom_id === roomId);
  const roomStudents = getRoomStudents(roomId);

  // Selected test for score roster inspection
  const [selectedTestId, setSelectedTestId] = useState<string>(roomTests[0]?.id || '');
  const activeTestForRoster = roomTests.find((t) => t.id === selectedTestId) || roomTests[0];

  // Handler for teacher creating a test
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) return;

    addAssessment(
      {
        classroom_id: roomId,
        title: newTestTitle,
        description: newTestDesc,
        instructions: 'Answer all queries carefully. Ensure column names match requirements.',
        assessment_type: 'timed_exam',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: newTestDuration,
        total_marks: newTestMarks,
        passing_marks: Math.round(newTestMarks * 0.4),
        status: 'published',
        settings: {
          randomize_questions: false,
          allow_late: false,
          immediate_feedback: false,
          release_solutions: false,
          max_attempts: 1,
        },
      },
      []
    );

    setNewTestTitle('');
    setNewTestDesc('');
    setShowTestModal(false);
    setActiveTab('tests');
  };

  // Handler for teacher adding material
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatTitle.trim()) return;

    addMaterial({
      classroom_id: roomId,
      title: newMatTitle,
      description: newMatDesc,
      resource_type: newMatType,
      external_url: newMatUrl || undefined,
      content: newMatContent || undefined,
      is_published: true,
    });

    setNewMatTitle('');
    setNewMatDesc('');
    setNewMatUrl('');
    setNewMatContent('');
    setShowMaterialModal(false);
    setActiveTab('materials');
  };

  // Handler for teacher adding announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim()) return;

    addAnnouncement({
      classroom_id: roomId,
      title: newAnnTitle,
      content: newAnnContent,
      is_pinned: newAnnPinned,
    });

    setNewAnnTitle('');
    setNewAnnContent('');
    setShowAnnouncementModal(false);
    setActiveTab('announcements');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Classroom Hero Card with Strong High-Contrast Borders */}
      <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {targetRoom.department}
            </span>
            <span className="bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-2 py-0.5 rounded">
              Sec {targetRoom.section} • Year {targetRoom.academic_year}
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded">
              Key: {targetRoom.invitation_code}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {targetRoom.name}
          </h1>
          <p className="text-slate-700 text-sm max-w-2xl font-medium">{targetRoom.description}</p>
        </div>

        {/* Quick Teacher Actions Bar */}
        {isTeacher && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTestModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Send Assessment
            </button>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <BookOpen className="w-3.5 h-3.5" /> Send Material
            </button>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <Bell className="w-3.5 h-3.5" /> Announcement
            </button>
            <Link
              href="/question-bank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              <Upload className="w-3.5 h-3.5" /> Upload / Author Question
            </Link>
          </div>
        )}
      </div>

      {/* Tabs with Bold High-Contrast Indicator */}
      <div className="flex flex-wrap border-b border-slate-300 gap-6 text-sm font-bold text-slate-700">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'roster'
              ? 'border-b-2 border-indigo-700 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Class Roster & Test Scores ({roomStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'tests'
              ? 'border-b-2 border-indigo-700 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Assessments ({roomTests.length})
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'materials'
              ? 'border-b-2 border-indigo-700 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Study Materials ({roomMaterials.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'announcements'
              ? 'border-b-2 border-indigo-700 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" /> Announcements ({roomAnnouncements.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'leaderboard'
              ? 'border-b-2 border-indigo-700 text-indigo-700'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4" /> Full Class Leaderboard
        </button>
      </div>

      {/* Tab 0: CLASS ROSTER & TEST SCORES (Direct Faculty View) */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Complete Student Roster & Test Performance
              </h2>
              <p className="text-xs text-slate-700 mt-0.5">
                Inspect every student enrolled in {targetRoom.name}, check who submitted, and identify students who have not taken the test.
              </p>
            </div>

            {/* Test Selector Dropdown */}
            {roomTests.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Select Test:</span>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-900 outline-none"
                >
                  {roomTests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.total_marks} Marks)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-800 font-extrabold text-xs text-left">
                <tr>
                  <th className="px-6 py-3.5">Roll Number</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Class / Section</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Test Status</th>
                  <th className="px-6 py-3.5 text-right">Score</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
                {roomStudents.map((stud) => {
                  const studAttempt = attempts.find(
                    (a) => a.assessment_id === activeTestForRoster?.id && a.student_id === stud.id
                  );
                  const isSubmitted = !!studAttempt;

                  return (
                    <tr
                      key={stud.id}
                      className={isSubmitted ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50'}
                    >
                      <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-800">
                        {stud.roll_number || 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        {stud.full_name}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900">
                          {stud.course} • Sec {stud.section}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600">
                        {stud.email}
                      </td>
                      <td className="px-6 py-3.5">
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle className="w-3.5 h-3.5" /> Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertCircle className="w-3.5 h-3.5" /> Did Not Take Test
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-sm">
                        {isSubmitted ? (
                          <span className="text-indigo-700">
                            {studAttempt.total_score} / {activeTestForRoster?.total_marks || 25}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {isSubmitted && isTeacher ? (
                          <Link
                            href={`/evaluations?testId=${activeTestForRoster?.id}`}
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
                          >
                            Review &rarr;
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: Assessments */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm divide-y divide-slate-200 overflow-hidden">
          {roomTests.length === 0 ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-600">
              No assessments assigned to this classroom yet.
            </div>
          ) : (
            roomTests.map((test) => {
              const myAttempt = attempts.find(
                (a) => a.assessment_id === test.id && a.student_id === currentUser.id
              );
              return (
                <div key={test.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{test.title}</h3>
                      <span className="text-xs bg-slate-100 border border-slate-300 text-slate-800 font-bold px-2 py-0.5 rounded capitalize">
                        {test.assessment_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{test.description}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700 pt-1">
                      <span>⏱️ {test.duration_minutes} Mins</span>
                      <span>🎯 Total: {test.total_marks} Marks</span>
                      <span>📅 Due: {new Date(test.end_time).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    {isTeacher ? (
                      <Link
                        href={`/evaluations?testId=${test.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold text-xs rounded-lg transition"
                      >
                        Submissions & Grading &rarr;
                      </Link>
                    ) : myAttempt ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Submitted ({myAttempt.total_score} marks)
                      </span>
                    ) : (
                      <Link
                        href={`/test/${test.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
                      >
                        Take Test &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Study Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomMaterials.length === 0 ? (
              <div className="col-span-full p-12 text-center text-sm font-semibold text-slate-600 bg-white rounded-xl border border-slate-300">
                No study materials uploaded to this classroom yet.
              </div>
            ) : (
              roomMaterials.map((mat) => (
                <div key={mat.id} className="bg-white p-5 rounded-xl border border-slate-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded">
                      {mat.resource_type}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(mat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{mat.title}</h3>
                    <p className="text-xs font-medium text-slate-700 mt-1">{mat.description}</p>
                  </div>
                  {mat.content && (
                    <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto font-mono max-h-32">
                      {mat.content}
                    </pre>
                  )}
                  {mat.external_url && (
                    <a
                      href={mat.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
                    >
                      Open Reference Material <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {roomAnnouncements.length === 0 ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-600 bg-white rounded-xl border border-slate-300">
              No announcements in this classroom.
            </div>
          ) : (
            roomAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ann.is_pinned && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold px-2 py-0.5 rounded">
                        PINNED
                      </span>
                    )}
                    <h3 className="font-extrabold text-slate-900 text-base">{ann.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700">{ann.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Room Leaderboard: {targetRoom.name}</h2>
              <p className="text-xs text-slate-700 font-medium">
                Official ranking based on verified assessments and submitted SQL practices for all students in this class.
              </p>
            </div>
          </div>

          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-slate-800 font-extrabold text-xs text-left">
              <tr>
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Completed Assessments</th>
                <th className="px-6 py-3.5 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              <tr className="bg-amber-50/60 font-bold text-slate-900">
                <td className="px-6 py-4 flex items-center gap-2">
                  <span className="text-amber-700 font-black">🥇 1</span>
                </td>
                <td className="px-6 py-4">Aravind Kumar</td>
                <td className="px-6 py-4 font-mono text-xs">21CS101</td>
                <td className="px-6 py-4">2 Tests</td>
                <td className="px-6 py-4 text-right text-indigo-700 font-extrabold">20 / 25</td>
              </tr>
              <tr className="text-slate-800">
                <td className="px-6 py-4 font-bold text-slate-700">🥈 2</td>
                <td className="px-6 py-4 font-bold">Pooja Sundaram</td>
                <td className="px-6 py-4 font-mono text-xs">21CS108</td>
                <td className="px-6 py-4">2 Tests</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">18 / 25</td>
              </tr>
              <tr className="text-slate-800">
                <td className="px-6 py-4 font-bold text-slate-700">🥉 3</td>
                <td className="px-6 py-4 font-bold">Rohan Mehra</td>
                <td className="px-6 py-4 font-mono text-xs">21CS115</td>
                <td className="px-6 py-4">1 Test</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">15 / 25</td>
              </tr>
              <tr className="text-slate-800">
                <td className="px-6 py-4 text-slate-500">4</td>
                <td className="px-6 py-4">Kavita Reddy</td>
                <td className="px-6 py-4 font-mono text-xs">21CS120</td>
                <td className="px-6 py-4">1 Test</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">12 / 25</td>
              </tr>
              <tr className="text-slate-800 bg-rose-50/30">
                <td className="px-6 py-4 text-slate-400">5</td>
                <td className="px-6 py-4">Aditya Joshi</td>
                <td className="px-6 py-4 font-mono text-xs">21CS124</td>
                <td className="px-6 py-4 text-rose-700 font-bold">0 Tests</td>
                <td className="px-6 py-4 text-right text-slate-400">0 / 25</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: TEACHER SENDS NEW ASSESSMENT */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Send Assessment to {targetRoom.name}</h2>
              <button onClick={() => setShowTestModal(false)} className="text-slate-500 hover:text-slate-800 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateTest} className="space-y-4 text-sm font-semibold text-slate-800">
              <div>
                <label className="block mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 3: Complex Joins & Subqueries"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for students..."
                  value={newTestDesc}
                  onChange={(e) => setNewTestDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="10"
                    value={newTestDuration}
                    onChange={(e) => setNewTestDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="5"
                    value={newTestMarks}
                    onChange={(e) => setNewTestMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Publish to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TEACHER SENDS STUDY MATERIAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Send Study Material to {targetRoom.name}</h2>
              <button onClick={() => setShowMaterialModal(false)} className="text-slate-500 hover:text-slate-800 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-4 text-sm font-semibold text-slate-800">
              <div>
                <label className="block mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 SQL Joins & Schema DDL Notes"
                  value={newMatTitle}
                  onChange={(e) => setNewMatTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block mb-1">Resource Type</label>
                <select
                  value={newMatType}
                  onChange={(e) => setNewMatType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="sql">SQL Script (.sql)</option>
                  <option value="link">Web Reference Link</option>
                  <option value="note">Written Class Notes</option>
                </select>
              </div>
              {newMatType === 'link' || newMatType === 'pdf' ? (
                <div>
                  <label className="block mb-1">URL / Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newMatUrl}
                    onChange={(e) => setNewMatUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block mb-1">Notes / SQL Content</label>
                  <textarea
                    rows={4}
                    placeholder="Enter query statements or lecture notes..."
                    value={newMatContent}
                    onChange={(e) => setNewMatContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono text-xs"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Share with Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TEACHER SENDS ANNOUNCEMENT */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Broadcast Announcement to {targetRoom.name}</h2>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-slate-500 hover:text-slate-800 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddAnnouncement} className="space-y-4 text-sm font-semibold text-slate-800">
              <div>
                <label className="block mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Assessment scheduled for Monday 10:00 AM"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block mb-1">Message Content *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details for all enrolled students..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={newAnnPinned}
                  onChange={(e) => setNewAnnPinned(e.target.checked)}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                <label htmlFor="pin" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Pin to top of classroom announcements
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                >
                  Send Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
