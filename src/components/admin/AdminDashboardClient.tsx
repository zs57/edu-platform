"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Users, BookOpen, Settings,
  Activity, Search, Edit, Trash2, Bell,
  TrendingUp, Database, Globe, GraduationCap, Loader2, Key, CheckCircle2, XCircle, ShieldCheck, ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";
import * as adminActions from "@/app/actions/admin";
import * as courseActions from "@/app/actions/courseActions";
import * as notificationActions from "@/app/actions/notificationActions";
import * as subjectActions from "@/app/actions/subjectActions";
import Link from "next/link";
import Image from "next/image";

type Tab = "overview" | "users" | "courses" | "subjects" | "codes" | "notifications" | "settings";

interface Subject {
  id: string;
  name: string;
  description: string;
  image: string;
  gradeLevel: string;
  _count?: { courses: number };
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  gradeLevel?: string;
  enrollmentsCount?: number;
}

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

interface AdminDashboardProps {
  stats: {
    totalStudents: number;
    totalCourses: number;
    totalLessonsViewed: number;
    activeUsersNow: number;
    chartData: { label: string; value: number; heightPct: number }[];
    serverStats: {
      dbType: string;
      ramUsedMB: number;
      uptimeHours: number;
    };
  };
  users: UserData[];
  courses: CourseData[];
  subjects: Subject[];
  initialSettings: { registrationClosed: boolean; maintenanceMode: boolean };
  accessCodes: { id: string; code: string; isUsed: boolean; user?: { name: string } | null; course: { title: string }; used?: boolean; usedAt?: Date; usedBy?: { name: string } }[];
}

