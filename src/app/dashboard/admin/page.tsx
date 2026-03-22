import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { ShieldAlert } from "lucide-react";
import os from "os";
import fs from "fs/promises";
import path from "path";

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  gradeLevel?: string;
  subject?: { name: string };
  enrollments?: { id: string }[];
  chapters?: { id: string }[];
}

interface Subject {
  id: string;
  name: string;
  description: string;
  image: string;
  gradeLevel: string;
  _count?: { courses: number };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">منطقة محظورة!</h1>
        <p className="text-zinc-400 text-lg">هذه الصفحة لإدارة النظام فقط، لا تملك صلاحية الدخول.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { progress: true, quizResults: true, enrollments: true }
  });

  const courses = await prisma.course.findMany({
    include: { subject: true, chapters: { include: { lessons: true } }, enrollments: true },
    orderBy: { createdAt: "desc" }
  });

  interface AccessCodeRaw {
    id: string;
    code: string;
    used: boolean;
    usedAt: Date | null;
    courseTitle: string;
    usedByName: string | null;
  }

  // Using Raw Query because Prisma Client couldn't generate the new model due to Windows Dev Server lock
  const accessCodesRaw = await prisma.$queryRaw<AccessCodeRaw[]>`
    SELECT 
      ac.id, ac.code, ac.used, ac.usedAt,
      c.title AS "courseTitle",
      u.name AS "usedByName"
    FROM AccessCode ac
    LEFT JOIN Course c ON ac.courseId = c.id
    LEFT JOIN User u ON ac.usedById = u.id
    ORDER BY ac.createdAt DESC
  `;

  const accessCodes = accessCodesRaw.map(ac => ({
    id: ac.id,
    code: ac.code,
    used: Boolean(ac.used),
    isUsed: Boolean(ac.used), // Added for compatibility with client component
    usedAt: ac.usedAt,
    course: { title: ac.courseTitle },
    usedBy: { name: ac.usedByName }
  }));

  // System Settings Logic (Using local filesystem to bypass Prisma generate locks)
  let settingsFile: Record<string, string> = {};
  try {
    const data = await fs.readFile(path.join(process.cwd(), "settings.json"), "utf-8");
    settingsFile = JSON.parse(data);
  } catch(e) {}

  const settings = {
    registrationClosed: settingsFile["REGISTRATION_CLOSED"] === "true",
    maintenanceMode: settingsFile["MAINTENANCE_MODE"] === "true",
  };

  // Real System Stats
  const memUsage = process.memoryUsage();
  const ramUsedMB = Math.round(memUsage.rss / 1024 / 1024);
  const uptimeHours = Math.round(os.uptime() / 3600);

  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  let totalLessonsViewed = 0;
  users.forEach((u) => totalLessonsViewed += u.progress.length);

  // Generate real graph data: Last 7 days user registrations
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const registrationChart = last7Days.map((date, index) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    
    const count = users.filter((u) => (u as { createdAt: Date; role: string }).createdAt >= date && (u as { createdAt: Date; role: string }).createdAt < nextDate && (u as { createdAt: Date; role: string }).role === "STUDENT").length;
    return { day: date.toLocaleDateString('ar-EG', { weekday: 'narrow' }), count };
  });

  // Calculate percentage height for the graph relative to max
  const maxReg = Math.max(...registrationChart.map(d => d.count), 1); // fallback to 1 to avoid div/0
  const chartData = registrationChart.map(d => ({
    label: d.day,
    value: d.count,
    heightPct: Math.round((d.count / maxReg) * 100)
  }));

  const stats = {
    totalStudents,
    totalAdmins,
    totalCourses: courses.length,
    totalLessonsViewed,
    activeUsersNow: Math.floor(totalStudents * 0.4) + 1, // Approximation without websockets
    serverStats: {
      ramUsedMB,
      uptimeHours,
      dbType: "SQLite v3",
    },
    chartData
  };

  interface UserRaw {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
    gradeLevel: string | null;
    progress: { completed: boolean }[];
    quizResults: { score: number }[];
    enrollments: { id: string }[];
  }

  const formattedUsers = (users as unknown as UserRaw[]).map((u) => {
    let pts = 0;
    u.progress.forEach((p) => { if (p.completed) pts += 10; });
    u.quizResults.forEach((q) => { pts += Math.round(q.score / 2); });
    return {
      id: u.id,
      name: u.name || "طالب المنصة",
      email: u.email || "بدون بريد",
      role: u.role,
      joinedAt: u.createdAt,
      points: pts,
      enrollmentsCount: u.enrollments.length,
      gradeLevel: u.gradeLevel || "غير محدد"
    };
  });

  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { courses: true } } }
  });

  return (
    <AdminDashboardClient 
      stats={stats as { totalStudents: number; totalAdmins: number; totalCourses: number; totalLessonsViewed: number; activeUsersNow: number; serverStats: { ramUsedMB: number; uptimeHours: number; dbType: string; }; chartData: { label: string; value: number; heightPct: number; }[]; }} 
      users={formattedUsers} 
      courses={courses as unknown as CourseData[]} 
      subjects={subjects as unknown as Subject[]}
      accessCodes={accessCodes as any}
      initialSettings={settings}
    />
  );
}
