"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("غير مصرح لك بالقيام بهذا الإجراء.");
  }
  return session;
}

export interface LessonData {
  title: string;
  description?: string;
  videoUrl?: string;
  content?: string;
  attachments?: { title: string; fileUrl: string; type: string }[];
}

export interface ChapterData {
  title: string;
  examUrl?: string;
  examCode?: string;
  lessons: LessonData[];
}

export interface CourseCurriculumData {
  subjectName: string;
  title: string;
  description?: string;
  price: string | number;
  imageUrl?: string;
  examUrl?: string;
  examCode?: string;
  isExamOnly?: boolean;
  gradeLevel?: string;
  chapters: ChapterData[];
}

export async function createCourseWithCurriculum(data: CourseCurriculumData) {
  try {
    await checkAdmin();
    // 1. Ensure Subject exists
    let subject = await prisma.subject.findFirst({ where: { name: data.subjectName } });
    if (!subject) {
      subject = await prisma.subject.create({ data: { name: data.subjectName, description: "تم إنشاؤه تلقائياً" } });
    }

    // 2. Create Course
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description || null,
        price: parseFloat(data.price.toString()) || 0,
        image: data.imageUrl || null,
        examUrl: data.examUrl || null,
        examCode: data.examCode || null,
        isExamOnly: data.isExamOnly || false,
        gradeLevel: data.gradeLevel || null,
        subjectId: subject.id
      }
    });

    // 3. Create Chapters and Lessons
    for (const [cIndex, chapterData] of data.chapters.entries()) {
      const chapter = await prisma.chapter.create({
        data: {
          title: chapterData.title,
          examUrl: chapterData.examUrl || null,
          examCode: chapterData.examCode || null,
          order: cIndex + 1,
          courseId: course.id
        }
      });

      for (const [lIndex, lessonData] of chapterData.lessons.entries()) {
        await prisma.lesson.create({
          data: {
            title: lessonData.title,
            description: lessonData.description || null,
            videoUrl: lessonData.videoUrl || null,
            content: lessonData.content || null,
            order: lIndex + 1,
            isLocked: false,
            chapterId: chapter.id,
            attachments: (lessonData.attachments && lessonData.attachments.length > 0) ? {
              create: lessonData.attachments.map((a: { title: string; fileUrl: string; type: string }) => ({
                title: a.title,
                fileUrl: a.fileUrl,
                type: "ملف مرفق"
              }))
            } : undefined
          }
        });
      }
    }

    revalidatePath("/dashboard/admin");
    return { success: true, courseId: course.id };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function generateAccessCodes(courseId: string, count: number, prefix: string) {
  try {
    await checkAdmin();
    for (let i = 0; i < count; i++) {
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `${prefix}-${randomStr}`;
      
      await prisma.accessCode.create({
        data: {
          code,
          courseId,
          used: false,
        }
      });
    }

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function activateCourseWithCode(codeString: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("يجب تسجيل الدخول أولاً.");
    const studentId = (session.user as { id: string }).id;

    const codeObj = await prisma.accessCode.findUnique({
      where: { code: codeString }
    });

    if (!codeObj) return { error: "الكود غير صحيح." };
    if (codeObj.used) return { error: "هذا الكود تم استخدامه مسبقاً." };

    // Mark code as used
    await prisma.accessCode.update({
      where: { id: codeObj.id },
      data: {
        used: true,
        usedById: studentId,
        usedAt: new Date(),
      }
    });

    // Ensure we don't duplicate enrollments secretly
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId: codeObj.courseId } }
    });

    if (!existing) {
      await prisma.enrollment.create({
        data: {
          userId: studentId,
          courseId: codeObj.courseId
        }
      });
    }

    revalidatePath(`/dashboard/courses/${codeObj.courseId}`);
    revalidatePath("/dashboard/profile");
    return { success: true, courseId: codeObj.courseId };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function toggleLessonCompletion(lessonId: string, completed: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("يجب تسجيل الدخول أولاً.");
    const userId = (session.user as { id: string }).id;

    await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed },
      create: { userId, lessonId, completed }
    });

    revalidatePath("/dashboard/courses");
    revalidatePath(`/dashboard/courses/lessons/${lessonId}`);
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}
