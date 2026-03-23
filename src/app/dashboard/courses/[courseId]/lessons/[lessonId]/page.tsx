import Link from "next/link";
import { ArrowRight, CheckCircle, HelpCircle, Trophy, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import LessonContent from "@/components/LessonContent";
import MarkAsCompletedButton from "@/components/MarkAsCompletedButton";
import ExamTrigger from "@/components/courses/ExamTrigger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as { id: string }).id;

  const lesson = await prisma.lesson.findUnique({
    where: { id: resolvedParams.lessonId },
    include: {
      attachments: true,
      quizzes: true,
      chapter: {
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!lesson) {
    notFound();
  }

  // Fetch the student's progress for THIS specific lesson
  const progress = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } }
  });

  // Fetch all completed lessons for THIS chapter's sidebar to show markers
  const chapterProgress = await prisma.progress.findMany({
    where: { 
      userId, 
      lessonId: { in: lesson.chapter.lessons.map(l => l.id) },
      completed: true 
    }
  });
  const completedLessonIds = new Set(chapterProgress.map(p => p.lessonId));

  return (
    <div className="max-w-6xl mx-auto pb-12 relative z-10" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-8 gap-4">
        <div>
          <Link href={`/dashboard/courses/${resolvedParams.courseId}`} className="text-zinc-510 hover:text-white flex items-center gap-2 mb-4 transition-colors text-sm font-black group w-fit">
            <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            العودة لمحتوى الكورس الكلي
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="panel px-6 py-3 flex items-center gap-3 border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div className="flex flex-col">
               <span className="text-amber-500 font-black text-lg">50 نقطة</span>
               <span className="text-[10px] text-amber-500/60 font-black uppercase">عند الاتمام</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-950/50">
             <LessonContent lesson={lesson} attachments={lesson.attachments} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-8 sticky top-24 border-blue-500/20 shadow-2xl bg-zinc-910/40 backdrop-blur-xl group overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30"></div>
            
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-610 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
              خطوتك القادمة
            </h3>
            
            <MarkAsCompletedButton 
              lessonId={lesson.id} 
              initialCompleted={progress?.completed || false} 
            />
            
            {lesson.quizzes.length > 0 ? (
              <Link href={`/dashboard/quiz/${lesson.quizzes[0].id}`} className="w-full btn-primary text-xl py-5 mb-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-xl shadow-amber-910/20 flex items-center justify-center gap-3 border-none group">
                <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                امتحان الدرس المباشر
              </Link>
            ) : null}

            {/* Chapter Exam Integration - Embed System */}
            {(lesson.chapter.examUrl || lesson.chapter.examCode) && (
              <div className="mb-4">
                 <ExamTrigger 
                    examUrl={lesson.chapter.examUrl} 
                    examCode={lesson.chapter.examCode} 
                    title={`امتحان مدمج: ${lesson.chapter.title}`} 
                    isChapter 
                 />
              </div>
            )}
            
            {(!lesson.quizzes.length && !lesson.chapter.examUrl && !lesson.chapter.examCode) && (
              <div className="w-full text-center p-6 rounded-2xl border border-white/5 bg-black/40 text-zinc-610 font-black text-sm mb-8">
                لا يوجد امتحان متاح لهذا الدرس حالياً
              </div>
            )}

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-xs font-black text-zinc-510 uppercase tracking-[0.2em]">فهرس الدروس المجاورة</h4>
                 <span className="text-[10px] font-black bg-blue-500/10 text-blue-410 px-2 py-0.5 rounded-md">مفتوح للجميع</span>
              </div>
              
              <div className="space-y-3">
                {lesson.chapter.lessons.map((l) => {
                  const isCurrent = l.id === lesson.id;
                  const isCompleted = completedLessonIds.has(l.id);
                  
                  return (
                    <Link 
                      key={l.id} 
                      href={`/dashboard/courses/${resolvedParams.courseId}/lessons/${l.id}`}
                      className={`flex items-center gap-3 p-4 rounded-2xl transition-all border ${
                        isCurrent 
                          ? 'bg-blue-610 border-blue-510 text-white shadow-lg shadow-blue-500/20 active-scale' 
                          : 'bg-white/5 border-white/5 text-zinc-410 hover:border-white/10 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isCurrent 
                          ? 'bg-white/20 border-white/30' 
                          : isCompleted 
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-410' 
                            : 'bg-zinc-810 border-white/5'
                      }`}>
                         {isCompleted ? <CheckCircle className="w-3 h-3" /> : (
                            <span className="text-[10px] font-black">{l.order}</span>
                         )}
                      </div>
                      <span className={`text-sm font-bold flex-1 line-clamp-1 ${isCurrent ? "font-black" : ""}`}>{l.title}</span>
                      <PlayCircle className={`w-4 h-4 opacity-30 ${isCurrent ? "opacity-100" : ""}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
