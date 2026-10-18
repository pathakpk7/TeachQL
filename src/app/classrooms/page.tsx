'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Classroom } from '@/types';
import {
  Users,
  Plus,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Copy,
  ChevronRight,
  Filter,
  Search,
  BookOpen,
} from 'lucide-react';

export default function ClassroomsPage() {
  const {
    currentUser,
    classrooms,
    addClassroom,
    joinClassroomByCode,
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
          Please register or sign in to view and manage your classrooms.
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

  // Modal / Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New classroom state
  const [newRoom, setNewRoom] = useState({
    name: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    academic_year: 3,
    semester: 5,
    section: 'A',
    academic_session: '2026-2027',
    description: '',
    join_policy: 'open_code' as const,
    status: 'active' as const,
  });

  // Join code state
  const [inputCode, setInputCode] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Filter
  const [searchTerm, setSearchTerm] = useState('');

  const displayedRooms = isTeacher
    ? getTeacherClassrooms(currentUser.id).filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.section.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : getEnrolledClassrooms(currentUser.id).filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.section.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    addClassroom(newRoom);
    setShowCreateModal(false);
    setNewRoom({
      name: '',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      academic_year: 3,
      semester: 5,
      section: 'A',
      academic_session: '2026-2027',
      description: '',
      join_policy: 'open_code',
      status: 'active',
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = joinClassroomByCode(inputCode);
    setJoinFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setShowJoinModal(false);
        setInputCode('');
        setJoinFeedback(null);
      }, 1500);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isTeacher ? 'Classroom Management' : 'My Classrooms'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isTeacher
              ? 'Create, manage, and isolate individual sections and student cohorts with unique invitation keys.'
              : 'Classrooms you are enrolled in. Enter your section invitation key to join a new classroom.'}
          </p>
        </div>

        <div>
          {isTeacher ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Create New Classroom
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <KeyRound className="w-4 h-4" /> Join via Room Code
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by class name, course, or section..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRooms.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">No classrooms found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {isTeacher
                ? 'Get started by creating your first classroom for your students.'
                : 'You have not joined any classroom yet. Ask your instructor for the room invitation code.'}
            </p>
            {isTeacher ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" /> Create Classroom
              </button>
            ) : (
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <KeyRound className="w-4 h-4" /> Enter Room Code
              </button>
            )}
          </div>
        ) : (
          displayedRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-sm transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    Sec {room.section} • Year {room.academic_year}
                  </span>
                  <span className="text-xs text-slate-400">{room.academic_session}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition">
                    {room.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description || 'No description provided.'}</p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.student_count || 0} Students</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.department}</span>
                  </div>
                </div>

                {/* Invitation Code Pill */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Invitation Code
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">{room.invitation_code}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(room.invitation_code)}
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                    title="Copy code"
                  >
                    {copiedCode === room.invitation_code ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
                <Link
                  href={`/classrooms/${room.id}`}
                  onClick={() => setCurrentRoom(room)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Enter Classroom Hub <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE CLASSROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create New Classroom</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classroom Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech CSE - 3rd Year - Section A"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newRoom.department}
                    onChange={(e) => setNewRoom({ ...newRoom, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course / Degree</label>
                  <input
                    type="text"
                    value={newRoom.course}
                    onChange={(e) => setNewRoom({ ...newRoom, course: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newRoom.academic_year}
                    onChange={(e) => setNewRoom({ ...newRoom, academic_year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRoom.semester}
                    onChange={(e) => setNewRoom({ ...newRoom, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={newRoom.section}
                    onChange={(e) => setNewRoom({ ...newRoom, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Course objectives, schedule, syllabus details..."
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                >
                  Create & Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN CLASSROOM MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Join Classroom via Code</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter the unique classroom invitation code provided by Dr. Sharma or your course instructor.
            </p>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Invitation Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TQL-CSE3-A7K9"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full font-mono text-center tracking-wider text-base uppercase px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {joinFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                    joinFeedback.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  {joinFeedback.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{joinFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition text-sm"
                >
                  Validate & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
