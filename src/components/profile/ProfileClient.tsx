"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Settings, Trophy, Book, Shield, Star, 
  Mail, Lock, Save, Camera, Key, Fingerprint, CheckCircle
} from "lucide-react";
import { updateProfile, updatePassword } from "@/app/actions/userActions";
import { toast } from "react-hot-toast";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    enrollments: {
      courseId: string;
      course: {
        title: string;
      };
    }[];
    progress: {
      completed: boolean;
    }[];
    quizResults: {
      score: number;
    }[];
  };
}

export default function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile(formData);
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success("تم تحديث البيانات بنجاح");
      if (res.user) setUser({ ...user, ...res.user } as ProfileClientProps["user"]);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("كلمات المرور الجديدة غير متطابقة");
    }
    setLoading(true);
    const res = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setLoading(false);
    if (res.error) toast.error(res.error);
    else {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  const points = user.progress.reduce((acc: number, p: { completed: boolean }) => acc + (p.completed ? 10 : 0), 0) + 
                 user.quizResults.reduce((acc: number, q: { score: number }) => acc + Math.round(q.score / 2), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" dir="rtl">
      {/* Premium Profile Header */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-3xl rounded-[3rem] -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="panel p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border-white/5 shadow-2xl">
          {/* Animated Background Decor */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />

          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-tr from-zinc-800 to-zinc-900 p-1.5 shadow-2xl group/avatar transition-transform hover:scale-105 duration-500">
               <div className="w-full h-full rounded-[2.2rem] bg-zinc-950 flex items-center justify-center overflow-hidden border border-white/5 relative">
                  <User className="w-16 h-16 md:w-24 md:h-24 text-zinc-700 group-hover/avatar:text-blue-500/50 transition-colors" />
                  <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white/50" />
                  </div>
               </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-[#0b0b0d] shadow-lg">
               <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-right">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{user.name || "طالب ألفا"}</h1>
               <div className="flex gap-2 justify-center md:justify-start">
                 <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400">طالب مقيّد</span>
                 {user.role === "ADMIN" && (
                   <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-400">أدمن</span>
                 )}
               </div>
            </div>
            <p className="text-zinc-400 text-lg md:text-xl font-medium mb-8 opacity-80">{user.email}</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-white font-black text-lg">{points} <span className="text-zinc-500 text-sm font-bold mr-1">نقطة</span></span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl shadow-inner backdrop-blur-md">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <span className="text-white font-black text-lg">بطل <span className="text-zinc-500 text-sm font-bold mr-1">المرحلة</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 flex flex-col gap-3">
           <button
             onClick={() => setActiveTab("overview")}
             className={`flex items-center gap-4 px-6 py-5 rounded-3xl transition-all font-black text-lg border-2 ${
               activeTab === "overview" 
               ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20" 
               : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
             }`}
           >
             <User className="w-5 h-5" /> نظرة عامة
           </button>
           <button
             onClick={() => setActiveTab("settings")}
             className={`flex items-center gap-4 px-6 py-5 rounded-3xl transition-all font-black text-lg border-2 ${
               activeTab === "settings" 
               ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/20" 
               : "bg-white/[0.02] border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
             }`}
           >
             <Settings className="w-5 h-5" /> الإعدادات
           </button>
           
           <div className="mt-8 p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <Lock className="w-20 h-20 text-white" />
              </div>
              <h4 className="text-sm font-black text-white mb-2 relative z-10">الأمان مفعل</h4>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed relative z-10">بياناتك مشفرة ومحمية بأحدث أنظمة الأمان الخاصة بمنصة ألفا.</p>
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[500px]">
           <AnimatePresence mode="wait">
             {activeTab === "overview" ? (
               <motion.div
                 key="overview"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-8"
               >
                 <div className="panel p-8 border-white/5 shadow-2xl">
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                      <Book className="w-6 h-6 text-blue-400" /> تقدمك في الكورسات
                    </h2>
                    <div className="space-y-8">
                       {user.enrollments.map((enroll: { courseId: string; course: { title: string } }) => (
                         <div key={enroll.courseId} className="group">
                           <div className="flex justify-between items-center mb-4">
                             <span className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{enroll.course.title}</span>
                             <span className="text-blue-400 font-black text-sm px-3 py-1 bg-blue-400/10 rounded-lg border border-blue-400/20">30% مكتمل</span>
                           </div>
                           <div className="relative h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: "30%" }}
                               className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] shadow-blue-500/20" 
                             />
                           </div>
                         </div>
                       ))}
                       {user.enrollments.length === 0 && (
                         <div className="text-center py-12">
                           <p className="text-zinc-500 font-bold mb-6 text-lg italic">لم تشترك في أي كورسات لغاية دلوقتي.. مستني إيه؟</p>
                           <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-white/10 transition-all">تصفح الكورسات</button>
                         </div>
                       )}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="panel p-8 border-white/5 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
                       <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                         <Star className="w-6 h-6 text-amber-500" /> إنجازاتك
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-amber-500/20 transition-all">
                             <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                               <Shield className="w-6 h-6 text-amber-500" />
                             </div>
                             <div>
                               <p className="text-white font-black text-sm">البداية القوية</p>
                               <p className="text-zinc-500 text-xs font-bold">بدأت أول دروسك في المنصة</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="panel p-8 border-white/5 shadow-2xl bg-gradient-to-bl from-blue-600/5 to-transparent">
                       <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                         <Trophy className="w-6 h-6 text-indigo-400" /> الإحصائيات
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                             <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">الامتحانات</p>
                             <p className="text-2xl font-black text-white">{user.quizResults.length}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5">
                             <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">الدروس</p>
                             <p className="text-2xl font-black text-white">{user.progress.length}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               </motion.div>
             ) : (
               <motion.div
                 key="settings"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                 {/* Profile Details Form */}
                 <div className="panel p-8 border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-600/5 to-transparent skew-x-12 pointer-events-none" />
                    
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                      <Mail className="w-6 h-6 text-blue-400" /> بيانات الحساب
                    </h2>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-500 uppercase mr-1">الاسم بالكامل</label>
                           <div className="relative group/input">
                              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-500 transition-colors" />
                              <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-6 text-white font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-right"
                                placeholder="ادخل اسمك هنا..."
                                required
                              />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-500 uppercase mr-1">البريد الإلكتروني</label>
                           <div className="relative group/input">
                              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-500 transition-colors" />
                              <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-6 text-white font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-sans text-right"
                                placeholder="name@example.com"
                                required
                              />
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex justify-end pt-4">
                          <button 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          >
                            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                            <Save className="w-5 h-5" />
                          </button>
                       </div>
                    </form>
                 </div>

                 {/* Password Change Form */}
                 <div className="panel p-8 border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/5 to-transparent -skew-x-12 pointer-events-none" />
                    
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                      <Lock className="w-6 h-6 text-indigo-400" /> أمان الحساب
                    </h2>
                    
                    <form onSubmit={handleUpdatePassword} className="space-y-6 relative z-10">
                       <div className="space-y-2">
                         <label className="text-xs font-black text-zinc-500 uppercase mr-1">كلمة المرور الحالية</label>
                         <div className="relative group/input">
                            <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-indigo-500 transition-colors" />
                            <input 
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-6 text-white font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-right"
                              placeholder="••••••••"
                              required
                            />
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-500 uppercase mr-1">كلمة المرور الجديدة</label>
                           <div className="relative group/input">
                              <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-indigo-500 transition-colors" />
                              <input 
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-6 text-white font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-right"
                                placeholder="كلمة مرور قوية..."
                                required
                              />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-black text-zinc-500 uppercase mr-1">تأكيد كلمة المرور</label>
                           <div className="relative group/input">
                              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-indigo-500 transition-colors" />
                              <input 
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl py-4 pr-12 pl-6 text-white font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans text-right"
                                placeholder="كررها هنا..."
                                required
                              />
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
                          <p className="text-sm text-zinc-500 font-bold max-w-xs leading-relaxed italic text-center md:text-right">نوصي دائماً بكلمة مرور تحتوي على حروف وأرقام ورموز لضمان أمان حسابك.</p>
                          <button 
                            disabled={loading}
                            className="w-full md:w-auto bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-white/5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          >
                            {loading ? "جاري التغيير..." : "تحديث الأمان"}
                            <Lock className="w-5 h-5" />
                          </button>
                       </div>
                    </form>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
