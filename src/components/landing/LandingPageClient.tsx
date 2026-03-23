"use client";

import { motion, type Variants } from "framer-motion";
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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 5, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    <div className="bg-[#050505] selection:bg-blue-500/30 overflow-hidden relative" dir="rtl">
      {/* Optimized Background Strategy */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-black">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-900/10 to-transparent" />
      </div>

      <nav className={`fixed w-full z-50 top-0 transition-colors duration-300 ${scrolled ? 'bg-zinc-950 border-b border-white/5 py-3 shadow-xl' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-blue-600/20 transition-all">
               <Zap className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div className="flex flex-col">
               <span className="text-2xl font-black text-white tracking-tight leading-none">إتقان</span>
               <span className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase mt-1.5 opacity-80">ITQAN PLATFORM</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 font-black text-sm text-zinc-400 uppercase tracking-wider">
            <Link href="#courses" className="hover:text-blue-400 transition-colors relative group">
              المواد الدراسية
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="#features" className="hover:text-blue-400 transition-colors relative group">
              لماذا إتقان؟
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
            </Link>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/auth/login" className="text-zinc-400 font-black hover:text-white transition-colors px-4 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-sm">
               دخول
             </Link>
             {!regClosed ? (
               <Link href="/auth/register" className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95">
                 سجل الآن
               </Link>
             ) : (
               <div className="flex items-center gap-2 bg-red-500/10 text-red-500 font-black px-5 py-3 rounded-2xl border border-red-500/20 text-xs">
                 <Lock className="w-4 h-4" /> التسجيل مغلق
               </div>
             )}
          </div>
        </div>
      </nav>

      <section className="relative pt-44 pb-32 overflow-hidden">
        {/* Simplified Floating Elements */}
        <motion.div variants={floatVariants} animate="animate" className="absolute top-1/4 right-10 w-3 h-3 rounded-full bg-blue-500/40 blur-sm flex will-change-transform" />
        <motion.div variants={floatVariants} animate="animate" className="absolute bottom-1/4 left-10 w-2 h-2 rounded-full bg-emerald-500/40 blur-sm flex will-change-transform" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center space-y-10"
            initial="hidden" animate="visible" variants={itemVariants}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-black shadow-2xl relative overflow-hidden group">
               <Sparkles className="w-5 h-5" /> التحديث الأقوى للمنصة وصل!
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter">
               منصة إتقان (ITQAN) <br />
               <span className="text-blue-500">إمبراطورية العلم والتفوق!</span>
            </h1>
              
            <motion.p variants={itemVariants} className="text-xl md:text-3xl text-zinc-400 max-w-5xl mx-auto leading-relaxed font-bold opacity-80 decoration-blue-500/30">
              لو فاكر إن الثانوية العامة &quot;عقدة&quot; أو إن المذاكرة حمل تقيل.. يبقى أنت لسه مشفتش إتقان. إحنا مش مجرد منصة بتشرح دروس، إحنا سيستم متكامل مبني على &quot;إتقان الوقت&quot; عشان يخليك تفرتك المنهج وأنت في قمة روقانك.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 pt-10 justify-center">
              {!regClosed ? (
                <Link href="/auth/register" className="group relative bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] text-xl px-12 py-5 rounded-3xl flex items-center justify-center gap-3 font-black transition-all hover:scale-105 hover:-translate-y-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-3">ابدأ رحلة التفوق <Rocket className="w-6 h-6 animate-bounce" /></span>
                </Link>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 font-black text-xl px-12 py-5 rounded-3xl flex items-center justify-center gap-3 cursor-not-allowed grayscale">
                  <ShieldAlert className="w-6 h-6" /> التسجيل معلق حالياً
                </div>
              )}
              <Link href="#features" className="px-12 py-5 rounded-3xl text-white font-black bg-white/[0.03] border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3 backdrop-blur-sm group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Play className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                جولة في النظام
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-white/5 max-w-4xl mx-auto">
               <div className="flex flex-col items-center">
                  <p className="text-4xl md:text-5xl font-black text-blue-500 tracking-tighter">{studentCount + 1520}+</p>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-2">طالب بيتدرب معانا</p>
               </div>
               <div className="flex flex-col items-center border-r border-white/5 pr-8">
                  <p className="text-4xl md:text-5xl font-black text-emerald-500 tracking-tighter">{courseCount}</p>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-2">كورس متاح الآن</p>
               </div>
               <div className="flex flex-col items-center border-r border-white/5 pr-8">
                  <p className="text-4xl md:text-5xl font-black text-amber-500 tracking-tighter">98%</p>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-2">نسبة نجاح الطلاب</p>
               </div>
               <div className="flex flex-col items-center border-r border-white/5 pr-8">
                  <p className="text-4xl md:text-5xl font-black text-purple-500 tracking-tighter">24/7</p>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mt-2">دعم فني وتواصل</p>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Analysis Concept Card (Visual High-end) */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto bg-zinc-900/40 border border-white/5 p-10 md:p-16 rounded-[4rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg">
                   <Target className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-4xl font-black text-white leading-tight">تحليل المستوى التلقائي لضمان وصولك للقمة.</h3>
                <p className="text-zinc-400 text-lg font-bold leading-relaxed">في الباير، إحنا بنراقب تقدمك خطوة بخطوة. مش بس بنعرف أنت خلصت إيه، بنعرف إيه اللي محتاج تقوي نفسك فيه من خلال ذكاء اصطناعي بيحلل أداءك في كل امتحان وحصة.</p>
                
                <div className="grid grid-cols-2 gap-4 pt-6">
                   <div className="bg-white/5 border border-white/5 p-4 rounded-3xl">
                      <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">نسبة الالتزام</p>
                      <p className="text-2xl font-black text-white">95%</p>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-4 rounded-3xl">
                      <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">التفاعل</p>
                      <p className="text-2xl font-black text-white">88%</p>
                   </div>
                </div>
             </div>

             <div className="relative">
                <div className="panel p-8 bg-zinc-900/80 border-white/10 rounded-[2.5rem] shadow-2xl relative z-10 space-y-8 group-hover:scale-105 transition-transform duration-700">
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-black text-zinc-500">
                        <span>التحصيل الدراسي العام</span>
                        <span className="text-blue-400">مثالي</span>
                      </div>
                      <div className="h-4 bg-black rounded-full overflow-hidden border border-white/5">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "95%" }} transition={{ duration: 2, delay: 0.5 }} className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                       <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                       </div>
                       <div>
                          <p className="text-white font-black">الكود شغال وجاهز!</p>
                          <p className="text-xs text-zinc-500 font-bold mt-1">نظام أكواد صارم يضمن حقوقك وحقوق المنصة.</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-black/40 rounded-3xl border border-white/5">
                       <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                          <Fingerprint className="w-7 h-7 text-amber-400" />
                       </div>
                       <div>
                          <p className="text-white font-black">أمان الحساب المفعل</p>
                          <p className="text-xs text-zinc-500 font-bold mt-1">لا يمكن فتح الحساب من أكثر من جهاز.</p>
                       </div>
                    </div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-emerald-600 blur-[80px] opacity-20 -z-10 animate-pulse" />
             </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid (Performance Optimized) */}
      <section id="features" className="py-24 relative bg-zinc-900/20 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 space-y-6">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                className="text-4xl md:text-7xl font-black text-white px-4"
              >
                💎 ليه منصة &quot;إتقان&quot; هي الاختيار الأول والوحيد؟
              </motion.h2>
              <p className="text-zinc-400 text-xl md:text-2xl font-bold max-w-4xl mx-auto opacity-70">
                في &quot;إتقان&quot; إحنا لغينا زمن الساعات الضايعة في الرغي اللي ملوش لازمة، وطبقنا معادلة <span className="text-blue-500">(10 + 20 = تقفيل المادة)</span>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { 
                   id: "1", title: "كبسولة الـ 10 دقائق", icon: PlayCircle, color: "blue", 
                   desc: "أول ما تدخل، هتلاقي فيديو احترافي، مدته 10 دقائق بالثانية. الفيديو ده بيديك 'زتونة' الدرس وفكرته المحورية، هتفهم الدرس بجد من غير ملل."
                 },
                 { 
                   id: "2", title: "الملخص 'الذهبي'", icon: Sparkles, color: "emerald", 
                   desc: "ملخصات معمولة بدقة متناهية، بتلم لك كل فتفوتة في المنهج، وكل تفصيلة فنية ممكن تيجي في بال الممتحن. ملخص يغنيك عن 100 كتاب خارجي."
                 },
                 { 
                   id: "3", title: "ملف 'القناص'", icon: Target, color: "amber", 
                   desc: "ملف خاص بيجمع لك أقوى وأهم الأسئلة اللي جت في امتحانات السنين اللي فاتت. هتحل اللي بيجي في الامتحان فعلاً، مش مجرد أسئلة تعجيزية."
                 },
                 { 
                   id: "4", title: "نظام 'الأمان' ضد النسيان", icon: ShieldAlert, color: "rose", // Changed ShieldCheck to ShieldAlert as per imports
                   desc: "سيستم مراجعة دورية بيراجع معاك 'فصل بفصل'. كل ما تخلص جزء، بنرجع نجيب القديم في قالب جديد يثبت المعلومة في دماغك.. يعني هتنسى تنسى!"
                 }
               ].map((feat, i) => (
                 <motion.div
                   key={feat.id}
                   initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                   whileHover={{ y: -15, scale: 1.02 }}
                   className="group relative"
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                   <div className="panel p-10 bg-zinc-950/40 border-white/5 rounded-[2.5rem] shadow-2xl relative z-10 h-full flex flex-col items-center text-center">
                      <div className={`w-24 h-24 bg-${feat.color}-500/10 rounded-3xl flex items-center justify-center mb-8 border border-${feat.color}-500/20 group-hover:rotate-6 transition-transform group-hover:bg-${feat.color}-500/20`}>
                        <feat.icon className={`w-12 h-12 text-${feat.color}-400`} />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-6 tracking-tight">{feat.title}</h3>
                      <p className="text-zinc-500 font-bold leading-[1.8] group-hover:text-zinc-300 transition-colors">{feat.desc}</p>
                   </div>
                 </motion.div>
               ))}
            </div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
               className="mt-20 panel p-12 bg-gradient-to-br from-blue-600/10 to-indigo-600/5 border-blue-500/20 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-center"
            >
               <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 -z-10">
                 <BadgeCheck className="w-44 h-44 text-white" />
               </div>
               <h3 className="text-4xl md:text-5xl font-black text-white mb-6">✨ الخلاصة يا برنس:</h3>
               <p className="text-zinc-300 text-xl md:text-3xl leading-[2] max-w-5xl mx-auto font-bold tracking-tight">
                  أنت هتخلص الدرس بكل مشتملاته (شرح، ملخص، حل امتحانات) في <span className="text-blue-400 underline decoration-blue-500/30 underline-offset-8 decoration-4">نص ساعة بس</span>. نص ساعة هتخليك &quot;برنس&quot; القاعة، وتوفر باقي يومك لمذاكرة مواد تانية أو حتى لروقانك الشخصي.
               </p>
               <div className="mt-10 inline-block px-10 py-5 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-blue-400 font-black text-2xl md:text-4xl drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">إتقان (ITQAN): إحنا مش بنشرح منهج.. إحنا بنبني عقول قادرة على التفوق!</p>
               </div>
            </motion.div>
         </div>
      </section>

      {/* NEW: Detailed How to Register Section */}
      <section className="px-6 py-40 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
               className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-black mb-8"
             >
               <Rocket className="w-5 h-5" /> دليلك الشامل لطالب إتقان الذكي
             </motion.div>
             <h2 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight">إزاي تشترك في المنصة؟</h2>
             <p className="text-zinc-500 text-2xl font-bold max-w-3xl mx-auto leading-relaxed">خطوات بسيطة جداً عشان تبدأ رحلتك التعليمية معانا وتضمن مستقبلك. ركز في الخطوات دي:</p>
          </div>

          <div className="grid md:grid-cols-4 gap-10">
             {[
               {
                 step: "01",
                 title: "إنشاء حساب جديد",
                 desc: "اضغط على زر 'سجل الآن' فوق، ودخل اسمك وإيميلك وباسوردك. الموضوع مش هياخد منك دقيقة! (ولازم تفتكر الإيميل والباسورد كويس).",
                 icon: <Fingerprint className="w-10 h-10 text-blue-500" />
               },
               {
                 step: "02",
                 title: "تحديد سنتك الدراسية",
                 desc: "بعد ما تسجل، المنصة هتفتح ليك لوحة التحكم. اختار 'المواد الدراسية' وحدد سنتك (أولى، تانية، أو تالتة ثانوي) عشان تشوف المنهج بتاعك.",
                 icon: <Target className="w-10 h-10 text-emerald-500" />
               },
               {
                 step: "03",
                 title: "تفعيل الكود (Access Code)",
                 desc: "كل مادة محتاجة 'كود تفعيل' بتجيبه من السنتر أو المدرس. اضغط على المادة واكتب الكود بتاعك في الخانة المخصصة عشان تفتح المادة.",
                 icon: <Lock className="w-10 h-10 text-amber-500" />
               },
               {
                 step: "04",
                 title: "انطلق للمذاكرة والتقفيل!",
                 desc: "بمجرد كتابة الكود، المادة هتفتح ليك للأبد. تقدر تشوف الحصص، وتحمل المذكرات، وتمتحن وتشوف نتيجتك وتحليلك فوراً.",
                 icon: <Rocket className="w-10 h-10 text-purple-500" />
               }
             ].map((item, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                 className="p-12 bg-zinc-950/40 border border-white/5 rounded-[4rem] relative group hover:bg-zinc-900/40 transition-all hover:border-blue-500/20 shadow-2xl"
               >
                 <span className="absolute top-10 right-10 text-8xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors pointer-events-none">{item.step}</span>
                 <div className="w-20 h-20 bg-black rounded-[2rem] border border-white/10 flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform relative z-10">
                   {item.icon}
                 </div>
                 <h4 className="text-3xl font-black text-white mb-6 relative z-10">{item.title}</h4>
                 <p className="text-zinc-500 font-bold text-lg leading-relaxed relative z-10 group-hover:text-zinc-400 transition-colors">{item.desc}</p>
               </motion.div>
             ))}
          </div>

          <div className="mt-32 p-12 md:p-20 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[5rem] flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_0_80px_rgba(59,130,246,0.2)] overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
             <div className="relative z-10 text-center md:text-right">
                <h3 className="text-4xl md:text-6xl font-black text-white mb-6">واجهت أي مشكلة يا بطل؟</h3>
                <p className="text-blue-100 font-bold text-2xl max-w-xl">فريق الدعم الفني في إتقان متاح 24 ساعة للرد على استفساراتك ومساعدتك في أي وقت.</p>
             </div>
             <Link href="https://wa.me/201028914389" target="_blank" className="relative z-10 bg-white text-blue-700 px-16 py-7 rounded-[2rem] font-black text-2xl hover:scale-110 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-4 group/wa">
                تواصل معنا الآن <ChevronLeft className="w-8 h-8 group-hover/wa:-translate-x-3 transition-transform" />
             </Link>
          </div>
        </div>
      </section>

      {/* Courses Section (Redesigned Extra Kharafi) */}
      <section id="courses" className="py-40 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4 text-right">
              <span className="text-blue-500 font-black tracking-widest uppercase text-sm">المحتوى الأقوى</span>
              <h2 className="text-5xl md:text-8xl font-black text-white">أقوى الكورسات المتاحة</h2>
              <p className="text-zinc-500 text-2xl font-bold tracking-wide">اشترك الآن وابدأ رحلة التفوق فوراً بدون انتظار.</p>
            </div>
            <Link href="/dashboard/courses" className="bg-white/5 hover:bg-white/10 text-white font-black px-10 py-4 rounded-3xl border border-white/10 transition-all flex items-center gap-3 backdrop-blur-xl group mb-4">
              طريقك للتفوق من هنا <ChevronLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {courses.length === 0 ? (
               <div className="col-span-full panel p-32 text-center border-white/5 bg-zinc-950/20 backdrop-blur-xl rounded-[4rem] relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[150px] -z-10" />
                  <BookOpen className="w-24 h-24 text-zinc-800 mx-auto mb-10" />
                  <h3 className="text-4xl font-black text-white mb-4 italic">المنصة تحت التجهيز الخرافي!</h3>
                  <p className="text-zinc-500 text-2xl font-bold max-w-2xl mx-auto leading-relaxed">سيتم إتاحة أفضل وأقوى الكورسات خلال الساعات القادمة، استعد لمستقبل تعليمي مختلف.</p>
               </div>
            ) : (
               courses.map((course: Course, idx: number) => {
                 const isBlue = idx % 2 === 0;
                 const glowClass = isBlue ? "border-blue-500/20 hover:border-blue-500/50" : "border-emerald-500/20 hover:border-emerald-500/50";
                 const lessonsCount = course.chapters?.reduce((acc: number, ch: Chapter) => acc + ch.lessons.length, 0) || 0;
                 
                 return (
                    <div key={course.id} 
                      className={`bg-zinc-900/60 rounded-[2.5rem] overflow-hidden flex flex-col group border transition-all duration-300 relative shadow-xl ${glowClass}`}
                    >
                     {/* Floating Badge (Price) */}
                     <div className="absolute top-8 right-8 z-30">
                        <div className={`px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border font-black text-xl tracking-tighter ${isBlue ? 'border-blue-500/30 text-blue-400' : 'border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'}`}>
                          {course.price === 0 ? "مجاني" : `${course.price} ج.م`}
                        </div>
                     </div>

                     <div className="h-80 relative overflow-hidden">
                        {course.image ? (
                           <div className="absolute inset-0 w-full h-full">
                             <Image 
                               src={course.image} 
                               alt={course.title} 
                               fill 
                               className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" 
                             />
                           </div>
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${isBlue ? 'from-blue-600/20 to-zinc-900' : 'from-emerald-600/20 to-zinc-900'} group-hover:opacity-100 transition-opacity`}>
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mt-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />
                        
                        {/* Course Identity Over Image */}
                        <div className="absolute bottom-10 inset-x-8 z-20 space-y-4">
                           <div className="flex gap-3">
                              <span className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-xl border ${isBlue ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'}`}>
                                {course.subject?.name || "مادة علمية"}
                              </span>
                              {course.gradeLevel && (
                                <span className="px-5 py-2 rounded-xl text-xs font-black bg-zinc-900/80 text-zinc-300 backdrop-blur-xl border border-white/5">
                                  {course.gradeLevel}
                                </span>
                              )}
                           </div>
                           <h3 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl">{course.title}</h3>
                        </div>
                     </div>

                     <div className="p-10 flex-1 flex flex-col bg-zinc-950/60 relative">
                       <p className="text-zinc-500 text-lg font-bold leading-relaxed mb-10 line-clamp-3 group-hover:text-zinc-400 transition-colors">
                         {course.description || "شرح ممتع ومبسط لكل أجزاء المنهج بأسئلة نظام جديد تغطي كافة الأفكار العليا. الحل الأمثل للوصول للدرجة النهائية وضمان مستقبلك الدراسي."}
                       </p>

                       <div className="mt-auto space-y-8">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center gap-3 group/stat hover:bg-white/5 transition-colors">
                               <BookOpen className={`w-6 h-6 ${isBlue ? 'text-blue-500' : 'text-emerald-500'}`} />
                               <span className="text-zinc-400 font-black text-sm">{course.chapters?.length || 0} أبواب</span>
                            </div>
                            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center gap-3 group/stat hover:bg-white/5 transition-colors">
                               <Play className={`w-6 h-6 ${isBlue ? 'text-blue-500' : 'text-emerald-500'}`} fill="currentColor" />
                               <span className="text-zinc-400 font-black text-sm">{lessonsCount} حصة</span>
                            </div>
                         </div>
                         
                         <Link 
                           href={`/dashboard/courses/${course.id}`} 
                           className={`group/btn w-full h-20 rounded-3xl flex items-center justify-center gap-4 text-xl font-black transition-all hover:scale-[1.03] active:scale-95 shadow-2xl relative overflow-hidden ${isBlue ? 'bg-white text-black' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}
                         >
                            <div className={`absolute inset-0 ${isBlue ? 'bg-zinc-200' : 'bg-emerald-500'} translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500`} />
                            <span className="relative z-10 flex items-center gap-4">
                               {course.price === 0 ? "افتح الكورس الآن" : "شراء الكود والدخول"}
                               <span className={`p-1.5 rounded-lg ${isBlue ? 'bg-black/5' : 'bg-white/20'}`}>
                                 <ChevronLeft className="w-6 h-6" />
                               </span>
                            </span>
                         </Link>
                       </div>
                     </div>
                   </motion.div>
                 );
               })
            )}
          </div>
        </div>
      </section>

      {/* Footer (Redesigned Ultra Premium) */}
      <footer className="relative bg-zinc-950 pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[150px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
           <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-2xl group cursor-pointer transition-transform">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest">أكاديمية إتقان</h2>
              <p className="text-zinc-500 font-bold text-xl max-w-sm mx-auto leading-relaxed">
                عملناها عشانك.. عشان تنجح وتفرح أهلك، الطريق للقمة بيبدأ بخطوة بسيطة في إتقان.
              </p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-10 text-sm font-black text-zinc-600 uppercase tracking-widest">
              <Link href="#" className="hover:text-blue-500 transition-colors">فيسبوك</Link>
              <Link href="#" className="hover:text-amber-500 transition-colors">يوتيوب</Link>
              <Link href="#" className="hover:text-indigo-500 transition-colors">تليجرام</Link>
              <Link href="https://wa.me/201028914389" target="_blank" className="hover:text-emerald-500 transition-colors">واتساب</Link>
           </div>
           
           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black text-zinc-700 tracking-[0.2em] uppercase">
               <p>© 2026 منصة إتقان (ITQAN). جميع الحقوق محفوظة لسيادة الطالب الأول.</p>
              <div className="flex items-center gap-4">
                 <span className="flex items-center gap-2"><MousePointer2 className="w-3 h-3 text-blue-500" /> Precision Design</span>
                 <span className="flex items-center gap-2"><Lock className="w-3 h-3 text-emerald-500" /> Secure Systems</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
