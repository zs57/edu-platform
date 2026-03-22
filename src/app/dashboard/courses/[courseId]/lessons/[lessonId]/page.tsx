import Link from "next/link";
import { ArrowRight, CheckCircle, HelpCircle, Trophy, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LessonContent from "@/components/LessonContent";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const resolvedParams = await params;
  
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

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div>
          <Link href={`/dashboard/courses/${resolvedParams.courseId}`} className="text-zinc-400 hover:text-white flex items-center gap-2 mb-3 transition-colors text-sm font-bold">
            <ArrowRight className="w-4 h-4" />
            العودة للكورس
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {lesson.title}
          </h1>
        </div>
        <div className="panel px-5 py-2.5 flex items-center gap-2 border-amber-500/30 bg-amber-500/5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-black">50 نقطة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LessonContent lesson={lesson} attachments={lesson.attachments} />
        </div>

        <div className="space-y-6">
          <div className="panel p-6 sticky top-24 border-blue-500/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              خطوتك الجاية
            </h3>
            
            <button className="w-full text-lg font-bold py-4 rounded-xl mb-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              تمت المذاكرة
            </button>
            
            {lesson.quizzes.length > 0 ? (
              <Link href={`/dashboard/quiz/${lesson.quizzes[0].id}`} className="w-full btn-primary text-lg py-4 mb-8 bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 flex items-center justify-center gap-2">
                <HelpCircle className="w-5 h-5" />
                امتحان الدرس
              </Link>
            ) : (
              <div className="w-full text-center p-4 rounded-xl border border-white/10 text-zinc-500 font-bold mb-8">
                مفيش امتحان للدرس ده
              </div>
            )}

            <div className="pt-6 border-t border-white/10">
              <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider">باقي دروس الوحدة</h4>
              <div className="space-y-2">
                {lesson.chapter.lessons.map((l) => (
                  <Link 
                    key={l.id} 
                    href={l.isLocked ? "#" : `/dashboard/courses/${resolvedParams.courseId}/lessons/${l.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      l.id === lesson.id 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold' 
                        : l.isLocked 
                          ? 'text-zinc-600 cursor-not-allowed bg-zinc-950/50' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {l.isLocked ? <Lock className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${l.id === lesson.id ? 'bg-blue-400' : 'bg-zinc-600'}`} />}
                    <span className="text-sm line-clamp-1">{l.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
