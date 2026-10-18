'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  PieChart,
  Lock,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { currentUser, attempts, questions, classrooms } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border-2 border-slate-300 rounded-2xl text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-700 font-medium">
          Please sign in or register to view class performance metrics and learning analytics.
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

  const topicPerformance = [
    { topic: 'Basic SELECT & Expressions', accuracy: 94, attempts: 42, status: 'Mastered' },
    { topic: 'WHERE Filtering & Logic', accuracy: 88, attempts: 38, status: 'Proficient' },
    { topic: 'GROUP BY & Aggregations', accuracy: 76, attempts: 35, status: 'Proficient' },
    { topic: 'Joins (INNER & LEFT)', accuracy: 64, attempts: 31, status: 'Needs Practice' },
    { topic: 'Subqueries & Correlated Queries', accuracy: 48, attempts: 26, status: 'Attention Needed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isTeacher ? 'Faculty Class Performance Analytics' : 'My Learning Analytics & Mastery'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {isTeacher
            ? 'Actionable insights across multiple classrooms to identify concepts where students struggle and plan targeted revisions.'
            : 'Track your topic-wise mastery, question accuracy trends, and personalized recommendations.'}
        </p>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Accuracy
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">78.4%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +5.2%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 140 evaluation test cases</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Questions Solved
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">32</span>
            <span className="text-xs text-slate-500">of 45 in bank</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">71% total coverage</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Strongest Topic
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-700">SELECT Statements</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">94% average score</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Needs Revision
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-700">Subqueries & CTEs</span>
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">48% average score</p>
        </div>
      </div>

      {/* Actionable Teaching Recommendations Banner */}
      <div className="bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-indigo-950">Actionable Curriculum Insights</h2>
          </div>
          <p className="text-xs text-indigo-900/80 max-w-2xl leading-relaxed">
            {isTeacher
              ? 'Data reveals that 52% of students in Section A lost marks on correlated subquery filtering. Scheduling a 20-minute lab session on subqueries before the final exam is strongly advised.'
              : 'Your score in JOIN queries is 64%. Solving 3 additional multi-table join exercises will help you secure an A grade in the upcoming test.'}
          </p>
        </div>

        <a
          href="/practice"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0"
        >
          {isTeacher ? 'Create Target Practice Set' : 'Practice Weak Topics &rarr;'}
        </a>
      </div>

      {/* Topic-Wise Performance Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Topic-Wise Performance & Mastery</h2>
            <p className="text-xs text-slate-500">
              Aggregated from live SQL query executions and automated unit tests.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {topicPerformance.map((item) => (
            <div key={item.topic} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 w-full sm:w-1/3">
                <span className="font-bold text-slate-900 text-sm">{item.topic}</span>
                <span className="block text-xs text-slate-400">{item.attempts} student attempts recorded</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-1/3 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Accuracy</span>
                  <span className="text-indigo-600">{item.accuracy}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.accuracy >= 85
                        ? 'bg-emerald-500'
                        : item.accuracy >= 65
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>

              <div className="sm:w-1/4 text-right">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.status === 'Mastered'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'Proficient'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