export default function AdminDashboardClient({ stats, users, courses, subjects, initialSettings, accessCodes }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Settings State
  const [settings, setSettings] = useState(initialSettings);

  const [existingNotifs, setExistingNotifs] = useState<{ id: string; title: string; message: string; type: string }[]>([]);

  const handleFetchNotifs = useCallback(async () => {
    try {
      const data = await notificationActions.getNotifications();
      setExistingNotifs(data as { id: string; title: string; message: string; type: string }[]);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "notifications") {
      const timer = setTimeout(() => handleFetchNotifs(), 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, handleFetchNotifs]);

  const filteredUsers = users.filter((u: UserData) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteUser = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب وجميع بياناته بشكل نهائي؟")) return;
    startTransition(async () => {
      const res = await adminActions.deleteUser(id);
      if (res.error) toast.error(res.error);
    });
  };

  const handleDeleteCourse = (id: string) => {
    if (!confirm("الحذف سيشمل الدروس والامتحانات الخاصة بهذا الكورس. هل توافق؟")) return;
    startTransition(async () => {
      const res = await adminActions.deleteCourse(id);
      if (res.error) toast.error(res.error);
    });
  };

  const handleToggleSetting = (key: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setSettings((prev: { registrationClosed: boolean; maintenanceMode: boolean }) => ({ ...prev, [key === "REGISTRATION_CLOSED" ? "registrationClosed" : "maintenanceMode"]: newValue }));

    startTransition(async () => {
      await adminActions.toggleSetting(key, newValue.toString());
    });
  };

  const handleClearCache = () => {
    startTransition(async () => {
      await adminActions.clearCache();
      toast.success("تم إنعاش كاش التوجيه للنظام بنجاح.");
    });
  };

  const [codeCourseId, setCodeCourseId] = useState(courses[0]?.id || "");
  const [codeCount, setCodeCount] = useState(10);
  const [codePrefix, setCodePrefix] = useState("ALFA");

  const [notifData, setNotifData] = useState({ title: "", message: "", link: "", type: "INFO" });

  const handleSendNotification = () => {
    if (!notifData.title || !notifData.message) return toast.error("أكمل البيانات أولاً!");
    startTransition(async () => {
      const res = await notificationActions.createNotification(notifData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم إرسال الإشعار لجميع الطلاب بنجاح!");
        setNotifData({ title: "", message: "", link: "", type: "INFO" });
        handleFetchNotifs();
      }
    });
  };

  const handleDeleteNotification = (id: string) => {
    startTransition(async () => {
      const res = await notificationActions.deleteNotification(id);
      if (res.success) {
        toast.success("تم حذف الإشعار.");
        handleFetchNotifs();
      }
    });
  };

  const handleGenerateCodes = () => {
    if (!codeCourseId) return toast.error("اختر الكورس أولاً!");
    startTransition(async () => {
      const res = await courseActions.generateAccessCodes(codeCourseId, codeCount, codePrefix);
      if (res?.error) toast.error(res.error);
      else toast.success("تم توليد الأكواد بنجاح للمنصة.");
    });
  };

  const [subjectData, setSubjectData] = useState({ name: "", description: "", image: "", gradeLevel: "الأول الثانوي" });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);


  const handleCreateSubject = () => {
    if (!subjectData.name) return toast.error("أدخل اسم المادة أولاً!");
    startTransition(async () => {
      const res = await subjectActions.createSubject(subjectData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم إضافة المادة بنجاح!");
        setSubjectData({ name: "", description: "", image: "", gradeLevel: "الأول الثانوي" });
        window.location.reload();
      }
    });
  };

  const handleDeleteSubject = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;
    startTransition(async () => {
      const res = await subjectActions.deleteSubject(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم حذف المادة.");
        window.location.reload();
      }
    });
  };

  const handleUpdateSubject = () => {
    if (!editingSubject) return;
    startTransition(async () => {
      const res = await subjectActions.updateSubject(editingSubject.id, editingSubject);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم تحديث المادة.");
        setEditingSubject(null);
        window.location.reload();
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 relative z-10">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="panel p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-blue-500/20 bg-black/40 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
              مركز قيادة ألفا
            </h1>
            <p className="text-zinc-400 font-medium tracking-wide">تحكم كامل بالإمبراطورية التعليمية.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-md">
            {isPending ? <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /> : <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />}
            <span className="text-emerald-400 font-black text-sm tracking-wide">{isPending ? "جاري المزامنة مع السيرفر..." : "متصل بقاعدة البيانات الحية"}</span>
          </div>
          <Link href="/" className="btn-secondary flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl transition-all border border-white/5 font-bold">
            عودة للمنصة <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      {/* Modern Tab Navigation & Content Container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden panel">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-white/5 no-scrollbar bg-zinc-950/80">
          {[
            { id: "overview", label: "نظرة عامة حقيقية", icon: BarChart3, color: "blue" },
            { id: "users", label: "إدارة الطلاب", icon: Users, color: "emerald" },
             { id: "courses", label: "إدارة الكورسات", icon: BookOpen, color: "purple" },
            { id: "subjects", label: "إدارة المواد", icon: Globe, color: "emerald" },
            { id: "codes", label: "الأكواد والكوبونات", icon: Key, color: "amber" },
            { id: "notifications", label: "إدارة الإشعارات", icon: Bell, color: "blue" },
            { id: "settings", label: "إعدادات النظام", icon: Settings, color: "rose" },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-5 px-6 transition-all whitespace-nowrap text-sm font-black ${
                  isActive ? `text-${tab.color}-400` : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? `text-${tab.color}-400` : ''}`} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="adminTabLine" 
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${tab.color}-400 to-transparent shadow-[0_-5px_15px_rgba(0,0,0,0.3)]`} 
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.2 }}
            >
              {/********************************* 1. OVERVIEW TAB *********************************/}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "إجمالي الطلاب", value: stats.totalStudents, icon: Users, color: "emerald", trend: "مسجل بقاعدة البيانات" },
                      { title: "الكورسات المفعلة", value: stats.totalCourses, icon: BookOpen, color: "blue", trend: "شامل مواد علمية" },
                      { title: "تفاعل الدروس", value: stats.totalLessonsViewed, icon: Activity, color: "amber", trend: "مشاهدة مكتملة" },
                      { title: "متصل الآن (تقريبي)", value: stats.activeUsersNow, icon: Globe, color: "purple", trend: "نشاط المنصة" }
                    ].map((stat, i) => (
                      <div key={i} className={`panel p-6 border-t-2 border-${stat.color}-500/30 hover:border-${stat.color}-500/50 transition-colors shadow-lg`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-${stat.color}-500/10 text-${stat.color}-400 rounded-xl flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                          <span className="text-zinc-500 text-[10px] font-bold bg-white/5 px-2 py-1 rounded-lg">{stat.trend}</span>
                        </div>
                        <p className="text-zinc-400 font-bold mb-1">{stat.title}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Real Server Chart (Registrations in last 7 days) */}
                    <div className="panel p-6 shadow-xl border-white/5">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-400" /> معدلات النشاط (آخر ٧ أيام)
                      </h3>
                      <div className="h-64 flex items-end justify-between gap-4 border-b border-l border-white/10 pb-4 pl-4 pt-10 relative">
                         {stats.chartData.map((d, i) => (
                           <div key={i} className="w-full flex justify-center h-full items-end group">
                             <div className="w-full max-w-[40px] bg-blue-500/30 hover:bg-blue-500 rounded-t-sm relative transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)]" style={{ height: `${d.heightPct}%`, minHeight: '4px' }}>
                               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                 {d.value} طالب
                               </div>
                               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-500 font-bold whitespace-nowrap">
                                 {d.label}
                               </div>
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="panel p-6 shadow-xl border-white/5">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Database className="w-6 h-6 text-amber-400" /> معلومات السيرفر (Real-time)
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                          <span className="text-zinc-400 font-bold">قاعدة البيانات</span>
                          <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-1.5 rounded-full">{stats.serverStats.dbType}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                          <span className="text-zinc-400 font-bold">حالة الذاكرة (RAM)</span>
                          <span className="text-amber-400 font-bold text-sm bg-amber-500/10 px-4 py-1.5 rounded-full">{stats.serverStats.ramUsedMB} MB / نظام</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                          <span className="text-zinc-400 font-bold">مدة التشغيل الحالية</span>
                          <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-4 py-1.5 rounded-full">{stats.serverStats.uptimeHours} ساعات عمل</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/********************************* 2. USERS TAB *********************************/}
              {activeTab === "users" && (
                <div className="panel overflow-hidden border-white/5 shadow-xl">
                  <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/20">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-blue-400" /> قائمة الطلاب والمشتركين
                    </h2>
                    <div className="relative w-full md:w-80">
                      <Search className="w-5 h-5 text-zinc-500 absolute right-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو الإيميل..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" dir="rtl">
                      <thead>
                        <tr className="bg-zinc-950/80 text-zinc-400 text-sm border-b border-white/10">
                          <th className="p-4 font-bold text-right">الاسم</th>
                          <th className="p-4 font-bold text-right">الإيميل</th>
                          <th className="p-4 font-bold text-right">الصف</th>
                          <th className="p-4 font-bold text-right">النقاط</th>
                          <th className="p-4 font-bold text-right">الكورسات</th>
                          <th className="p-4 font-bold text-center">الإجراءات الخَطِرة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold">لا يوجد طلاب مطابقين للبحث</td>
                          </tr>
                        ) : (
                          filteredUsers.map((u: UserData) => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 text-white font-bold flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border shadow-lg ${u.role === "ADMIN" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-zinc-800 text-zinc-300 border-white/10"}`}>
                                  {u.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                {u.name}
                                {u.role === "ADMIN" && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded-full ml-2 shadow-inner">آدمن أساسي</span>}
                              </td>
                              <td className="p-4 text-zinc-400 font-mono text-sm">{u.email}</td>
                              <td className="p-4 text-zinc-300 font-bold">{u.gradeLevel}</td>
                              <td className="p-4 text-amber-400 font-black">{u.points}</td>
                              <td className="p-4 text-emerald-400 font-black">{u.enrollmentsCount} كورس</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  {u.role !== "ADMIN" && (
                                    <button 
                                      onClick={() => handleDeleteUser(u.id)}
                                      disabled={isPending}
                                      className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 disabled:opacity-50" 
                                      title="حذف الطالب وإلغاء حسابة نهائياً"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/********************************* 3. COURSES TAB *********************************/}
              {activeTab === "courses" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-lg">
                    <div className="mb-4 sm:mb-0 text-center sm:text-right">
                      <h2 className="text-2xl font-black text-white">إدارة المحتوى والكورسات</h2>
                      <p className="text-zinc-400 text-sm mt-1">بناء كورسات متكاملة مع الفصول، الدروس، الوصلات، واختبارات المادة.</p>
                    </div>
                    <Link href="/dashboard/admin/courses/new" className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                      + بناء كورس احترافي
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: CourseData) => (
                      <div key={course.id} className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all group shadow-xl hover:-translate-y-1">
                        <div className="h-32 bg-zinc-900 border-b border-white/5 relative p-6 flex flex-col justify-end">
                           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-screen" />
                           <div className="absolute top-4 left-4 flex gap-2 z-10">
                              <Link 
                                href={`/dashboard/admin/courses/${course.id}/edit`}
                                className="bg-blue-500/80 backdrop-blur-md text-white p-2 rounded-xl hover:bg-blue-500 transition-colors shadow-lg"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button 
                                onClick={() => handleDeleteCourse(course.id)}
                                disabled={isPending}
                                className="bg-red-500/80 backdrop-blur-md text-white p-2 rounded-xl hover:bg-red-500 transition-colors shadow-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                           <div className="absolute top-4 right-4 flex gap-2">
                             <span className="text-xs font-black px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-emerald-400 border border-emerald-500/20 shadow-lg">
                               {course.subject?.name || "مادة"}
                             </span>
                             {course.gradeLevel && (
                               <span className="text-xs font-bold px-3 py-1 bg-zinc-900/60 backdrop-blur-md rounded-lg text-zinc-300 border border-white/10 shadow-lg">
                                 {course.gradeLevel}
                               </span>
                             )}
                           </div>
                           <h3 className="text-2xl font-black text-white relative z-10 drop-shadow-md">{course.title}</h3>
                        </div>
                        
                        <div className="p-6">
                          <p className="text-zinc-400 text-sm line-clamp-2 mb-6 h-10 font-medium">{course.description}</p>
                          
                          <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
                            <span className="flex items-center gap-1.5 text-blue-400 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg">
                              <Users className="w-4 h-4" /> {course.enrollments?.length || 0} طُلاب
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                              <BookOpen className="w-4 h-4" /> {course.chapters?.length || 0} فصول
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/********************************* 3.2 SUBJECTS TAB *********************************/}
              {activeTab === "subjects" && (
                <div className="space-y-8">
                  <div className="panel p-8 border-emerald-500/20 shadow-2xl bg-black/20">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Globe className="w-5 h-5 text-emerald-400" />
                      </div>
                      إضافة مادة تعليمية جديدة
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">اسم المادة (مثال: الفيزياء، الكيمياء)</label>
                          <input 
                            type="text" 
                            placeholder="اسم المادة..." 
                            value={subjectData.name}
                            onChange={e => setSubjectData({...subjectData, name: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 transition-colors shadow-inner font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">وصف قصير</label>
                          <input 
                            type="text" 
                            placeholder="شرح بسيط عن المادة..." 
                            value={subjectData.description}
                            onChange={e => setSubjectData({...subjectData, description: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 transition-colors shadow-inner"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">رابط صورة المادة (URL)</label>
                          <input 
                            type="url" 
                            placeholder="https://..." 
                            value={subjectData.image}
                            onChange={e => setSubjectData({...subjectData, image: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 transition-colors shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">السنة الدراسية (Grade Level)</label>
                          <select 
                            value={subjectData.gradeLevel}
                            onChange={e => setSubjectData({...subjectData, gradeLevel: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 transition-colors shadow-inner cursor-pointer"
                          >
                            <option value="الأول الثانوي">الأول الثانوي</option>
                            <option value="الثاني الثانوي">الثاني الثانوي</option>
                            <option value="الثالث الثانوي">الثالث الثانوي</option>
                          </select>
                        </div>
                        <div className="pt-8">
                           <button 
                             onClick={handleCreateSubject}
                             disabled={isPending}
                             className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
                           >
                             {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                             اعتماد وإضافة المادة لنظام الباير
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects?.map((subj: Subject) => (
                      <div key={subj.id} className="bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all group shadow-xl relative">
                        {subj.image ? (
                          <div className="h-32 w-full relative">
                            <Image 
                               src={subj.image} 
                               alt={subj.name} 
                               fill
                               className="object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                          </div>
                        ) : (
                          <div className="h-24 bg-zinc-900 border-b border-white/5 flex items-center justify-center">
                            <Globe className="w-10 h-10 text-zinc-800" />
                          </div>
                        )}
                        
                        <div className="p-6 relative">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                               <h3 className="text-xl font-black text-white">{subj.name}</h3>
                               <div className="flex gap-2 mt-1">
                                 <span className="text-[10px] bg-white/5 text-zinc-400 px-2 py-0.5 rounded border border-white/5 font-bold">{subj.gradeLevel || "غير محدد"}</span>
                                 <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/5 font-bold">{subj._count?.courses || 0} كورس</span>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => setEditingSubject(subj)}
                                 className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all border border-blue-500/10"
                               >
                                 <Edit className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={() => handleDeleteSubject(subj.id)}
                                 className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          </div>
                          <p className="text-zinc-400 text-sm line-clamp-2 h-10 font-medium">{subj.description || "لا يوجد وصف لهذه المادة."}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Edit Subject Modal */}
                  <AnimatePresence>
                    {editingSubject && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-zinc-950 border border-white/10 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl"
                        >
                          <h3 className="text-2xl font-black text-white mb-6">تعديل المادة: {editingSubject.name}</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-zinc-400 mb-2">الاسم</label>
                              <input 
                                type="text"
                                value={editingSubject.name}
                                onChange={e => setEditingSubject({...editingSubject, name: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-zinc-400 mb-2">الوصف</label>
                              <input 
                                type="text"
                                value={editingSubject.description}
                                onChange={e => setEditingSubject({...editingSubject, description: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-zinc-400 mb-2">رابط الصورة</label>
                              <input 
                                type="url"
                                value={editingSubject.image}
                                onChange={e => setEditingSubject({...editingSubject, image: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-zinc-400 mb-2">السنة الدراسية</label>
                              <select 
                                value={editingSubject.gradeLevel}
                                onChange={e => setEditingSubject({...editingSubject, gradeLevel: e.target.value})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="الأول الثانوي">الأول الثانوي</option>
                                <option value="الثاني الثانوي">الثاني الثانوي</option>
                                <option value="الثالث الثانوي">الثالث الثانوي</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-8">
                            <button 
                              onClick={handleUpdateSubject}
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                            >
                              حفظ التعديلات
                            </button>
                            <button 
                              onClick={() => setEditingSubject(null)}
                              className="px-8 py-4 bg-zinc-900 text-zinc-400 font-black rounded-2xl hover:bg-zinc-800 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/********************************* 3.5 CODES TAB *********************************/}
              {activeTab === "codes" && (
                <div className="space-y-6">
                  <div className="panel p-8 border-amber-500/20 shadow-2xl shadow-amber-500/5 bg-black/20">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <Key className="w-5 h-5 text-amber-400" />
                      </div>
                       توليد أكواد تفعيل جديدة
                    </h2>
                    <div className="flex flex-wrap items-end gap-6">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-bold text-zinc-400 mb-2">اختر الكورس (الكود سيفعل هذا الكورس لطالب واحد فقط)</label>
                        <select value={codeCourseId} onChange={e => setCodeCourseId(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amber-500 transition-colors cursor-pointer shadow-inner">
                          {courses.map((c: CourseData) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-bold text-zinc-400 mb-2">البادئة</label>
                        <input type="text" value={codePrefix} onChange={e => setCodePrefix(e.target.value.toUpperCase())} className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amber-500 text-center font-mono font-bold shadow-inner" />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-bold text-zinc-400 mb-2">الكمية</label>
                        <input type="number" value={codeCount === 0 ? "" : codeCount} onChange={e => {
                          const v = parseInt(e.target.value);
                          setCodeCount(isNaN(v) ? 0 : v);
                        }} min={1} max={500} className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amber-500 text-center font-bold shadow-inner" />
                      </div>
                      <button onClick={handleGenerateCodes} disabled={isPending || !codeCourseId} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black shadow-lg shadow-amber-500/20 h-14 px-10 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                        {isPending ? <Loader2 className="animate-spin w-6 h-6" /> : "توليد الأكواد فوراً!"}
                      </button>
                    </div>
                  </div>

                  <div className="panel overflow-hidden border-white/5 shadow-xl">
                    <table className="w-full text-left border-collapse" dir="rtl">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 text-sm border-b border-white/10">
                          <th className="p-5 font-bold text-right">كود التفعيل الحصري</th>
                          <th className="p-5 font-bold text-right">الكورس المرتبط</th>
                          <th className="p-5 font-bold text-right">حالة الكود</th>
                          <th className="p-5 font-bold text-right">تاريخ الاستخدام</th>
                          <th className="p-5 font-bold text-right">المستخدم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 max-h-[500px] overflow-y-auto block w-full table-fixed" style={{ display: 'table-row-group' }}>
                        {accessCodes?.length === 0 && (
                          <tr><td colSpan={5} className="p-10 text-center text-zinc-500 font-bold">لا توجد أكواد مولدة بعد</td></tr>
                        )}
                        {accessCodes?.map((code) => (
                          <tr key={code.id} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="p-5 text-amber-400 font-mono font-black text-lg tracking-widest">{code.code}</td>
                            <td className="p-5 text-white font-bold">{code.course?.title}</td>
                            <td className="p-5">
                              {code.used ? 
                                <span className="flex items-center gap-1.5 text-red-500 text-sm font-bold bg-red-500/10 px-3 py-1.5 rounded-lg w-max border border-red-500/20"><XCircle className="w-4 h-4" /> تم الاستخدام</span> 
                                : 
                                <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg w-max border border-emerald-500/20"><CheckCircle2 className="w-4 h-4" /> متاح لطالب واحد</span>
                              }
                            </td>
                            <td className="p-5 text-zinc-400 text-sm font-bold">{code.usedAt ? new Date(code.usedAt).toLocaleDateString("ar-EG") : "-"}</td>
                            <td className="p-5 text-zinc-300 text-sm font-bold">{code.usedBy?.name || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/********************************* 3.7 NOTIFICATIONS TAB *********************************/}
              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div className="panel p-8 border-blue-500/20 shadow-2xl bg-black/20">
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Bell className="w-5 h-5 text-blue-400" />
                      </div>
                      إرسال إشعار عام للطلاب
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">عنوان التنبيه (قصير وقوي)</label>
                          <input 
                            type="text" 
                            placeholder="مثال: مراجعة ليلة الامتحان نزلت!" 
                            value={notifData.title}
                            onChange={e => setNotifData({...notifData, title: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors shadow-inner font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">نوع الإشعار</label>
                          <div className="flex gap-2">
                             {["INFO", "SUCCESS", "WARNING"].map(t => (
                               <button 
                                 key={t}
                                 onClick={() => setNotifData({...notifData, type: t})}
                                 className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${
                                   notifData.type === t 
                                     ? (t === "WARNING" ? "bg-amber-500/20 border-amber-500 text-amber-400" : (t === "SUCCESS" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-blue-500/20 border-blue-500 text-blue-400"))
                                     : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                                 }`}
                               >
                                 {t === "INFO" ? "معلومة" : (t === "SUCCESS" ? "نجاح" : "تحذير")}
                               </button>
                             ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">رابط التوجيه (اختياري)</label>
                          <input 
                            type="url" 
                            placeholder="https://..." 
                            value={notifData.link}
                            onChange={e => setNotifData({...notifData, link: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors shadow-inner"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-400 mb-2">نص الرسالة</label>
                          <textarea 
                            placeholder="اكتب تفاصيل الإشعار هنا..." 
                            value={notifData.message}
                            onChange={e => setNotifData({...notifData, message: e.target.value})}
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors shadow-inner h-24 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                      <button 
                        onClick={handleSendNotification}
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                        بث الإشعار فوراً لجميع الطلاب
                      </button>
                    </div>
                  </div>

                  <div className="panel p-8">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white">آخر الإشعارات المرسلة</h3>
                        <button onClick={handleFetchNotifs} className="text-xs text-blue-400 hover:underline">تحديث القائمة</button>
                     </div>
                     <div className="space-y-3">
                        {existingNotifs.length === 0 ? (
                           <p className="text-center text-zinc-600 font-bold py-10">اضغط &quot;تحديث&quot; لرؤية الإشعارات السابقة</p>
                        ) : (
                          existingNotifs.map((n: { id: string; title: string; message: string; type: string }) => (
                            <div key={n.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5 group">
                               <div className="flex items-center gap-4">
                                  <div className={`w-2 h-10 rounded-full ${n.type === "WARNING" ? "bg-amber-500" : (n.type === "SUCCESS" ? "bg-emerald-500" : "bg-blue-500")}`} />
                                  <div>
                                     <h4 className="text-white font-bold">{n.title}</h4>
                                     <p className="text-xs text-zinc-500">{n.message}</p>
                                  </div>
                               </div>
                               <button onClick={() => handleDeleteNotification(n.id)} className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                </div>
              )}

              {/********************************* 4. SETTINGS TAB *********************************/}
              {activeTab === "settings" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="panel p-8 border-white/5 shadow-xl bg-black/20">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      إعدادات المنصة المتقدمة (تعمل فعلياً)
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Registration Toggle */}
                      <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-3xl transition-colors hover:border-white/10">
                        <div>
                          <h4 className="font-black text-white text-lg">إيقاف التسجيلات الجديدة</h4>
                          <p className="text-sm text-zinc-400 mt-1 font-medium">منع إنشاء أي حسابات طلابية جديدة وتسجيل بياناتهم بالداتا بيز.</p>
                        </div>
                        <button 
                          onClick={() => handleToggleSetting("REGISTRATION_CLOSED", settings.registrationClosed)}
                          disabled={isPending}
                          className={`w-16 h-8 rounded-full relative cursor-pointer outline-none transition-colors border-2 shadow-inner ${settings.registrationClosed ? 'bg-red-500 border-red-400' : 'bg-emerald-500 border-emerald-400'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-all shadow-md ${settings.registrationClosed ? 'left-9' : 'left-0.5'}`}></div>
                        </button>
                      </div>

                      {/* Maintenance Toggle */}
                      <div className="flex items-center justify-between p-6 bg-zinc-900/50 border border-white/5 rounded-3xl transition-colors hover:border-white/10">
                        <div>
                          <h4 className="font-black text-white text-lg">وضع الاستعداد (Maintenance Mode)</h4>
                          <p className="text-sm text-zinc-400 mt-1 font-medium">وضع صيانة سيطلب من جميع المستخدمين العودة لاحقاً ولن يتمكنوا من الدخول.</p>
                        </div>
                        <button 
                          onClick={() => handleToggleSetting("MAINTENANCE_MODE", settings.maintenanceMode)}
                          disabled={isPending}
                          className={`w-16 h-8 rounded-full relative cursor-pointer outline-none transition-colors border-2 shadow-inner ${settings.maintenanceMode ? 'bg-amber-500 border-amber-400' : 'bg-zinc-700 border-zinc-600'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 transition-all shadow-md ${settings.maintenanceMode ? 'left-9' : 'left-0.5'}`}></div>
                        </button>
                      </div>

                      {/* Cache Clear */}
                      <div className="flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-3xl relative overflow-hidden mt-8">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                        <div className="relative z-10">
                          <h4 className="font-black text-red-500 text-lg">إنعاش الكاش (Clear Server Cache)</h4>
                          <p className="text-sm text-red-400/80 mt-1 font-medium">تحديث مسارات الكاش وإجبار السيرفر على سحب أحدث بيانات الكورسات.</p>
                        </div>
                        <button 
                          onClick={handleClearCache}
                          disabled={isPending}
                          className="bg-red-500 text-white px-8 py-3 rounded-xl font-black hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 relative z-10"
                        >
                          {isPending ? "جاري المسح..." : "تطبيق الآن"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
