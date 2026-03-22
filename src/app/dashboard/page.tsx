import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Trophy, ShieldCheck, Star, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Fetch real user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      progress: {
        include: { lesson: { include: { chapter: { include: { course: true } } } } }
      },
      quizResults: true,
      enrollments: {
        include: { course: true },
        take: 2,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  const completedLessons = user.progress.filter(p => p.completed).length;
  const passedQuizzes = user.quizResults.filter(q => q.passed).length;
  
  // Calculate Points (10 per lesson, plus quiz scores)
  let points = completedLessons * 10;
  user.quizResults.forEach(q => points += Math.round(q.score / 2));

  // Determine global rank just by counting users with more points (requires a bigger query, but for now we aggregate dynamically)
  const allUsers = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { progress: true, quizResults: true }
  });
  
  const userPoints = allUsers.map(u => {
    let p = u.progress.filter(x => x.completed).length * 10;
    u.quizResults.forEach(q => p += Math.round(q.score / 2));
    return { id: u.id, points: p };
  });
  
  userPoints.sort((a, b) => b.points - a.points);
  const rank = userPoints.findIndex(u => u.id === user.id) + 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="panel p-8 md:p-10 border-blue-500/20 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none mix-blend-screen" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            أهلاً بيك يا <span className="text-blue-400">{user.name?.split(' ')[0] || "بطل"}</span>!
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            جاهز تكمل مشوارك للقمة؟ استمر في المذاكرة وحل الامتحانات عشان تحافظ على ترتيبك في لوحة الشرف.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="panel p-6 border-white/5 hover:border-emerald-500/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-500 mb-1">الدروس المكتملة</p>
          <p className="text-3xl font-black text-white">{completedLessons}</p>
        </div>
        
        <div className="panel p-6 border-white/5 hover:border-amber-500/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-500 mb-1">النقاط</p>
          <p className="text-3xl font-black text-white">{points}</p>
        </div>

        <div className="panel p-6 border-white/5 hover:border-blue-500/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-500 mb-1">الاختبارات المجتازة</p>
          <p className="text-3xl font-black text-white">{passedQuizzes}</p>
        </div>

        <div className="panel p-6 border-white/5 hover:border-purple-500/20 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-500 mb-1">الترتيب العام</p>
          <p className="text-3xl font-black text-white">#{rank > 0 ? rank : "-"}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pt-4">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            استكمل التعلم
          </h2>
          
          <div className="space-y-4">
            {user.enrollments.length === 0 ? (
              <div className="panel p-8 text-center text-zinc-500 font-bold border-white/5">
                لم تشترك في أي كورس حتى الآن. 
                <Link href="/dashboard/courses" className="text-blue-400 underline block mt-2">تصفح الكورسات المتاحة</Link>
              </div>
            ) : (
              user.enrollments.map(enroll => (
                <div key={enroll.courseId} className="panel p-6 flex flex-col md:flex-row gap-6 border-white/5 hover:border-blue-500/30 transition-colors group">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-400 mb-1">{enroll.course.title}</p>
                    <h3 className="text-xl font-bold text-white mb-2">{enroll.course.description?.split(' ')[0] || "كورس"}...</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{enroll.course.description}</p>
                    <Link href={`/dashboard/courses/${enroll.courseId}`} className="text-blue-400 font-bold text-sm bg-white/5 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                      دخول الكورس
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            تحليل المستوى
          </h2>
          
          <div className="panel p-6 border-white/5">
            <h3 className="text-sm font-bold text-zinc-400 mb-4 tracking-wider uppercase">نقاط الضعف المقترحة</h3>
            <div className="space-y-4">
              {user.quizResults.length === 0 ? (
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm font-bold leading-relaxed">لم تقم بإجراء امتحانات كافية ليقوم النظام بتحليل مستواك وتحديد نقاط ضعفك.</p>
                </div>
              ) : (
                user.quizResults.slice(0, 3).map((result, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="font-bold text-zinc-300">امتحان وتطبيق</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${result.score < 50 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : result.score < 80 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {result.score < 50 ? 'تحتاج مراحعة' : result.score < 80 ? 'متوسط' : 'ممتاز'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
