import { prisma } from "@/lib/prisma";
import { Trophy, Star, Shield, ArrowUp, Crown } from "lucide-react";
import Image from "next/image";

export default async function LeaderboardPage() {
  // Fetch all students and their quiz results and progress
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      quizResults: true,
      progress: true,
    }
  });

  // Calculate points: 10 points per completed lesson, plus quiz score / 10
  const studentsWithPoints = users.map(user => {
    let points = 0;
    user.progress.forEach(p => {
      if (p.completed) points += 10;
    });
    user.quizResults.forEach(q => {
      points += Math.round(q.score / 2); // 50 points for 100% quiz
    });

    return { ...user, points };
  }).sort((a, b) => b.points - a.points); // Sort Descending

  const top3 = studentsWithPoints.slice(0, 3);
  const others = studentsWithPoints.slice(3, 10);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/20 blur-[100px] pointer-events-none mix-blend-screen" />
        <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">لوحة الشرف للأبطال</h1>
        <p className="text-zinc-400 text-lg">أوائل المنصة اللي بيتعبوا وبينافسوا عشان يوصلوا لحلمهم.</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16 mt-20 px-4 h-80">
        
        {/* Second Place */}
        {top3[1] && (
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="absolute -inset-1 bg-zinc-600 rounded-full blur opacity-25" />
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-zinc-600 flex items-center justify-center text-2xl font-black text-zinc-400 relative z-10 shadow-xl">
                 {top3[1].name?.[0]}
              </div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900 z-20">2</div>
            </div>
            <p className="font-bold text-white text-lg mb-1">{top3[1].name}</p>
            <p className="text-amber-400 text-sm font-black mb-4">{top3[1].points} نقطة</p>
            <div className="w-full h-32 bg-gradient-to-t from-zinc-800 to-zinc-800/50 rounded-t-2xl border-t-2 border-x-2 border-zinc-700/50 relative overflow-hidden flex items-end justify-center pb-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
          </div>
        )}

        {/* First Place */}
        {top3[0] && (
          <div className="w-full md:w-1/3 flex flex-col items-center z-10 -mt-12">
            <div className="relative mb-4 group">
              <Crown className="w-10 h-10 text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <div className="absolute -inset-1 bg-amber-500 rounded-full blur opacity-40 animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-zinc-900 border-4 border-amber-400 flex items-center justify-center text-3xl font-black text-amber-400 relative z-10 shadow-2xl overflow-hidden">
                 {top3[0].name?.[0]}
                 <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900 z-20 shadow-lg">1</div>
            </div>
            <p className="font-bold text-white text-xl mb-1">{top3[0].name}</p>
            <p className="text-amber-400 text-sm font-black mb-4">{top3[0].points} نقطة</p>
            <div className="w-full h-40 bg-gradient-to-t from-amber-900/40 to-amber-900/10 rounded-t-2xl border-t-2 border-x-2 border-amber-500/50 relative overflow-hidden flex items-end justify-center pb-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-amber-500/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Third Place */}
        {top3[2] && (
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="absolute -inset-1 bg-amber-700/50 rounded-full blur opacity-30" />
              <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-amber-700/80 flex items-center justify-center text-2xl font-black text-amber-700/80 relative z-10 shadow-xl">
                 {top3[2].name?.[0]}
              </div>
              <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-white font-bold text-sm border-2 border-zinc-900 z-20">3</div>
            </div>
            <p className="font-bold text-white text-lg mb-1">{top3[2].name}</p>
            <p className="text-amber-400 text-sm font-black mb-4">{top3[2].points} نقطة</p>
            <div className="w-full h-24 bg-gradient-to-t from-amber-900/20 to-transparent rounded-t-2xl border-t-2 border-x-2 border-amber-700/30 relative overflow-hidden flex items-end justify-center pb-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
          </div>
        )}
      </div>

      {/* The Rest of the Leaderboard */}
      <div className="panel overflow-hidden border-white/5 bg-zinc-950/50">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            فرسان المنصة
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {others.length > 0 ? others.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center text-zinc-500 font-bold">#{index + 4}</span>
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-white/10">
                  {student.name?.[0] || 'T'}
                </div>
                <div>
                  <p className="font-bold text-zinc-200">{student.name}</p>
                  <p className="text-xs text-zinc-500">ميزة ألفا الفعالة</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ArrowUp className="w-4 h-4 text-emerald-400" />
                <span className="text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-sm outline outline-1 outline-amber-500/20">{student.points} نقطة</span>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-zinc-500 font-bold">
              مفيش طلاب تانيين في اللوحة لسة. شدوا حيلكم ونافسوا الأوائل!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
