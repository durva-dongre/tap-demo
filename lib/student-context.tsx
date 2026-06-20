"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "English" | "Hindi" | "Marathi" | "Punjabi" | "Kannada";

export type CourseId = "science" | "coding" | "financial-verticals" | "visual-arts";

export interface Student {
  name: string;
  phone: string;
  language: Language;
  hasSibling: boolean | null;
  school: string;
  class: string;
  subject: string;
  courseId: CourseId | null;
  selected_course: CourseId | null;
  currentUnitIndex: number;
  points: number;
  onboardingDone: boolean;
  demoFilled: boolean;
  cityLogo?: string;
  city?: string;
}

export const DEMO_PRESETS: Student[] = [
  {
    name: "Durva Dongre",
    phone: "96543 21098",
    language: "Marathi",
    hasSibling: null,
    school: "Sinhgad Public School, Pune",
    class: "Grade 6",
    subject: "Arts",
    courseId: null,
    selected_course: null,
    currentUnitIndex: 0,
    points: 0,
    onboardingDone: false,
    demoFilled: false,
  },
  {
    name: "Shivansh Pant",
    phone: "95432 10987",
    language: "Hindi",
    hasSibling: null,
    school: "Doon Public School, Dehradun",
    class: "Grade 8",
    subject: "Coding",
    courseId: null,
    selected_course: null,
    currentUnitIndex: 0,
    points: 0,
    onboardingDone: false,
    demoFilled: false,
  },
  {
    name: "Om Patil",
    phone: "98220 11223",
    language: "Marathi",
    hasSibling: null,
    school: "Vidya Bhavan School, Pune",
    class: "Grade 7",
    subject: "Science",
    courseId: null,
    selected_course: null,
    currentUnitIndex: 0,
    points: 0,
    onboardingDone: false,
    demoFilled: false,
  },
  {
    name: "Manu Aggarwal",
    phone: "97654 32109",
    language: "Punjabi",
    hasSibling: null,
    school: "DAV Public School, Ludhiana",
    class: "Grade 8",
    subject: "Mathematics",
    courseId: null,
    selected_course: null,
    currentUnitIndex: 0,
    points: 0,
    onboardingDone: false,
    demoFilled: false,
  },
  
];

const DEFAULT: Student = {
  name: "",
  phone: "",
  language: "English",
  hasSibling: null,
  school: "",
  class: "",
  subject: "",
  courseId: null,
  selected_course: null,
  currentUnitIndex: 0,
  points: 0,
  onboardingDone: false,
  demoFilled: false,
};

interface Ctx {
  student: Student;
  updateStudent: (patch: Partial<Student>) => void;
  addPoints: (pts: number) => void;
  resetStudent: () => void;
  hydrated: boolean;
}

const StudentContext = createContext<Ctx | null>(null);

const KEY = "tap_student_v5";

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStudent({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(student));
    } catch {}
  }, [student, hydrated]);

  const updateStudent = (patch: Partial<Student>) => {
    setStudent(prev => ({ ...prev, ...patch }));
  };

  const addPoints = (pts: number) => {
    setStudent(prev => ({ ...prev, points: prev.points + pts }));
  };

  const resetStudent = () => {
    setStudent(DEFAULT);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  return (
    <StudentContext.Provider value={{ student, updateStudent, addPoints, resetStudent, hydrated }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent must be inside StudentProvider");
  return ctx;
}