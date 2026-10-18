'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Classroom, Question, Assessment, StudyMaterial, Announcement, AssessmentAttempt, Submission } from '@/types';
import {
  DEMO_TEACHER,
  DEMO_STUDENT_A,
  DEMO_STUDENT_B,
  ROSTER_STUDENTS,
  INITIAL_CLASSROOMS,
  INITIAL_QUESTIONS,
  INITIAL_ASSESSMENTS,
  INITIAL_MATERIALS,
  INITIAL_ANNOUNCEMENTS,
} from './initialData';

interface StoreContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => void;
  loginUser: (email: string, role: 'teacher' | 'student') => { success: boolean; message?: string };
  
  // Classrooms
  classrooms: Classroom[];
  addClassroom: (roomData: Omit<Classroom, 'id' | 'teacher_id' | 'created_at' | 'invitation_code'>) => Classroom;
  updateClassroom: (id: string, updates: Partial<Classroom>) => void;
  joinClassroomByCode: (code: string) => { success: boolean; message: string; classroom?: Classroom };
  getEnrolledClassrooms: (studentId: string) => Classroom[];
  getTeacherClassrooms: (teacherId: string) => Classroom[];
  
  // Questions
  questions: Question[];
  addQuestion: (q: Omit<Question, 'id' | 'created_by' | 'created_at'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  getQuestionsForClassroom: (classroomId?: string) => Question[];
  
  // Assessments
  assessments: Assessment[];
  addAssessment: (test: Omit<Assessment, 'id' | 'created_by' | 'created_at'>, questionIds: { questionId: string; marks: number }[]) => Assessment;
  updateAssessmentStatus: (id: string, status: Assessment['status']) => void;
  getAssessmentsForClassroom: (classroomId: string) => Assessment[];
  
  // Attempts & Submissions
  attempts: AssessmentAttempt[];
  recordAttemptSubmission: (
    assessmentId: string,
    studentId: string,
    submissions: { questionId: string; codeOrText: string; awardedMarks: number; isCorrect?: boolean; executionOutput?: any; executionStatus?: 'success' | 'error' | 'not_run'; evaluationType: 'auto' | 'manual' }[]
  ) => AssessmentAttempt;
  evaluateSubmission: (submissionId: string, marks: number, feedback: string) => void;
  publishAssessmentResults: (assessmentId: string) => void;
  
  // Materials & Announcements
  materials: StudyMaterial[];
  addMaterial: (mat: Omit<StudyMaterial, 'id' | 'created_at'>) => StudyMaterial;
  announcements: Announcement[];
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'created_at'>) => Announcement;

  // Active room helper
  currentRoom: Classroom | null;
  setCurrentRoom: (room: Classroom | null) => void;

  // Roster & Auth
  getRoomStudents: (classroomId: string) => UserProfile[];
  registerUser: (userData: {
    email: string;
    fullName: string;
    role: 'teacher' | 'student';
    rollNumber?: string;
    department: string;
    course: string;
    academicYear?: number;
    section: string;
    classroomId?: string;
    invitationCode?: string;
  }) => UserProfile;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>(INITIAL_CLASSROOMS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [assessments, setAssessments] = useState<Assessment[]>(INITIAL_ASSESSMENTS);
  const [materials, setMaterials] = useState<StudyMaterial[]>(INITIAL_MATERIALS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [currentRoom, setCurrentRoom] = useState<Classroom | null>(null);

  // Classroom memberships mapping: studentId -> classroomId[]
  const [memberships, setMemberships] = useState<{ studentId: string; classroomId: string }[]>([]);

  const [allStudents, setAllStudents] = useState<UserProfile[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserProfile[]>([]);

  // Initial Assessment Attempts
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);

  const logout = () => {
    setCurrentUser(null);
    setCurrentRoom(null);
  };

  const loginUser = (email: string, role: 'teacher' | 'student') => {
    const cleanEmail = email.trim().toLowerCase();
    if (role === 'teacher') {
      const foundTeacher = allTeachers.find((t) => t.email.toLowerCase() === cleanEmail);
      if (foundTeacher) {
        setCurrentUser(foundTeacher);
        return { success: true };
      }
      return { success: false, message: 'No registered teacher account found with this email. Please register as Teacher.' };
    } else {
      const foundStudent = allStudents.find((s) => s.email.toLowerCase() === cleanEmail);
      if (foundStudent) {
        setCurrentUser(foundStudent);
        return { success: true };
      }
      return { success: false, message: 'No registered student account found with this email. Please register as Student.' };
    }
  };

  const addClassroom = (roomData: Omit<Classroom, 'id' | 'teacher_id' | 'created_at' | 'invitation_code'>): Classroom => {
    // Generate clean unique code like TQL-CSE-9K4P
    const deptPrefix = roomData.department.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SQL');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `TQL-${deptPrefix}-${randomHex}`;

    const newRoom: Classroom = {
      ...roomData,
      id: `room-${Date.now()}`,
      teacher_id: currentUser ? currentUser.id : 'teacher-system',
      invitation_code: code,
      created_at: new Date().toISOString(),
      student_count: 0,
      active_tests_count: 0,
      pending_eval_count: 0,
    };

    setClassrooms((prev) => [newRoom, ...prev]);
    return newRoom;
  };

  const updateClassroom = (id: string, updates: Partial<Classroom>) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    if (currentRoom?.id === id) {
      setCurrentRoom((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const joinClassroomByCode = (code: string) => {
    if (!currentUser) {
      return { success: false, message: 'You must be signed in to join a classroom.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const targetRoom = classrooms.find((c) => c.invitation_code.toUpperCase() === cleanCode);
    if (!targetRoom) {
      return { success: false, message: 'Invalid classroom invitation code. Please check with your teacher.' };
    }

    if (targetRoom.join_policy === 'closed') {
      return { success: false, message: 'This classroom is currently closed for new enrollments.' };
    }

    // Check if already enrolled
    const exists = memberships.some(
      (m) => m.studentId === currentUser.id && m.classroomId === targetRoom.id
    );
    if (exists) {
      return { success: false, message: 'You are already enrolled in this classroom.' };
    }

    // Add membership
    setMemberships((prev) => [...prev, { studentId: currentUser.id, classroomId: targetRoom.id }]);
    
    // Update student count
    updateClassroom(targetRoom.id, { student_count: (targetRoom.student_count || 0) + 1 });

    return {
      success: true,
      message: `Successfully joined ${targetRoom.name}!`,
      classroom: targetRoom,
    };
  };

  const getEnrolledClassrooms = (studentId: string): Classroom[] => {
    const roomIds = memberships.filter((m) => m.studentId === studentId).map((m) => m.classroomId);
    return classrooms.filter((c) => roomIds.includes(c.id));
  };

  const getTeacherClassrooms = (teacherId: string): Classroom[] => {
    return classrooms.filter((c) => c.teacher_id === teacherId);
  };

  const addQuestion = (q: Omit<Question, 'id' | 'created_by' | 'created_at'>): Question => {
    const newQuestion: Question = {
      ...q,
      id: `q-${Date.now()}`,
      created_by: currentUser?.id || 'system',
      created_at: new Date().toISOString(),
    };
    setQuestions((prev) => [newQuestion, ...prev]);
    return newQuestion;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const getQuestionsForClassroom = (classroomId?: string): Question[] => {
    if (!classroomId) return questions;
    return questions.filter((q) => !q.classroom_id || q.classroom_id === classroomId);
  };

  const addAssessment = (
    test: Omit<Assessment, 'id' | 'created_by' | 'created_at'>,
    questionIds: { questionId: string; marks: number }[]
  ): Assessment => {
    const newTest: Assessment = {
      ...test,
      id: `test-${Date.now()}`,
      created_by: currentUser?.id || 'system',
      created_at: new Date().toISOString(),
    };

    setAssessments((prev) => [newTest, ...prev]);

    // Update classroom active test count
    const room = classrooms.find((c) => c.id === test.classroom_id);
    if (room && test.status === 'published') {
      updateClassroom(test.classroom_id, {
        active_tests_count: (room.active_tests_count || 0) + 1,
      });
    }

    return newTest;
  };

  const updateAssessmentStatus = (id: string, status: Assessment['status']) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const getAssessmentsForClassroom = (classroomId: string): Assessment[] => {
    return assessments.filter((a) => a.classroom_id === classroomId);
  };

  const recordAttemptSubmission = (
    assessmentId: string,
    studentId: string,
    submissionsData: {
      questionId: string;
      codeOrText: string;
      awardedMarks: number;
      isCorrect?: boolean;
      executionOutput?: any;
      executionStatus?: 'success' | 'error' | 'not_run';
      evaluationType: 'auto' | 'manual';
    }[]
  ): AssessmentAttempt => {
    const attemptId = `att-${Date.now()}`;
    const autoScore = submissionsData
      .filter((s) => s.evaluationType === 'auto')
      .reduce((acc, s) => acc + s.awardedMarks, 0);

    const subs: Submission[] = submissionsData.map((s, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      attempt_id: attemptId,
      question_id: s.questionId,
      submitted_code_or_text: s.codeOrText,
      execution_status: s.executionStatus || 'success',
      execution_output: s.executionOutput,
      is_correct: s.isCorrect,
      awarded_marks: s.awardedMarks,
      evaluation_type: s.evaluationType,
      question: questions.find((q) => q.id === s.questionId),
    }));

    const newAttempt: AssessmentAttempt = {
      id: attemptId,
      assessment_id: assessmentId,
      student_id: studentId,
      attempt_number: 1,
      start_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
      status: subs.some((s) => s.evaluation_type === 'manual') ? 'submitted' : 'evaluated',
      total_score: autoScore,
      auto_score: autoScore,
      manual_score: 0,
      student: currentUser || undefined,
      submissions: subs,
    };

    setAttempts((prev) => [newAttempt, ...prev]);
    return newAttempt;
  };

  const evaluateSubmission = (submissionId: string, marks: number, feedback: string) => {
    setAttempts((prevAttempts) =>
      prevAttempts.map((attempt) => {
        let submissionFound = false;
        const updatedSubs = (attempt.submissions || []).map((sub) => {
          if (sub.id === submissionId) {
            submissionFound = true;
            return {
              ...sub,
              awarded_marks: marks,
              teacher_feedback: feedback,
              evaluated_at: new Date().toISOString(),
              evaluated_by: currentUser?.id || 'teacher-evaluator',
            };
          }
          return sub;
        });

        if (submissionFound) {
          const autoMarks = updatedSubs
            .filter((s) => s.evaluation_type === 'auto')
            .reduce((sum, s) => sum + s.awarded_marks, 0);
          const manualMarks = updatedSubs
            .filter((s) => s.evaluation_type === 'manual')
            .reduce((sum, s) => sum + s.awarded_marks, 0);

          return {
            ...attempt,
            status: 'evaluated',
            auto_score: autoMarks,
            manual_score: manualMarks,
            total_score: autoMarks + manualMarks,
            submissions: updatedSubs,
          };
        }
        return attempt;
      })
    );
  };

  const publishAssessmentResults = (assessmentId: string) => {
    updateAssessmentStatus(assessmentId, 'results_published');
  };

  const addMaterial = (mat: Omit<StudyMaterial, 'id' | 'created_at'>): StudyMaterial => {
    const newMat: StudyMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setMaterials((prev) => [newMat, ...prev]);
    return newMat;
  };

  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'created_at'>): Announcement => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    return newAnn;
  };

  const getRoomStudents = (classroomId: string): UserProfile[] => {
    const studentIds = memberships
      .filter((m) => m.classroomId === classroomId)
      .map((m) => m.studentId);
    return allStudents.filter((s) => studentIds.includes(s.id));
  };

  const registerUser = (userData: {
    email: string;
    fullName: string;
    role: 'teacher' | 'student';
    rollNumber?: string;
    department: string;
    course: string;
    academicYear?: number;
    section: string;
    classroomId?: string;
    invitationCode?: string;
  }): UserProfile => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: userData.email,
      full_name: userData.fullName,
      role: userData.role,
      roll_number: userData.rollNumber,
      department: userData.department,
      course: userData.course,
      academic_year: userData.academicYear || 3,
      section: userData.section,
    };

    if (userData.role === 'student') {
      setAllStudents((prev) => [...prev, newUser]);

      // Handle direct class assignment or invitation code
      let targetClassroomId = userData.classroomId;
      if (!targetClassroomId && userData.invitationCode) {
        const found = classrooms.find(
          (c) => c.invitation_code.toUpperCase() === userData.invitationCode?.trim().toUpperCase()
        );
        if (found) targetClassroomId = found.id;
      }

      if (targetClassroomId) {
        setMemberships((prev) => [...prev, { studentId: newUser.id, classroomId: targetClassroomId! }]);
        const room = classrooms.find((c) => c.id === targetClassroomId);
        if (room) {
          updateClassroom(targetClassroomId, {
            student_count: (room.student_count || 0) + 1,
          });
        }
      }
    } else {
      setAllTeachers((prev) => [...prev, newUser]);
    }

    setCurrentUser(newUser);
    return newUser;
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logout,
        loginUser,
        classrooms,
        addClassroom,
        updateClassroom,
        joinClassroomByCode,
        getEnrolledClassrooms,
        getTeacherClassrooms,
        questions,
        addQuestion,
        updateQuestion,
        getQuestionsForClassroom,
        assessments,
        addAssessment,
        updateAssessmentStatus,
        getAssessmentsForClassroom,
        attempts,
        recordAttemptSubmission,
        evaluateSubmission,
        publishAssessmentResults,
        materials,
        addMaterial,
        announcements,
        addAnnouncement,
        currentRoom,
        setCurrentRoom,
        getRoomStudents,
        registerUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
