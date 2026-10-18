'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { executeSqlInSandbox, evaluateSqlQuestion, ExecutionResult } from '@/lib/sqlEngine';
import { QuestionAttachmentViewer } from '@/components/QuestionAttachmentViewer';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Send,
  Table,
  Lock,
} from 'lucide-react';

export default function StudentTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.testId as string;

  const {
    currentUser,
    assessments,
    questions,
    attempts,
    getEnrolledClassrooms,
    recordAttemptSubmission,
  } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-slate-300 rounded-2xl text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-700 font-medium">
          Students must sign in to attend and submit this SQL assessment.
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
  const targetTest = assessments.find((a) => a.id === testId);

  // Enrolled classroom check
  const enrolled = getEnrolledClassrooms(currentUser.id).some(
    (r) => r.id === targetTest?.classroom_id
  );

  // Active question index in test
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Test questions: for demo mid-term, q1, q2, q4
  const testQuestions = questions.slice(0, 3);
  const activeQuestion = testQuestions[currentQIndex];

  // Answers keyed by question id
  const [answers, setAnswers] = useState<Record<string, string>>({
    'q-sql-001': 'SELECT MAX(salary) AS second_highest_salary\nFROM Employees\nWHERE salary < (SELECT MAX(salary) FROM Employees);',
    'q-sql-002': 'SELECT department, SUM(salary) AS total_spent\nFROM Employees\nGROUP BY department\nHAVING SUM(salary) > 50000\nORDER BY total_spent DESC;',
    'q-sql-003': 'SELECT DISTINCT c.customer_name\nFROM Customers c\nJOIN Orders o ON c.customer_id = o.customer_id\nWHERE o.status = \'Pending\'\nORDER BY c.customer_name ASC;',
  });

  // Query sandbox result for active question
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);
  const [submitted, setSubmitted] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  if (!targetTest) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Assessment Not Found</h2>
      </div>
    );
  }

  // Security isolation check
  if (!isTeacher && !enrolled) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-rose-900">Access Denied (403 Forbidden)</h2>
        <p className="text-xs text-rose-700">
          This test is assigned to a classroom you are not authorized to participate in.
        </p>
      </div>
    );
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRunQuery = async () => {
    if (!activeQuestion) return;
    setIsExecuting(true);
    const qCode = answers[activeQuestion.id] || '';
    const res = await executeSqlInSandbox(
      activeQuestion.schema_ddl,
      activeQuestion.seed_data_sql,
      qCode
    );
    setExecResult(res);
    setIsExecuting(false);
  };

  const handleFinalSubmitTest = async () => {
    // Grade questions automatically or prepare for manual evaluation
    const submissionPayload = await Promise.all(
      testQuestions.map(async (q) => {
        const studentCode = answers[q.id] || '';
        if (q.question_type === 'query_writing') {
          const evalRes = await evaluateSqlQuestion(
            q.schema_ddl,
            q.seed_data_sql,
            studentCode,
            q.expected_output_json,
            q.order_sensitive,
            q.marks
          );
          return {
            questionId: q.id,
            codeOrText: studentCode,
            awardedMarks: evalRes.score,
            isCorrect: evalRes.passed,
            executionOutput: evalRes.executionResult.rows,
            executionStatus: evalRes.executionResult.success ? ('success' as const) : ('error' as const),
            evaluationType: 'auto' as const,
          };
        } else {
          // Manual theory evaluation
          return {
            questionId: q.id,
            codeOrText: studentCode,
            awardedMarks: 0,
            evaluationType: 'manual' as const,
          };
        }
      })
    );

    recordAttemptSubmission(targetTest.id, currentUser.id, submissionPayload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Assessment Successfully Submitted!</h2>
        <p className="text-sm text-slate-600">
          Your SQL queries and responses have been safely saved and evaluated.
          The objective questions have been automatically scored, and any descriptive theory questions are queued for teacher evaluation.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Assessment Header & Timer */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Live Assessment Mode
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">{targetTest.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time Left: {formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={handleFinalSubmitTest}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" /> Submit Assessment
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left Panel: Question Statement and Question Palette */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Question Palette Buttons */}
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">Question Navigation:</span>
              <div className="flex items-center gap-2">
                {testQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQIndex(idx);
                      setExecResult(null);
                    }}
                    className={`w-9 h-9 rounded-lg font-bold text-xs transition ${
                      currentQIndex === idx
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Q{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Question {currentQIndex + 1} of {testQuestions.length}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {activeQuestion.marks} Marks
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{activeQuestion.title}</h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {activeQuestion.problem_statement}
            </p>

            {/* Question Attachments (PDFs, ER Diagrams, Docs) */}
            {activeQuestion.attachments && activeQuestion.attachments.length > 0 && (
              <div className="pt-1">
                <QuestionAttachmentViewer attachments={activeQuestion.attachments} layout="expanded" />
              </div>
            )}

            {/* Schema DDL */}
            {activeQuestion.schema_ddl && (
              <div className="space-y-1 pt-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  <Table className="w-3.5 h-3.5 text-indigo-600" /> Database Schema:
                </span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono max-h-36 overflow-x-auto">
                  {activeQuestion.schema_ddl.trim()}
                </pre>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={currentQIndex === 0}
              onClick={() => {
                setCurrentQIndex((p) => p - 1);
                setExecResult(null);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 disabled:opacity-40"
            >
              &larr; Previous Question
            </button>
            <button
              disabled={currentQIndex === testQuestions.length - 1}
              onClick={() => {
                setCurrentQIndex((p) => p + 1);
                setExecResult(null);
              }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold disabled:opacity-40"
            >
              Next Question &rarr;
            </button>
          </div>
        </div>

        {/* Right Panel: Student SQL Editor & Execution Console */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">answer_q{currentQIndex + 1}.sql</span>
              <div className="flex items-center gap-2">
                {activeQuestion.question_type === 'query_writing' && (
                  <button
                    onClick={handleRunQuery}
                    disabled={isExecuting}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3 h-3" /> Test Run Query
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-900">
              <textarea
                value={answers[activeQuestion.id] || ''}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [activeQuestion.id]: e.target.value,
                  })
                }
                spellCheck={false}
                rows={10}
                className="w-full bg-transparent text-emerald-300 font-mono text-sm outline-none resize-none leading-relaxed"
                placeholder="-- Write your SQL query or theoretical answer here"
              />
            </div>
          </div>

          {/* Test Execution Output */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold bg-slate-50">
              <span className="text-slate-700">Sandbox Test Run Output</span>
              {execResult?.rowCount !== undefined && (
                <span className="text-slate-400 font-mono">
                  Rows: {execResult.rowCount} • Duration: {execResult.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="p-4 flex-1 overflow-auto text-xs">
              {execResult && !execResult.success && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-mono">
                  <strong>Query Error:</strong> {execResult.error}
                </div>
              )}

              {execResult && execResult.success && execResult.columns && (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left font-mono">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        {execResult.columns.map((c) => (
                          <th key={c} className="px-3 py-2">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {execResult.rows?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {execResult.columns?.map((c) => (
                            <td key={c} className="px-3 py-1.5 whitespace-nowrap">
                              {row[c] !== null ? String(row[c]) : <em className="text-slate-400">NULL</em>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!execResult && (
                <div className="py-8 text-center text-slate-400">
                  Click <strong>Test Run Query</strong> to verify output against sandbox dataset before final submission.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
