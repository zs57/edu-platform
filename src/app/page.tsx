import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import LandingPageClient from "@/components/landing/LandingPageClient";

export default async function LandingPage() {
  const courses = await prisma.course.findMany({
    take: 6,
    include: { subject: true, chapters: { include: { lessons: true } } },
    orderBy: { createdAt: "desc" }
  });

  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const courseCount = await prisma.course.count();

  let settings: Record<string, string> = {};
  try {
    settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database', 'settings.json'), 'utf-8'));
  } catch (e) {}

  const regClosed = settings["REGISTRATION_CLOSED"] === 'true';

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none mix-blend-screen" />
      
      <LandingPageClient 
        courses={courses.map(c => ({
          ...c,
          description: c.description || "",
          image: c.image || ""
        })) as any} 
        studentCount={studentCount} 
        courseCount={courseCount} 
        regClosed={regClosed} 
      />
    </div>
  );
}
