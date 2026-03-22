import Link from "next/link";
import { ArrowRight, PlayCircle, Lock, CheckCircle2, FileText, HelpCircle, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { use } from "react";
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

  const isPhysics = course.subject.name.includes("فيزياء");
  const color = isPhysics ? "text-blue-400" : "text-emerald-400";
  const bg = isPhysics ? "bg-blue-600/10" : "bg-emerald-600/10";
  const border = isPhysics ? "border-blue-500/30" : "border-emerald-500/30";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Link href="/dashboard/courses" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-2 transition-colors text-sm w-fit font-medium">
        <ArrowRight className="w-4 h-4" />
        العودة للمواد
      </Link>

      {/* Course Hero */}
      <div className={`panel rounded-3xl p-8 md:p-10 relative overflow-hidden border ${border}`}>
        {course.image ? (
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img src={course.image} alt={course.title} className="w-full h-full object-cover blur-sm mix-blend-screen" />
            <div className={`absolute inset-0 bg-gradient-to-r ${isPhysics ? 'from-blue-900/80 to-zinc-950' : 'from-emerald-900/80 to-zinc-950'}`}></div>
          </div>
        ) : (
          <div className={`absolute top-[-20%] right-[-10%] w-96 h-96 ${bg} rounded-full blur-[100px] pointer-events-none mix-blend-screen`} />
        )}
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
          <div className="flex-1">
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${color} border border-white/10 w-fit mb-4 bg-zinc-950/50 backdrop-blur-md`}>
              {course.subject.name}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex items-center gap-6 mt-8">
              {isEnrolled ? (
                <>
                  <button className="btn-primary py-3 px-8 text-lg h-14 shadow-blue-500/20">
                    كمل مذاكرة
                  </button>
                  <div className="text-sm text-zinc-500 font-medium">
                    <span className="text-white font-black block text-xl">0%</span>
                    مكتمل
                  </div>
                </>
              ) : (
                <CodeRedeemForm courseId={course.id} price={course.price} studentId={userId || ""} />
              )}
            </div>
          </div>
          
          {isEnrolled && (
            <div className="w-full md:w-64 aspect-square rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center p-6 relative shadow-2xl">
               <div className="w-full h-full border-[6px] border-zinc-800 rounded-full flex items-center justify-center relative">
                 <svg className="w-full h-full absolute inset-0 -rotate-90">
                   <circle cx="50%" cy="50%" r="47%" fill="none" stroke={isPhysics ? "#3b82f6" : "#10b981"} strokeWidth="10" strokeDasharray="300" strokeDashoffset="165" strokeLinecap="round" />
                 </svg>
                 <div className="text-4xl font-black text-white">0%</div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Syllabus / Exam Action */}
      <div className="panel p-6 md:p-10 rounded-3xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-8 border-b border-white/10 pb-4">محتوى الكورس</h2>
        
        {course.isExamOnly ? (
          <div className="text-center py-12 px-4 border border-blue-500/20 rounded-2xl bg-blue-500/5">
            <HelpCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-4">هذا الكورس عبارة عن امتحان شامل</h3>
            <p className="text-zinc-400 text-lg max-w-lg mx-auto mb-8">
              لا توجد دروس أو ملفات شرح هنا. هذا المنهج مخصص لاختبار قدراتك الشاملة وتدريبك على امتحانات نهاية العام.
            </p>
            {isEnrolled ? (
              course.examUrl ? (
                <a href={course.examUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 btn-primary py-4 px-10 text-xl font-black shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                  بدء الامتحان الآن <ExternalLink className="w-5 h-5" />
                </a>
              ) : (
                <p className="text-amber-400 font-bold bg-amber-500/10 px-6 py-3 rounded-xl border border-amber-500/20 inline-block">رابط الامتحان غير متوفر حالياً. تواصل مع الدعم المتاح.</p>
              )
            ) : (
              <p className="text-zinc-500 font-bold bg-zinc-900 px-6 py-3 rounded-xl border border-white/5 inline-block">يجب الاشتراك أولاً لفتح الامتحان</p>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {course.examUrl && isEnrolled && (
              <div className="p-6 bg-gradient-to-r from-blue-600/20 to-zinc-950 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">الامتحان الشامل للكورس</h3>
                    <p className="text-sm text-zinc-400 font-bold mt-1">اختبر نفسك وتأكد من فهمك للمنهج بالكامل.</p>
                  </div>
                </div>
                <a href={course.examUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                  ابدأ الامتحان <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
            
            {course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <h3 className="text-xl font-bold text-zinc-300 mb-5 pb-2 border-b border-white/5 relative inline-block">
                {chapter.title}
                <div className="absolute bottom-[-1px] right-0 w-1/3 h-[2px] bg-blue-500/50"></div>
              </h3>

              <div className="space-y-4">
                {chapter.lessons.length === 0 && (
                  <p className="text-zinc-500 text-sm">مفيش دروس نزلت للباب ده لسة.</p>
                )}
                
                {chapter.lessons.map((lesson, idx: number) => {
                  const isAccessible = isEnrolled && (!lesson.isLocked || idx === 0);
                  const Icon = !isAccessible ? Lock : (idx === 0 ? CheckCircle2 : PlayCircle);
                  const iconColor = !isAccessible ? "text-zinc-600" : (idx === 0 ? "text-emerald-500" : "text-blue-400");
                  const boxClass = !isAccessible ? "opacity-60 cursor-not-allowed border-white/5" : "hover:border-blue-500/30 hover:bg-white/[0.02] border-white/10";
                  
                  return (
                    <Link
                      key={lesson.id}
                      href={!isAccessible ? "#" : `/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                      className={`block panel p-5 rounded-2xl transition-all border ${boxClass}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-5 w-full">
                          <Icon className={`w-7 h-7 mt-1 shrink-0 ${iconColor}`} />
                          <div className="w-full">
                            <h4 className="font-bold text-white text-lg mb-1">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-sm text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-zinc-500 font-bold mt-2">
                              {isAccessible && (
                                <>
                                  {lesson.videoUrl && (
                                    <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20"><PlayCircle className="w-4 h-4" /> فيديو شرح</span>
                                  )}
                                  {lesson.content && (
                                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"><FileText className="w-4 h-4" /> ملف PDF</span>
                                  )}
                                  {lesson.attachments.length > 0 && (
                                     <span className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1 rounded-lg"><FileText className="w-4 h-4" /> {lesson.attachments.length} ملحقات</span>
                                  )}
                                  {lesson.quizzes.length > 0 && (
                                     <span className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20"><HelpCircle className="w-4 h-4" /> امتحان الدرس</span>
                                  )}
                                </>
                              )}
                              {!isAccessible && (
                                <span className="flex items-center gap-1.5 text-zinc-600 bg-zinc-900 px-3 py-1 rounded-lg">
                                  {!isEnrolled ? "الكورس غير مفعل لك، أدخل الكود بالأعلى" : "هيفتح لما تخلص اللي قبله"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {chapter.examUrl && isEnrolled && (
                <a
                  href={chapter.examUrl}
                  target="_blank"
                  className="block p-5 mt-4 rounded-2xl transition-all border hover:border-blue-500/50 hover:bg-blue-500/5 border-blue-500/20 bg-blue-500/10 group shadow-[0_4px_20px_rgba(59,130,246,0.1)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-500/30 transition-colors border border-blue-500/30">
                      <HelpCircle className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-300 text-lg flex flex-wrap items-center gap-2">
                        الامتحان الشامل للفصل
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1"><ExternalLink className="w-3 h-3" /> رابط خارجي</span>
                      </h4>
                      <p className="text-sm text-blue-400/80 font-bold mt-1">
                        تأكد من إتقانك للدروس السابقة واختبر نفسك الآن.
                      </p>
                    </div>
                    <div className="hidden sm:flex text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                  </div>
                </a>
              )}
            </div>
          ))}

          {course.chapters.length === 0 && (
            <div className="p-8 text-center text-zinc-500 font-bold">محتوى الكورس هيتم الإعلان عنه قريباً!</div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
