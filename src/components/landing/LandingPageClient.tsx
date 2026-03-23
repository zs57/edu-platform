"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, Target, ChevronLeft, 
  CheckCircle2, BookOpen, Lock, Sparkles, Zap, 
  PlayCircle, LayoutDashboard, Rocket,
  Fingerprint, ShieldAlert, BadgeCheck, MousePointer2
} from "lucide-react";
import { useState, useEffect } from "react";

interface Lesson { 
  id: string; 
}

interface Chapter { 
  lessons: Lesson[]; 
}

interface Course { 
  id: string; 
  title: string; 
  description: string | null; 
  image: string | null; 
  price: number; 
  subject?: { name: string }; 
  gradeLevel?: string; 
  chapters?: Chapter[]; 
}

export default function LandingPageClient({ courses, studentCount, courseCount, regClosed }: { 
  courses: Course[], 
  studentCount: number, 
  courseCount: number, 
  regClosed: boolean 
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-black text-white selection:bg-blue-500/30 overflow-hidden relative" dir="rtl">
      {/* Dynamic Background - Ultra Lightweight */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent" />
      </div>

      <nav className={`fixed w-full z-50 top-0 transition-colors duration-200 ${scrolled ? 'bg-zinc-950/95 border-b border-white/5 py-2 shadow-lg' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
               <Zap className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-black tracking-tight">إتقان</span>
               <span className="text-[8px] font-black text-blue-400 tracking-widest leading-none">ITQAN</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 font-black text-xs text-zinc-400 uppercase">
            <Link href="#courses" className="hover:text-blue-400 transition-colors">المواد</Link>
            <Link href="#features" className="hover:text-blue-400 transition-colors">المميزات</Link>
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
              <LayoutDashboard className="w-3 h-3" /> لوحة التحكم
            </Link>
          </div>

          <div className="flex items-center gap-2">
             <Link href="/auth/login" className="text-zinc-400 font-black hover:text-white px-3 py-1.5 rounded-lg border border-white/5 text-xs">
               دخول
             </Link>
             {!regClosed ? (
               <Link href="/auth/register" className="bg-white text-black px-5 py-2 rounded-lg font-black text-xs hover:bg-zinc-200 transition-colors">
                 سجل الآن
               </Link>
             ) : (
               <div className="text-red-500 font-black px-3 py-1.5 rounded-lg border border-red-500/20 text-[10px] flex items-center gap-1">
                 <Lock className="w-3 h-3" /> مغلق
               </div>
             )}
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black">
               <Sparkles className="w-4 h-4" /> تحديث جديد!
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
               منصة إتقان التعليمية <br />
               <span className="text-blue-500">طريقك نحو القمة بدآ من هنا</span>
            </h1>
              
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-bold">
              نظام تعليمي متكامل للثانوية العامة يعتمد على "خلاصة المنهج" لضمان التفوق بأقل مجهود وفي أسرع وقت.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center">
              {!regClosed ? (
                <Link href="/auth/register" className="bg-blue-600 text-white text-lg px-10 py-4 rounded-2xl flex items-center justify-center gap-2 font-black hover:bg-blue-700 transition-colors">
                  ابدأ الآن <Rocket className="w-5 h-5" />
                </Link>
              ) : (
                <div className="bg-zinc-800 text-zinc-500 font-black text-lg px-10 py-4 rounded-2xl cursor-not-allowed">
                  التسجيل مغلق
                </div>
              )}
              <Link href="#features" className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-black hover:bg-white/10 transition-colors">
                لماذا إتقان؟
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto border-t border-white/5">
               {[
                 { label: "طالب متفوق", value: studentCount + 1520 + "+" },
                 { label: "كورس متاح", value: courseCount },
                 { label: "نسبة النجاح", value: "98%" },
                 { label: "دعم متميز", value: "24/7" }
               ].map((stat, i) => (
                 <div key={i} className="text-center">
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black">{stat.label}</p>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* Simplified Features */}
      <section id="features" className="py-20 bg-zinc-900/30 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-black text-center mb-16">💎 مميزات إتقان</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { title: "كبسولة الـ 10 دقائق", icon: PlayCircle, color: "blue", desc: "شرح خلاصة الدرس في 10 دقائق فقط لضمان الفهم السريع." },
                 { title: "الملخص الذهبي", icon: Sparkles, color: "emerald", desc: "ملخصات شاملة لكل فنيات المنهج تغنيك عن أي مصدر آخر." },
                 { title: "ملف القناص", icon: Target, color: "amber", desc: "تجميعة لأهم أسئلة الامتحانات السابقة لتدريب واقعي." },
                 { title: "المراجعة الدورية", icon: ShieldAlert, color: "rose", desc: "نظام مراجعة يضمن عدم نسيان الفصول السابقة." }
               ].map((feat, i) => (
                 <div key={i} className="p-8 bg-black border border-white/5 rounded-3xl text-center hover:border-blue-500/20 transition-colors">
                    <div className={`w-16 h-16 bg-${feat.color}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <feat.icon className={`w-8 h-8 text-${feat.color}-500`} />
                    </div>
                    <h3 className="text-xl font-black mb-4">{feat.title}</h3>
                    <p className="text-zinc-500 text-sm font-bold leading-relaxed">{feat.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* How to Register */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black text-center mb-16">إزاي تشترك؟</h2>
        <div className="grid md:grid-cols-4 gap-6">
           {[
             { step: "1", title: "سجل حساب", desc: "أنشئ حسابك باسمك وبياناتك." },
             { step: "2", title: "اختار مادتك", desc: "حدد صفك الدراسي والمادة." },
             { step: "3", title: "فعل الكود", desc: "اكتب الكود اللي استلمته." },
             { step: "4", title: "ابدأ المذاكرة", desc: "استمتع بالمحتوى الحصري." }
           ].map((step, i) => (
             <div key={i} className="p-8 bg-zinc-900/50 rounded-3xl border border-white/5 relative">
                <span className="text-5xl font-black text-white/5 absolute top-4 right-4">{step.step}</span>
                <h4 className="text-xl font-black mb-3">{step.title}</h4>
                <p className="text-zinc-500 text-sm font-bold">{step.desc}</p>
             </div>
           ))}
        </div>
        
        <div className="mt-20 p-8 md:p-12 bg-blue-600 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="text-center md:text-right">
              <h3 className="text-3xl font-black">محتاج مساعدة؟</h3>
              <p className="text-blue-100 font-bold">فريق الدعم متاح 24 ساعة لخدمتك.</p>
           </div>
           <Link href="https://wa.me/201028914389" target="_blank" className="bg-white text-blue-600 px-10 py-4 rounded-xl font-black text-xl hover:scale-105 transition-transform">
              واتساب : 01028914389
           </Link>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4">أقوى الكورسات</h2>
          <p className="text-zinc-500 font-bold">اختر مادتك وابدأ فوراً</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="h-64 relative bg-zinc-800">
                {course.image && (
                  <Image src={course.image} alt={course.title} fill className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                   <h3 className="text-2xl font-black">{course.title}</h3>
                   <p className="text-blue-400 text-sm font-black mt-1">{course.subject?.name}</p>
                </div>
                <div className="absolute top-6 right-6 bg-black/80 px-4 py-2 rounded-lg border border-white/10 font-black">
                   {course.price} ج.م
                </div>
              </div>
              <div className="p-8">
                <p className="text-zinc-500 text-sm font-bold mb-6 line-clamp-2">{course.description}</p>
                <Link href={`/dashboard/courses/${course.id}`} className="w-full bg-white text-black py-4 rounded-xl flex items-center justify-center font-black hover:bg-zinc-200 transition-colors">
                   دخول الكورس
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
         <div className="max-w-7xl mx-auto px-4 space-y-6">
            <h2 className="text-2xl font-black">أكاديمية إتقان</h2>
            <p className="text-zinc-600 font-bold max-w-sm mx-auto">طريقك للقمة بيبدأ بخطوة بسيطة في إتقان.</p>
            <div className="flex justify-center gap-6 text-xs font-black text-zinc-500">
               <Link href="#" className="hover:text-blue-500">فيسبوك</Link>
               <Link href="#" className="hover:text-emerald-500">واتساب</Link>
               <Link href="#" className="hover:text-indigo-500">تليجرام</Link>
            </div>
            <p className="text-[10px] text-zinc-800 font-black uppercase tracking-widest pt-10">
              © 2026 ITQAN. ALL RIGHTS RESERVED.
            </p>
         </div>
      </footer>
    </div>
  );
}
