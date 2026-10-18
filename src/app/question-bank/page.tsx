'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Question, DifficultyLevel, QuestionType, QuestionAttachment } from '@/types';
import { QuestionFileUploader } from '@/components/QuestionFileUploader';
import { QuestionAttachmentViewer } from '@/components/QuestionAttachmentViewer';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Code2,
  Terminal,
  FileQuestion,
  ChevronRight,
  Lock,
  Upload,
  Paperclip,
} from 'lucide-react';

export default function QuestionBankPage() {
  const { currentUser, questions, addQuestion } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-slate-300 rounded-2xl text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-700 font-medium">
          Students and teachers must sign in to explore and manage the question bank.
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New question form state
  const [newQ, setNewQ] = useState({
    title: '',
    problem_statement: '',
    difficulty: 'medium' as DifficultyLevel,
    question_type: 'query_writing' as QuestionType,
    marks: 10,
    estimated_minutes: 15,
    schema_ddl: `CREATE TABLE Students (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  marks INT
);`,
    seed_data_sql: `INSERT INTO Students (id, name, marks) VALUES
(1, 'Aman', 85),
(2, 'Priya', 92),
(3, 'Rohan', 78);`,
    expected_output_json: [{ name: 'Priya', marks: 92 }],
    order_sensitive: false,
    reference_query: `SELECT name, marks FROM Students ORDER BY marks DESC LIMIT 1;`,
    hints: ['Order by marks descending and select the top record.'],
    tags: ['SELECT', 'ORDER BY'],
    attachments: [] as QuestionAttachment[],
  });

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.problem_statement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || q.question_type === selectedType;
    return matchesSearch && matchesDiff && matchesType;
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.title.trim()) return;
    addQuestion(newQ);
    setNewQ({
      title: '',
      problem_statement: '',
      difficulty: 'medium',
      question_type: 'query_writing',
      marks: 10,
      estimated_minutes: 15,
      schema_ddl: `CREATE TABLE Students (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  marks INT\n);`,
      seed_data_sql: `INSERT INTO Students (id, name, marks) VALUES\n(1, 'Aman', 85),\n(2, 'Priya', 92),\n(3, 'Rohan', 78);`,
      expected_output_json: [{ name: 'Priya', marks: 92 }],
      order_sensitive: false,
      reference_query: `SELECT name, marks FROM Students ORDER BY marks DESC LIMIT 1;`,
      hints: ['Order by marks descending and select the top record.'],
      tags: ['SELECT', 'ORDER BY'],
      attachments: [],
    });
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SQL Question Bank
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Author, organize, and reuse SQL problems, output prediction exercises, and database theory prompts across your classrooms.
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Author New Question
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions by topic, statement, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Question Types</option>
            <option value="query_writing">Query Writing</option>
            <option value="predict_output">Predict Output</option>
            <option value="find_error">Find Error</option>
            <option value="theory">Database Theory</option>
            <option value="mcq">MCQ</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No questions matched your current search filters.
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{q.title}</h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded capitalize">
                    {q.question_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">• {q.marks} Marks</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">{q.problem_statement}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(q.tags || []).map((t) => (
                    <span key={t} className="text-[11px] bg-indigo-50/70 text-indigo-700 font-medium px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Question Attachments */}
                {q.attachments && q.attachments.length > 0 && (
                  <div className="pt-2">
                    <QuestionAttachmentViewer attachments={q.attachments} layout="compact" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/practice?q=${q.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Test Run &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE QUESTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Author New SQL Question</h2>
                <p className="text-xs text-slate-500">
                  Upload a PDF/Image/Doc or type the problem details manually.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs sm:text-sm">
              {/* File Uploader for PDFs, Images, Documents, and SQL */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <QuestionFileUploader
                  attachments={newQ.attachments}
                  onAttachmentsChange={(att) => setNewQ((prev) => ({ ...prev, attachments: att }))}
                  onAutoFillFromContent={(extracted) => {
                    setNewQ((prev) => ({
                      ...prev,
                      title: prev.title.trim() ? prev.title : (extracted.title || prev.title),
                      problem_statement: prev.problem_statement.trim()
                        ? prev.problem_statement
                        : (extracted.problem_statement || prev.problem_statement),
                      schema_ddl: extracted.schema_ddl || prev.schema_ddl,
                      seed_data_sql: extracted.seed_data_sql || prev.seed_data_sql,
                      reference_query: extracted.reference_query || prev.reference_query,
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Find Highest Salary per Department (or uploaded file name)"
                  value={newQ.title}
                  onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Statement *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the objective, or refer to attached PDF / ER diagram..."
                  value={newQ.problem_statement}
                  onChange={(e) => setNewQ({ ...newQ, problem_statement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newQ.difficulty}
                    onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newQ.question_type}
                    onChange={(e) => setNewQ({ ...newQ, question_type: e.target.value as QuestionType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="query_writing">Query Writing</option>
                    <option value="predict_output">Predict Output</option>
                    <option value="find_error">Find Error</option>
                    <option value="theory">Database Theory</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={newQ.marks}
                    onChange={(e) => setNewQ({ ...newQ, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              {newQ.question_type === 'query_writing' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Schema DDL (Table Definitions)</label>
                    <textarea
                      rows={3}
                      value={newQ.schema_ddl}
                      onChange={(e) => setNewQ({ ...newQ, schema_ddl: e.target.value })}
                      className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none bg-slate-900 text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Seed Data SQL (INSERT statements)</label>
                    <textarea
                      rows={3}
                      value={newQ.seed_data_sql}
                      onChange={(e) => setNewQ({ ...newQ, seed_data_sql: e.target.value })}
                      className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none bg-slate-900 text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reference SQL Query (Teacher's Solution)</label>
                    <textarea
                      rows={2}
                      value={newQ.reference_query}
                      onChange={(e) => setNewQ({ ...newQ, reference_query: e.target.value })}
                      className="w-full font-mono text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none bg-slate-900 text-sky-300"
                    />
                  </div>
                </>
              )}

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
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
