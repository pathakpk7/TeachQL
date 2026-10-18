'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { QuestionAttachmentViewer } from '@/components/QuestionAttachmentViewer';
import {
  FileCheck2,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Filter,
  Check,
  Search,
} from 'lucide-react';

export default function EvaluationsPage() {
  const {
    currentUser,
    assessments,
    attempts,
    evaluateSubmission,
    publishAssessmentResults,
  } = useStore();

  if (!currentUser || currentUser.role !== 'teacher') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-rose-950">Teacher Authorization Required</h2>
        <p className="text-xs text-rose-800 font-medium">
          The grading and evaluation workspace is restricted to faculty members. Please sign in with a registered teacher account.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          Go to Sign In / Register &rarr;
        </Link>
      </div>
    );
  }

  const isTeacher = true;

  const [selectedAttemptId, setSelectedAttemptId] = useState<string>(attempts[0]?.id || '');
  const [awardedMarks, setAwardedMarks] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId) || attempts[0];
  const targetAssessment = assessments.find((a) => a.id === selectedAttempt?.assessment_id);

  const handleSaveEvaluation = (submissionId: string, maxMarks: number) => {
    const marks = awardedMarks[submissionId] !== undefined ? awardedMarks[submissionId] : maxMarks;
    const fb = feedback[submissionId] || 'Good formulation and correct logic.';
    evaluateSubmission(submissionId, marks, fb);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handlePublishResults = () => {
    if (!targetAssessment) return;
    publishAssessmentResults(targetAssessment.id);
    alert(`Results for ${targetAssessment.title} have been officially published to enrolled students!`);
  };

  if (!isTeacher) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <h2 className="text-lg font-bold text-rose-900">Teacher Authorization Required</h2>
        <p className="text-xs text-rose-700">
          The grading and evaluation workspace is restricted to faculty members.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teacher Evaluation Workspace
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review student submissions, inspect query outputs, award partial marks, provide feedback, and publish official marks.
          </p>
        </div>

        {targetAssessment && (
          <button
            onClick={handlePublishResults}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition"
          >
            <Check className="w-4 h-4" /> Publish Marks for this Assessment
          </button>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-bold text-sm text-slate-800">Student Submission Queue</h2>
            <span className="text-xs text-slate-500">Select a student attempt to grade</span>
          </div>

          {attempts.map((att) => (
            <button
              key={att.id}
              onClick={() => setSelectedAttemptId(att.id)}
              className={`w-full text-left p-4 transition flex flex-col space-y-1.5 ${
                selectedAttempt?.id === att.id
                  ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {att.student?.full_name || 'Enrolled Student'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    att.status === 'evaluated'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {att.status}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Roll No: <span className="font-mono text-slate-700 font-semibold">{att.student?.roll_number}</span>
              </div>

              <div className="text-xs font-semibold text-indigo-700">
                Total Score: {att.total_score} marks
              </div>
            </button>
          ))}
        </div>

        {/* Right Column: Detailed Answer Review and Grading Form */}
        <div className="lg:col-span-8 space-y-6">
          {selectedAttempt ? (
            <div className="space-y-6">
              {/* Attempt Overview Banner */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Grading Answer Sheet
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedAttempt.student?.full_name} ({selectedAttempt.student?.roll_number})
                  </h2>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    Class: <span className="text-indigo-700">{selectedAttempt.student?.course || 'B.Tech CSE'} (Sec {selectedAttempt.student?.section || 'A'})</span> • Test: {targetAssessment?.title} • Submitted {new Date(selectedAttempt.submitted_at || '').toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Current Total Score</span>
                    <span className="text-2xl font-extrabold text-indigo-600">{selectedAttempt.total_score} marks</span>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {(selectedAttempt.submissions || []).map((sub, idx) => (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        Question {idx + 1} ({sub.evaluation_type === 'auto' ? 'Automated Evaluator' : 'Manual Evaluation Required'})
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">
                        {sub.question?.title || `Question #${idx + 1}`}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl">{sub.question?.problem_statement}</p>
                      
                      {/* Attached Question Files */}
                      {sub.question?.attachments && sub.question.attachments.length > 0 && (
                        <div className="pt-2">
                          <QuestionAttachmentViewer attachments={sub.question.attachments} layout="compact" />
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        Max Marks: {sub.question?.marks || 10}
                      </span>
                    </div>
                  </div>

                  {/* Student's Submitted Answer */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700">Student's Submitted Response:</span>
                    <pre className="bg-slate-900 text-emerald-300 p-4 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
                      {sub.submitted_code_or_text}
                    </pre>
                  </div>

                  {/* Teacher Solution (Protected from students) */}
                  {sub.question?.reference_query && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500">Teacher Reference Solution:</span>
                      <pre className="bg-slate-100 text-slate-700 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                        {sub.question.reference_query.trim()}
                      </pre>
                    </div>
                  )}

                  {/* Teacher Grading Inputs */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-slate-700">Awarded Marks:</label>
                      <input
                        type="number"
                        min="0"
                        max={sub.question?.marks || 10}
                        value={
                          awardedMarks[sub.id] !== undefined ? awardedMarks[sub.id] : sub.awarded_marks
                        }
                        onChange={(e) =>
                          setAwardedMarks({
                            ...awardedMarks,
                            [sub.id]: Number(e.target.value),
                          })
                        }
                        className="w-20 px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-md outline-none"
                      />
                      <span className="text-xs text-slate-400">/ {sub.question?.marks || 10}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Add constructive feedback..."
                        value={feedback[sub.id] !== undefined ? feedback[sub.id] : sub.teacher_feedback || ''}
                        onChange={(e) =>
                          setFeedback({
                            ...feedback,
                            [sub.id]: e.target.value,
                          })
                        }
                        className="text-xs px-3 py-1.5 border border-slate-300 rounded-md w-full sm:w-64 outline-none"
                      />
                      <button
                        onClick={() => handleSaveEvaluation(sub.id, sub.question?.marks || 10)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition shrink-0"
                      >
                        Save Marks
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
              No submission selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
