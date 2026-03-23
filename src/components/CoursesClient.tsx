"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Zap, Layout, 
  GraduationCap, ChevronLeft, Calendar, BookCheck, Sparkles, 
  Globe, Rocket, Target, ShieldCheck
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  image?: string | null;
  description?: string | null;
  gradeLevel?: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  gradeLevel: string | null;
  subject: Subject;
  enrollments: { id: string }[];
  chapters: { lessons: { id: string }[] }[];
}

export default function CoursesClient({ initialCourses, initialSubjects }: { initialCourses: Course[], initialSubjects: Subject[] }) {
  const [step, setStep] = useState<"grade" | "subject" | "courses">("grade");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const GRADES_MAP = {
    "الأول الثانوي": ["أول", "1", "الاول"],
    "الثاني الثانوي": ["ثان", "2", "الثاني"],
    "الثالث الثانوي": ["ثالث", "3", "الثالث"]
  } as const;

  // Function to normalize grade strings from DB - Very forgiving
  const normalizeGrade = (grade: string | null): string | null => {
    if (!grade) return null;
    const g = grade.toLowerCase();
    if (g.includes("أول") || g.includes("1") || g.includes("اول")) return "الأول الثانوي";
    if (g.includes("ثان") || g.includes("2") || g.includes("ثاني")) return "الثاني الثانوي";
    if (g.includes("ثالث") || g.includes("3") || g.includes("الثالث")) return "الثالث الثانوي";
    return null;
  };

  const grades = Object.keys(GRADES_MAP);

  // Filter subjects based on selected grade
  const availableSubjects = useMemo(() => {
    if (!selectedGrade) return [];
    
    const subjectsMap = new Map<string, Subject>();
    
    // 1. Check all subjects directly
    initialSubjects.forEach(subject => {
      const subjectGrade = normalizeGrade(subject.gradeLevel || "");
      if (subjectGrade === selectedGrade) {
        subjectsMap.set(subject.id, subject);
      }
    });

    // 2. Check courses (support legacy data where grade is on course only)
    initialCourses.forEach(course => {
      const courseGrade = normalizeGrade(course.gradeLevel);
      if (courseGrade === selectedGrade && course.subject) {
        if (!subjectsMap.has(course.subject.id)) {
          subjectsMap.set(course.subject.id, course.subject);
        }
      }
    });

    return Array.from(subjectsMap.values());
  }, [selectedGrade, initialCourses, initialSubjects]);

  // Filter courses based on selected grade and subject
  const filteredCourses = useMemo(() => {
    if (!selectedGrade || !selectedSubjectId) return [];
    return initialCourses.filter(c => {
      const courseGrade = normalizeGrade(c.gradeLevel);
      const subjectGrade = normalizeGrade(c.subject?.gradeLevel || "");
      // Show course if it matches grade OR if its subject matches grade
      return (courseGrade === selectedGrade || subjectGrade === selectedGrade) && c.subject?.id === selectedSubjectId;
    });
  }, [selectedGrade, selectedSubjectId, initialCourses]);

  const selectedSubject = availableSubjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10" dir="rtl">
      {/* Optimized Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/5 text-zinc-500 text-xs font-black uppercase">
            <Sparkles className="w-4 h-4 text-blue-500" /> اختار طريقك للتميز
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight">
            {step === "grade" && "اختار سنتك الدراسية"}
            {step === "subject" && `مواد ${selectedGrade}`}
            {step === "courses" && `كورسات ${selectedSubject?.name}`}
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-bold max-w-2xl leading-relaxed">
            {step === "grade" && "حدد السنة الدراسية اللي بتدرس فيها عشان نظهرلك المواد المتاحة ليك."}
            {step === "subject" && `أهلاً بك في ${selectedGrade}. اختار المادة اللي حابب تبدأ فيها.`}
            {step === "courses" && `مستعد؟ دي قائمة بأقوى الكورسات المتاحة في ${selectedSubject?.name}.`}
          </p>
        </div>

        {/* Step Flow */}
        <div className="transition-all duration-300">
          {step === "grade" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => { setSelectedGrade(grade); setStep("subject"); }}
                  className="group relative h-80 rounded-3xl bg-zinc-900/50 border border-white/5 p-10 text-right overflow-hidden shadow-xl hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="relative z-10 space-y-6 h-full flex flex-col justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-white">{grade}</h3>
                       <p className="text-zinc-500 text-sm font-bold mt-2">استكشف جميع المواد والكورسات المتاحة.</p>
                    </div>
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest mt-4">
                      استكشاف المواد <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none">
                     <Zap className="w-32 h-32 text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "subject" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <button 
                onClick={() => setStep("grade")}
                className="flex items-center gap-2 text-zinc-500 hover:text-white font-black transition-colors px-4 py-2 rounded-xl bg-white/5 border border-white/5 group"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" /> العودة لاختيار السنة
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => { setSelectedSubjectId(subject.id); setStep("courses"); }}
                      className="group relative flex flex-col md:flex-row rounded-3xl bg-zinc-900/50 border border-white/5 overflow-hidden shadow-xl hover:border-emerald-500/30 transition-all duration-300 md:h-72"
                    >
                      {subject.image && (
                        <div className="w-full md:w-1/3 relative overflow-hidden h-40 md:h-full">
                           <Image 
                              src={subject.image} 
                              alt={subject.name} 
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700" 
                           />
                        </div>
                      )}
                      <div className={`p-8 flex-1 flex flex-col justify-center text-right ${!subject.image ? 'md:w-full' : ''}`}>
                         <div className="inline-flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-2">
                            <Globe className="w-3 h-3" /> مادة مسجلة في إتقان
                         </div>
                         <h3 className="text-3xl font-black text-white">{subject.name}</h3>
                         <p className="text-zinc-500 font-bold mt-2 text-sm line-clamp-2">{subject.description || "استعد لتجربة تعليمية مختلفة تغطي كافة تفاصيل المنهج."}</p>
                         <div className="mt-6 flex items-center justify-end gap-2 text-white font-black text-xs uppercase">
                            عرض الكورسات <ChevronLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                         </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <ShieldCheck className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white italic">لا توجد مواد متاحة لهذا العام حالياً.</h3>
                    <p className="text-zinc-600 font-bold max-w-md mx-auto mt-2 text-sm">سيتم إضافة المواد والكورسات الخاصة بهذا العام الدراسي قريباً جداً.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "courses" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setStep("grade")}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white font-black transition-colors px-4 py-2 rounded-xl bg-white/5 border border-white/5"
                >
                  <Calendar className="w-4 h-4" /> {selectedGrade}
                </button>
                <button 
                  onClick={() => setStep("subject")}
                  className="flex items-center gap-2 text-zinc-500 hover:text-white font-black transition-colors px-4 py-2 rounded-xl bg-white/5 border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" /> {selectedSubject?.name}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const themeColor = course.subject.name.includes("فيزياء") ? "blue" : "emerald";

                    return (
                      <div key={course.id} className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-colors flex flex-col shadow-xl">
                        <div className="h-64 relative overflow-hidden border-b border-white/5">
                           {course.image ? (
                             <Image 
                                src={course.image} 
                                alt={course.title} 
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700" 
                             />
                           ) : (
                             <div className={`w-full h-full bg-gradient-to-br ${themeColor === 'blue' ? 'from-blue-600/10 to-zinc-900' : 'from-emerald-600/10 to-zinc-900'} flex items-center justify-center`}>
                                <Rocket className="w-16 h-16 text-white opacity-10" />
                             </div>
                           )}
                           <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 rounded-xl border border-white/5 font-black text-lg">
                              {course.price === 0 ? "مجاني" : `${course.price} ج.م`}
                           </div>
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                           <div className="absolute bottom-4 right-6 text-white font-black text-2xl tracking-tight">{course.title}</div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                           <p className="text-zinc-500 text-sm font-bold leading-relaxed mb-6 line-clamp-2">
                             {course.description || "شرح ممتع ومبسط لكل أجزاء المنهج بأسئلة نظام جديد تغطي كافة الأفكار العليا."}
                           </p>

                           <div className="grid grid-cols-2 gap-3 mt-auto mb-6">
                              <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                 <BookCheck className={`w-5 h-5 text-${themeColor}-500 mb-1`} />
                                 <p className="text-[10px] font-black text-zinc-600 uppercase">المحتوى</p>
                                 <p className="text-lg font-black text-white">{course.chapters?.length || 0} أبواب</p>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                 <Target className={`w-5 h-5 text-${themeColor}-500 mb-1`} />
                                 <p className="text-[10px] font-black text-zinc-600 uppercase">المشتركين</p>
                                 <p className="text-lg font-black text-white">{course.enrollments?.length + 120}+</p>
                              </div>
                           </div>

                           <Link 
                             href={`/dashboard/courses/${course.id}`} 
                             className={`w-full h-16 rounded-2xl font-black text-lg transition-colors flex items-center justify-center gap-2 ${
                               themeColor === 'blue' 
                                 ? "bg-white text-black hover:bg-zinc-200" 
                                 : "bg-emerald-600 text-white hover:bg-emerald-500"
                             }`}
                           >
                             {course.price === 0 ? "افتح الآن" : "دخول الكورس"}
                             <ChevronLeft className="w-5 h-5" />
                           </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <Layout className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white italic">لا توجد كورسات متاحة حالياً.</h3>
                    <p className="text-zinc-600 font-bold max-w-md mx-auto mt-2 text-sm">نعمل حالياً على إضافة المحتوى التعليمي لهذه المادة.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
