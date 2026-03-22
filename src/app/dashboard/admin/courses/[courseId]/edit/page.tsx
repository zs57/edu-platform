import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseEditClient from "@/components/admin/CourseEditClient";

export default async function CourseEditPage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

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
              attachments: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const subjects = await prisma.subject.findMany();

  const formattedCourse = {
    ...course,
    description: course.description || "",
    image: course.image || "",
    gradeLevel: course.gradeLevel || "غير محدد",
    examUrl: course.examUrl || "",
    chapters: course.chapters.map(ch => ({
      ...ch,
      examUrl: ch.examUrl || "",
      lessons: ch.lessons.map(l => ({
        ...l,
        description: l.description || "",
        videoUrl: l.videoUrl || "",
        content: l.content || "",
      }))
    }))
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50 font-sans selection:bg-blue-500/30 p-8">
      <CourseEditClient course={formattedCourse as any} existingSubjects={subjects} />
    </div>
  );
}
