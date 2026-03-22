"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Zap, Layout, 
  GraduationCap, ChevronLeft, Calendar, BookCheck, Sparkles, 
  Globe, Rocket, Target, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  gradeLevel: string | null;
  subject: { 
    id: string;
    name: string;
    image?: string | null;
    description?: string | null;
    gradeLevel?: string | null;
  };
  enrollments: { id: string }[];
  chapters: { lessons: { id: string }[] }[];
}

export default function CoursesClient({ initialCourses }: { initialCourses: Course[] }) {
  const [step, setStep] = useState<"grade" | "subject" | "courses">("grade");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const grades = ["الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"];

  // Filter subjects based on selected grade
  const availableSubjects = useMemo(() => {
    if (!selectedGrade) return [];
    
    // Extract unique subjects for the selected grade
    const subjectsMap = new Map();
    initialCourses.forEach(course => {
      // Check if course has a subject and matches the grade
      if (course.subject && (course.subject.gradeLevel === selectedGrade || course.gradeLevel === selectedGrade)) {
        subjectsMap.set(course.subject.id, course.subject);
      }
    });
    return Array.from(subjectsMap.values());
  }, [selectedGrade, initialCourses]);

  // Filter courses based on selected grade and subject
  const filteredCourses = useMemo(() => {
    if (!selectedGrade || !selectedSubjectId) return [];
    return initialCourses.filter(c => 
      (c.gradeLevel === selectedGrade) && c.subject?.id === selectedSubjectId
    );
  }, [selectedGrade, selectedSubjectId, initialCourses]);

  const selectedSubject = availableSubjects.find(s => s.id === selectedSubjectId);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        staggerChildren: 0.1, 
        duration: 0.6, 
        ease: "easeOut"
      } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut"
      } 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 overflow-hidden relative" dir="rtl">
      {/* Premium Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[45vw] h-[45vw] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[35vw] h-[35vw] bg-emerald-600/5 blur-[100px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Header Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-blue-400" /> Choose Your Path to Excellence
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mix-blend-plus-lighter leading-tight">
            {step === "grade" && "اختار سنتك الدراسية"}
            {step === "subject" && `مواد ${selectedGrade}`}
            {step === "courses" && `كورسات ${selectedSubject?.name}`}
          </h1>
          <p className="text-zinc-500 text-xl md:text-2xl font-bold max-w-3xl leading-relaxed">
            {step === "grade" && "حدد السنة الدراسية اللي بتدرس فيها عشان نظهرلك المواد المتاحة ليك في نظام 'الباير'."}
            {step === "subject" && `أهلاً بك في ${selectedGrade}. اختار المادة اللي حابب تبدأ فيها رحلة التفوق النهاردة.`}
            {step === "courses" && `مستعد؟ دي قائمة بأقوى الكورسات المتاحة في ${selectedSubject?.name} لضمان تقفيل المادة بالكامل.`}
          </p>
        </div>

        {/* Step-by-Step Selection Flow */}
        <AnimatePresence mode="wait">
          {step === "grade" && (
            <motion.div 
              key="grade-view"
              variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -50 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10"
            >
              {grades.map((grade) => (
                <motion.button
                  key={grade}
                  variants={itemVariants}
                  whileHover={{ y: -15, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedGrade(grade); setStep("subject"); }}
                  className="group relative h-96 rounded-[3.5rem] bg-zinc-950/40 border border-white/5 p-12 text-right overflow-hidden shadow-2xl backdrop-blur-xl hover:border-blue-500/30 transition-all duration-700"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-6 h-full flex flex-col justify-between">
                    <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500 shadow-lg">
                      <GraduationCap className="w-10 h-10 text-blue-400 group-hover:text-white" />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">{grade}</h3>
                       <p className="text-zinc-500 text-lg font-bold mt-4 leading-relaxed line-clamp-2">جميع المواد والكورسات المتاحة لهذا العام الدراسي بدقة متناهية.</p>
                    </div>
                    <div className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest mt-6">
                      استكشاف المواد <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 p-10 opacity-5 rotate-12 pointer-events-none">
                     <Zap className="w-48 h-48 text-white" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {step === "subject" && (
            <motion.div 
              key="subject-view"
              variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -50 }}
              className="space-y-12"
            >
              <button 
                onClick={() => setStep("grade")}
                className="flex items-center gap-3 text-zinc-500 hover:text-white font-black transition-colors px-6 py-3 rounded-2xl bg-white/5 border border-white/10 group shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1" /> العودة لاختيار السنة الدراسية
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject: { id: string; name: string; image?: string | null; description?: string | null; gradeLevel?: string | null }) => (
                    <motion.button
                      key={subject.id}
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      onClick={() => { setSelectedSubjectId(subject.id); setStep("courses"); }}
                      className="group relative p-1 pb-1 flex flex-col rounded-[3.5rem] bg-zinc-950/40 border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-700 md:h-80"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none" />
                      <div className="flex flex-col md:flex-row h-full">
                         {subject.image && (
                            <div className="w-full md:w-1/3 relative overflow-hidden h-48 md:h-full">
                               <Image 
                                  src={subject.image} 
                                  alt={subject.name} 
                                  fill
                                  className="object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
                               />
                               <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 via-transparent to-transparent hidden md:block z-10" />
                            </div>
                         )}
                         <div className={`p-10 flex-1 flex flex-col justify-center text-right ${!subject.image ? 'md:w-full' : ''}`}>
                            <div className="inline-flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest mb-4">
                               <Globe className="w-4 h-4" /> مادة مسجلة في &quot;الباير&quot;
                            </div>
                            <h3 className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">{subject.name}</h3>
                            <p className="text-zinc-500 font-bold mt-4 text-lg line-clamp-2">{subject.description || "استعد لتجربة تعليمية مختلفة تغطي كافة تفاصيل المنهج."}</p>
                            <div className="mt-8 flex items-center justify-end gap-3 text-white font-black text-sm uppercase">
                               عرض الكورسات <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                            </div>
                         </div>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="col-span-full py-32 text-center rounded-[4rem] border border-dashed border-white/5 bg-white/5">
                    <ShieldCheck className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-white italic">لا توجد مواد متاحة لهذا العام حالياً.</h3>
                    <p className="text-zinc-600 text-xl font-bold max-w-lg mx-auto leading-relaxed mt-4">سيتم إضافة المواد والكورسات الخاصة بهذا العام الدراسي قريباً جداً.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === "courses" && (
            <motion.div 
              key="courses-view"
              variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -50 }}
              className="space-y-12"
            >
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setStep("grade")}
                  className="flex items-center gap-3 text-zinc-400 hover:text-white font-black transition-colors px-6 py-3 rounded-2xl bg-white/5 border border-white/10 group shadow-lg"
                >
                  <Calendar className="w-5 h-5 text-zinc-600" /> {selectedGrade}
                </button>
                <button 
                  onClick={() => setStep("subject")}
                  className="flex items-center gap-3 text-zinc-400 hover:text-white font-black transition-colors px-6 py-3 rounded-2xl bg-white/5 border border-white/10 group shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" /> {selectedSubject?.name}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: Course) => {
                    const isPhysics = course.subject.name.includes("فيزياء");
                    const themeColor = isPhysics ? "blue" : "emerald";

                    return (
                      <motion.div
                        key={course.id} variants={itemVariants} whileHover={{ y: -15 }}
                        className={`group relative bg-zinc-950/40 border border-white/5 rounded-[4rem] overflow-hidden hover:border-${themeColor}-500/30 transition-all duration-700 flex flex-col shadow-2xl backdrop-blur-xl`}
                      >
                        <div className="h-72 relative overflow-hidden border-b border-white/5">
                           {course.image ? (
                             <Image 
                                src={course.image} 
                                alt={course.title} 
                                fill
                                className="object-cover group-hover:scale-110 transition-all duration-1000 grayscale-[20%] group-hover:grayscale-0" 
                             />
                           ) : (
                             <div className={`w-full h-full bg-gradient-to-br ${themeColor === 'blue' ? 'from-blue-600/10 to-zinc-900' : 'from-emerald-600/10 to-zinc-900'} flex items-center justify-center`}>
                                <Rocket className={`w-20 h-20 text-${themeColor}-500 opacity-20`} />
                             </div>
                           )}
                           <div className="absolute top-6 right-6">
                              <span className={`px-6 py-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 text-xl font-black ${course.price === 0 ? 'text-emerald-400' : 'text-zinc-200'} shadow-2xl`}>
                                 {course.price === 0 ? "مجاني" : `${course.price} ج.م`}
                              </span>
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                           <div className="absolute bottom-6 right-8 text-white font-black text-3xl tracking-tight drop-shadow-2xl">{course.title}</div>
                        </div>

                        <div className="p-10 flex-1 flex flex-col bg-zinc-950/60">
                           <p className="text-zinc-500 text-lg font-bold leading-relaxed mb-10 line-clamp-2 min-h-[3.5rem] group-hover:text-zinc-400 transition-colors">
                            {course.description || "شرح ممتع ومبسط لكل أجزاء المنهج بأسئلة نظام جديد تغطي كافة الأفكار العليا."}
                           </p>

                           <div className="grid grid-cols-2 gap-4 mt-auto">
                              <div className="bg-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center group/stat hover:bg-white/10 transition-colors border border-white/5">
                                 <BookCheck className={`w-7 h-7 text-${themeColor}-500 mb-3`} />
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">محتوى الكورس</p>
                                 <p className="text-xl font-black text-white">{course.chapters?.length || 0} أبواب</p>
                              </div>
                              <div className="bg-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center group/stat hover:bg-white/10 transition-colors border border-white/5">
                                 <Target className={`w-7 h-7 text-${themeColor}-500 mb-3`} />
                                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center">الطلاب المسجلين</p>
                                 <p className="text-xl font-black text-white">{course.enrollments?.length + 120}+</p>
                              </div>
                           </div>

                           <div className="mt-10">
                              <Link 
                                href={`/dashboard/courses/${course.id}`} 
                                className={`w-full flex items-center justify-center gap-4 h-20 rounded-[2.5rem] font-black text-xl transition-all duration-300 shadow-2xl active:scale-95 ${
                                  themeColor === 'blue' 
                                    ? "bg-white text-black hover:bg-zinc-200 shadow-white/5" 
                                    : "bg-emerald-600 text-white shadow-emerald-500/20"
                                }`}
                              >
                                {course.price === 0 ? "افتح الكورس الآن" : "شراء الكورس والدخول"}
                                <ChevronLeft className="w-6 h-6" />
                              </Link>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-32 text-center rounded-[4rem] border border-dashed border-white/5 bg-white/5">
                    <Layout className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
                    <h3 className="text-3xl font-black text-white italic">لا توجد كورسات في هذه المادة حالياً.</h3>
                    <p className="text-zinc-600 text-xl font-bold max-w-lg mx-auto leading-relaxed mt-4">نحن نعمل بجهد لإضافة أقوى المحتويات التعليمية لهذا الباب.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
