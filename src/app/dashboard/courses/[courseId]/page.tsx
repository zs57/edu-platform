import Link from "next/link";
import { ArrowRight, PlayCircle, Lock, CheckCircle2, FileText, HelpCircle, ExternalLink, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CodeRedeemForm from "@/components/courses/CodeRedeemForm";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = await params;
  
  const course = await prisma.course.findUnique({
    where: { id: resolvedParams.courseId },
    include: {
      subject: true,
      chapters: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              attachments: true,
              quizzes: true,
            }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  let isEnrolled = false;
  const isAdmin = session?.user?.role === "ADMIN";

  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } }
    });
    if (enrollment || isAdmin) isEnrolled = true;
  }

  // Calculate progress percent
  let progressPercent = 0;
  if (isEnrolled && userId && !isAdmin) {
    const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
    if (totalLessons > 0) {
      const completedCount = await prisma.progress.count({
        where: { 
          userId, 
          lessonId: { in: course.chapters.flatMap(ch => ch.lessons.map(l => l.id)) },
          completed: true 
        }
      });
      progressPercent = Math.round((completedCount / totalLessons) * 100);
    }
  }

  // Fetch completed lesson IDs for checkmarks
  const completedLessonIds = new Set<string>();
  if (isEnrolled && userId) {
    const results = await prisma.progress.findMany({
      where: { 
        userId, 
        lessonId: { in: course.chapters.flatMap(ch => ch.lessons.map(l => l.id)) },
        completed: true 
      },
      select: { lessonId: true }
    });
    results.forEach(r => completedLessonIds.add(r.lessonId));
  }

  const isPhysics = course.subject.name.includes("فيزياء");
  const color = isPhysics ? "text-blue-400" : "text-emerald-400";
  const bg = isPhysics ? "bg-blue-600/10" : "bg-emerald-600/10";
  const border = isPhysics ? "border-blue-500/30" : "border-emerald-500/30";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative z-10" dir="rtl">
      <Link href="/dashboard/courses" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-2 transition-colors text-sm w-fit font-black group">
        <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        العودة لمكتبة المواد
      </Link>

      {/* Course Hero */}
      <div className={`panel rounded-[40px] p-8 md:p-12 relative overflow-hidden border ${border} shadow-2xl`}>
        {course.image ? (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover blur-md scale-110" />
            <div className={`absolute inset-0 bg-gradient-to-r ${isPhysics ? 'from-blue-900/90 via-zinc-950/80 to-zinc-950' : 'from-emerald-900/90 via-zinc-950/80 to-zinc-950'}`}></div>
          </div>
        ) : (
          <div className={`absolute top-[-20%] right-[-10%] w-96 h-96 ${bg} rounded-full blur-[120px] pointer-events-none opacity-40`} />
        )}
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
          <div className="flex-1 space-y-6">
            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-base font-black ${color} border border-white/10 bg-zinc-950/40 backdrop-blur-xl shadow-inner`}>
              <PlayCircle className="w-5 h-5" />
              {course.subject.name}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-zinc-400 text-xl max-w-2xl leading-relaxed font-bold opacity-80">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {isEnrolled ? (
                <>
                  <Link href={`/dashboard/courses/${course.id}/lessons/${course.chapters[0]?.lessons[0]?.id || ""}`} className="btn-primary text-xl px-12 py-5 rounded-2xl h-auto shadow-2xl shadow-blue-500/20 active-scale border-none bg-blue-600 hover:bg-blue-500">
                    ابدأ المذاكرة فوراً
                  </Link>
                  <div className="flex flex-col">
                    <span className="text-white font-black text-3xl leading-none">{progressPercent}%</span>
                    <span className="text-zinc-500 font-black text-xs uppercase tracking-widest mt-1">نسبة الإنجاز</span>
                  </div>
                </>
              ) : (
                <CodeRedeemForm courseId={course.id} price={course.price} studentId={userId || ""} />
              )}
            </div>
          </div>
          
          {isEnrolled && (
            <div className="hidden md:flex w-64 h-64 rounded-[40px] bg-zinc-950/50 border border-white/5 items-center justify-center p-8 relative shadow-2xl group">
               <div className="w-full h-full border-[8px] border-zinc-900 rounded-full flex items-center justify-center relative shadow-inner">
                 <svg className="w-full h-full absolute inset-0 -rotate-90">
                   <circle cx="50%" cy="50%" r="46%" fill="none" strokeWidth="8" stroke="currentColor" className="text-zinc-800" />
                   <circle 
                      cx="50%" cy="50%" r="46%" fill="none" stroke={isPhysics ? "#3b82f6" : "#10b981"} 
                      strokeWidth="10" strokeDasharray="290" 
                      strokeDashoffset={290 - (290 * progressPercent / 100)} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                   />
                 </svg>
                 <div className="flex flex-col items-center">
                    <div className="text-5xl font-black text-white">{progressPercent}%</div>
                    <Trophy className="w-6 h-6 text-amber-500 mt-2 opacity-30 group-hover:opacity-100 transition-opacity" />
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <div className="panel p-8 md:p-12 rounded-[40px] shadow-2xl bg-zinc-950/40 relative group">
        <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
           <h2 className="text-3xl md:text-4xl font-black text-white">فهرس المحاضرات</h2>
           <div className="flex items-center gap-2 text-zinc-500 font-black text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {course.chapters.length} فصول تعليمية
           </div>
        </div>
        
        {course.isExamOnly ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-blue-500/20 rounded-[40px] bg-blue-500/5">
            <HelpCircle className="w-20 h-20 text-blue-500/50 mx-auto mb-8 animate-pulse" />
            <h3 className="text-3xl font-black text-white mb-4">هذا الكورس عبارة عن امتحان شامل</h3>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 font-bold leading-relaxed">
              هذا المنهج مخصص لاختبار قدراتك الشاملة وتدريبك على امتحانات نهاية العام بنظام الـ MCQ الحديث.
            </p>
            {isEnrolled ? (
              course.examUrl ? (
                <a href={course.examUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 px-12 rounded-[24px] text-2xl font-black shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all group border-none">
                  ابدأ ماراثون الامتحان <ExternalLink className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </a>
              ) : (
                <div className="text-amber-500 font-black bg-amber-500/10 px-8 py-4 rounded-2xl border border-amber-500/20 inline-block shadow-inner">الامتحان قيد المراجعة النهائية سيتوفر خلال دقائق.</div>
              )
            ) : (
              <div className="text-zinc-500 font-black bg-zinc-900/80 px-10 py-5 rounded-2xl border border-white/5 inline-block">يتطلب الاشتراك لعرض محتوى الامتحان</div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {course.chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-0.5 flex-1 bg-gradient-to-l from-white/5 to-transparent"></div>
                 <h3 className="text-2xl font-black text-zinc-200 px-6 py-2 rounded-full bg-white/5 border border-white/5">
                    {chapter.title}
                 </h3>
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.lessons.map((lesson) => {
                  const isAccessible = isEnrolled; // Removed isLocked logic
                  const isCompleted = completedLessonIds.has(lesson.id);
                  const statusColor = isCompleted ? "text-emerald-500" : "text-blue-500";
                  
                  return (
                    <Link
                      key={lesson.id}
                      href={!isAccessible ? "#" : `/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                      className={`block p-6 rounded-[32px] transition-all border group relative ${
                        !isAccessible 
                          ? "opacity-50 grayscale border-white/5 cursor-not-allowed bg-zinc-950/20" 
                          : "hover:border-blue-500/40 hover:bg-white/[0.04] bg-white/[0.02] border-white/5 shadow-lg shadow-black/20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                          !isAccessible 
                            ? "bg-zinc-900 border-white/5 text-zinc-700" 
                            : isCompleted 
                               ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 ring-4 ring-emerald-500/5" 
                               : "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                        }`}>
                           {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <PlayCircle className="w-7 h-7" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white text-xl mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">{lesson.title}</h4>
                          <div className="flex flex-wrap gap-2">
                             {lesson.videoUrl && <span className="text-[10px] font-black uppercase tracking-tighter bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md border border-red-500/10">Video</span>}
                             {lesson.content && <span className="text-[10px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/10">PDF</span>}
                             {lesson.quizzes.length > 0 && <span className="text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/10">Quiz</span>}
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center rotate-180">
                              <ArrowRight className="w-4 h-4" />
                           </div>
                        </div>
                      </div>
                      {!isAccessible && (
                        <div className="flex items-center justify-center gap-2 mt-4 py-2 rounded-xl bg-black/40 border border-white/5">
                           <Lock className="w-4 h-4 text-zinc-600" />
                           <span className="text-xs font-black text-zinc-600">اشترك أولاً لفتح المحتوى</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
              
              {chapter.examUrl && isEnrolled && (
                <a href={chapter.examUrl} target="_blank" className="block p-6 mt-4 rounded-3xl transition-all border-2 border-dashed border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 bg-blue-500/[0.02] group shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[20px] bg-blue-500/20 flex flex-col items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-inner">
                      <HelpCircle className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-blue-300 text-2xl mb-1">الامتحان الشامل للباب</h4>
                      <p className="text-sm text-blue-400/60 font-black">اختبر مستواك الحقيقي في هذا الفصل فوراً.</p>
                    </div>
                    <ExternalLink className="w-8 h-8 text-blue-500 opacity-20 group-hover:opacity-100 transition-opacity ml-4" />
                  </div>
                </a>
              )}
            </div>
          ))}

          {course.chapters.length === 0 && (
            <div className="p-20 text-center text-zinc-600 font-black text-2xl border-2 border-dashed border-white/5 rounded-[40px]">المحتوى العلمي للكورس قيد التحضير.. خليك متابع! ⏳</div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
