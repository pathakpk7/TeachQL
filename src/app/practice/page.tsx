'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { executeSqlInSandbox, evaluateSqlQuestion, ExecutionResult, EvaluationResult } from '@/lib/sqlEngine';
import { QuestionAttachmentViewer } from '@/components/QuestionAttachmentViewer';
import {
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Database,
  Terminal,
  Table,
  Eye,
  Check,
  Lock,
} from 'lucide-react';

export default function PracticePage() {
  const searchParams = useSearchParams();
  const qIdParam = searchParams.get('q');

  const { questions, currentUser } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-slate-300 rounded-2xl text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Registration Required</h2>
        <p className="text-xs text-slate-700 font-medium">
          Students must register or sign in to practice SQL questions and run queries in the sandbox.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          Register as Student &rarr;
        </Link>
      </div>
    );
  }

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    qIdParam || questions[0]?.id || ''
  );

  const activeQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];

  // Editor code state
  const [userQuery, setUserQuery] = useState<string>(
    `-- Write your SQL query here\nSELECT * FROM Employees;`
  );

  // Execution and Evaluation state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'schema' | 'hints'>('results');

  useEffect(() => {
    if (activeQuestion) {
      setUserQuery(`-- Write your SQL query for: ${activeQuestion.title}\nSELECT `);
      setExecResult(null);
      setEvalResult(null);
    }
  }, [activeQuestion?.id]);

  const handleRunQuery = async () => {
    if (!activeQuestion) return;
    setIsRunning(true);
    setEvalResult(null);

    const res = await executeSqlInSandbox(
      activeQuestion.schema_ddl,
      activeQuestion.seed_data_sql,
      userQuery
    );

    setExecResult(res);
    setIsRunning(false);
    setActiveTab('results');
  };

  const handleSubmitEvaluation = async () => {
    if (!activeQuestion) return;
    setIsRunning(true);

    const evaluation = await evaluateSqlQuestion(
      activeQuestion.schema_ddl,
      activeQuestion.seed_data_sql,
      userQuery,
      activeQuestion.expected_output_json,
      activeQuestion.order_sensitive,
      activeQuestion.marks
    );

    setEvalResult(evaluation);
    setExecResult(evaluation.executionResult);
    setIsRunning(false);
    setActiveTab('results');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Question Selector Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Practice Problem:</span>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            {questions
              .filter((q) => q.question_type === 'query_writing')
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.difficulty} • {q.marks} pts)
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
            {activeQuestion.difficulty}
          </span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
            🎯 {activeQuestion.marks} Marks
          </span>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left Panel: Problem Statement & Schema */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                SQL Problem Statement
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{activeQuestion.title}</h2>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed space-y-2">
              <p className="whitespace-pre-line">{activeQuestion.problem_statement}</p>
            </div>

            {/* Question Attachments (PDFs, ER Diagrams, Docs) */}
            {activeQuestion.attachments && activeQuestion.attachments.length > 0 && (
              <div className="pt-1">
                <QuestionAttachmentViewer attachments={activeQuestion.attachments} layout="expanded" />
              </div>
            )}

            {/* Preconfigured Schema Details */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Table className="w-4 h-4 text-indigo-600" />
                <span>Question Schema & Tables</span>
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-40">
                {activeQuestion.schema_ddl.trim()}
              </pre>
            </div>

            {/* Sample Expected Output */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Expected Target Output:
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto text-xs">
                <pre className="font-mono text-slate-800">
                  {JSON.stringify(activeQuestion.expected_output_json, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Hints Section */}
          {activeQuestion.hints && activeQuestion.hints.length > 0 && (
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-indigo-800">
                <HelpCircle className="w-3.5 h-3.5" /> Hint:
              </span>
              <p>{activeQuestion.hints[0]}</p>
            </div>
          )}
        </div>

        {/* Right Panel: SQL Editor & Results Console */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* SQL Editor Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm flex flex-col overflow-hidden">
            {/* Editor Action Bar */}
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>query.sql</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUserQuery(`SELECT * FROM Employees;`)}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>

                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" /> Run Query
                </button>

                <button
                  onClick={handleSubmitEvaluation}
                  disabled={isRunning}
                  className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded flex items-center gap-1.5 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Submit Answer
                </button>
              </div>
            </div>

            {/* Code Textarea with Monospace styling */}
            <div className="p-4 bg-slate-900">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                spellCheck={false}
                rows={9}
                className="w-full bg-transparent text-emerald-300 font-mono text-sm outline-none resize-none leading-relaxed"
                placeholder="-- Write query here"
              />
            </div>
          </div>

          {/* Results Console & Output Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold bg-slate-50">
              <span className="text-slate-700">Execution Output & Test Verification</span>
              {execResult?.executionTimeMs !== undefined && (
                <span className="text-slate-400 font-mono">
                  ⏱️ {execResult.executionTimeMs} ms • {execResult.rowCount || 0} rows
                </span>
              )}
            </div>

            <div className="p-4 flex-1 overflow-auto text-xs">
              {/* Evaluation Feedback Banner */}
              {evalResult && (
                <div
                  className={`mb-4 p-3 rounded-lg border flex items-center gap-2 font-semibold ${
                    evalResult.passed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {evalResult.passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="block">{evalResult.feedback}</span>
                    <span className="text-[11px] font-normal opacity-90">
                      Score Awarded: {evalResult.score} / {evalResult.maxScore} marks
                    </span>
                  </div>
                </div>
              )}

              {/* Execution Error */}
              {execResult && !execResult.success && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-mono">
                  <span className="font-bold block">SQL Error:</span>
                  {execResult.error}
                </div>
              )}

              {/* Results Table */}
              {execResult && execResult.success && execResult.columns && (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        {execResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 font-mono">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                      {execResult.rows?.length === 0 ? (
                        <tr>
                          <td colSpan={execResult.columns.length} className="px-3 py-3 text-center text-slate-400">
                            Empty result set (0 rows returned)
                          </td>
                        </tr>
                      ) : (
                        execResult.rows?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {execResult.columns?.map((col) => (
                              <td key={col} className="px-3 py-1.5 whitespace-nowrap">
                                {row[col] !== null ? String(row[col]) : <em className="text-slate-400">NULL</em>}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!execResult && (
                <div className="py-12 text-center text-slate-400">
                  Click <strong>Run Query</strong> to execute your SQL against the isolated test dataset.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
