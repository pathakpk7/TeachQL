'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LogOut } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const { currentUser, logout, currentRoom } = useStore();

  const isTeacher = currentUser?.role === 'teacher';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-300">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white group-hover:scale-105 transition flex items-center justify-center p-0.5">
                <Image
                  src="/logo.png"
                  alt="TeachQL Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="tracking-tight leading-tight">Teach<span className="text-indigo-600">QL</span></span>
                <span className="text-[10px] text-slate-500 font-normal leading-none">SQL Learning & Assessment</span>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                  pathname === '/dashboard'
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>

              <Link
                href="/classrooms"
                className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                  pathname.startsWith('/classrooms')
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {isTeacher ? 'Manage Classrooms' : 'My Classrooms'}
              </Link>

              {isTeacher ? (
                <>
                  <Link
                    href="/question-bank"
                    className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                      pathname === '/question-bank'
                        ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                        : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    Question Bank
                  </Link>

                  <Link
                    href="/evaluations"
                    className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                      pathname === '/evaluations'
                        ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                        : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    Evaluations
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/practice"
                    className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                      pathname === '/practice'
                        ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                        : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    SQL Practice
                  </Link>
                </>
              )}

              <Link
                href="/analytics"
                className={`px-3 py-2 rounded-md text-sm font-bold transition ${
                  pathname === '/analytics'
                    ? 'text-indigo-700 bg-indigo-50 border border-indigo-200'
                    : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                Analytics
              </Link>
            </nav>
          </div>

          {/* Right User details or Sign In */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{currentUser.full_name}</span>
                  <span className="text-xs font-semibold text-slate-700 capitalize">
                    {currentUser.role} {currentUser.roll_number ? `(${currentUser.roll_number})` : ''}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-indigo-300 text-indigo-900 flex items-center justify-center font-black text-sm">
                  {currentUser.full_name[0]}
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Active Classroom Breadcrumb if navigating inside a room */}
      {currentRoom && (
        <div className="bg-indigo-50/70 border-t border-indigo-100 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm text-indigo-900">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-700">Classroom:</span>
              <span className="font-bold">{currentRoom.name}</span>
              <span className="bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                Code: {currentRoom.invitation_code}
              </span>
            </div>
            <Link
              href={`/classrooms/${currentRoom.id}`}
              className="font-medium text-indigo-600 hover:text-indigo-800 underline"
            >
              Open Room Hub &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
