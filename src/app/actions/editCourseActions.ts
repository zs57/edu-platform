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

export interface ChapterUpdateData {
  id?: string;
  title: string;
  examUrl?: string | null;
  examCode?: string | null;
  lessons: LessonUpdateData[];
}

export interface LessonUpdateData {
  id?: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  attachments?: { id?: string; title: string; fileUrl: string }[];
}

export interface CourseCurriculumUpdateData {
  subjectName: string;
  title: string;
  description?: string | null;
  price: string | number;
  imageUrl?: string | null;
  examUrl?: string | null;
  examCode?: string | null;
  isExamOnly?: boolean;
  gradeLevel?: string | null;
  chapters: ChapterUpdateData[];
}

export async function updateCourseWithCurriculum(courseId: string, data: CourseCurriculumUpdateData) {
  try {
    await checkAdmin();
    await prisma.$transaction(async (tx) => {
      // 1. Ensure Subject exists
      let subject = await tx.subject.findFirst({ where: { name: data.subjectName } });
      if (!subject) {
        subject = await tx.subject.create({ data: { name: data.subjectName, description: "تم إنشاؤه تلقائياً" } });
      }

      // 3. Update the Course Level Data
      await tx.course.update({
        where: { id: courseId },
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

      // 3. Keep track of incoming chapter IDs
      const incomingChapterIds = data.chapters.filter((c: ChapterUpdateData) => !!c.id).map((c: ChapterUpdateData) => c.id as string);
      
      // Delete chapters that aren't in the incoming list
      if (incomingChapterIds.length > 0) {
        await tx.chapter.deleteMany({
          where: { courseId: courseId, id: { notIn: incomingChapterIds } }
        });
      } else {
        // If empty, delete all chapters for course
        await tx.chapter.deleteMany({
          where: { courseId: courseId }
        });
      }

      // 4. Update or Create Chapters
      for (const [cIndex, chapterData] of data.chapters.entries()) {
        let chapterId = chapterData.id;
        
        if (chapterId) {
          await tx.chapter.update({
            where: { id: chapterId },
            data: { title: chapterData.title, examUrl: chapterData.examUrl || null, examCode: chapterData.examCode || null, order: cIndex + 1 }
          });
        } else {
          const newChap = await tx.chapter.create({
            data: { title: chapterData.title, examUrl: chapterData.examUrl || null, examCode: chapterData.examCode || null, order: cIndex + 1, courseId: courseId }
          });
          chapterId = newChap.id;
        }

        // Keep track of incoming lessons for THIS chapter
        const incomingLessonIds = chapterData.lessons.filter((l: LessonUpdateData) => !!l.id).map((l: LessonUpdateData) => l.id as string);

        // Delete lessons not in incoming list for this chapter
        if (chapterData.id) { // Only delete if chapter existed
           if (incomingLessonIds.length > 0) {
             await tx.lesson.deleteMany({
               where: { chapterId: chapterId, id: { notIn: incomingLessonIds } }
             });
           } else {
             await tx.lesson.deleteMany({
               where: { chapterId: chapterId }
             });
           }
        }

        for (const [lIndex, lessonData] of chapterData.lessons.entries()) {
          if (lessonData.id) {
            const updatedLesson = await tx.lesson.update({
              where: { id: lessonData.id },
              data: {
                title: lessonData.title,
                description: lessonData.description || null,
                videoUrl: lessonData.videoUrl || null,
                content: lessonData.content || null,
                order: lIndex + 1
              }
            });
            
            // Handle attachments for existing lesson
            const incomingAttIds = lessonData.attachments?.filter((a: { id?: string }) => !!a.id).map((a: { id?: string }) => a.id as string) || [];
            await tx.attachment.deleteMany({
              where: { lessonId: updatedLesson.id, id: { notIn: incomingAttIds } }
            });
            
            if (lessonData.attachments) {
              for (const att of lessonData.attachments) {
                if (att.id) {
                  await tx.attachment.update({
                    where: { id: att.id },
                    data: { title: att.title, fileUrl: att.fileUrl }
                  });
                } else {
                  await tx.attachment.create({
                    data: { title: att.title, fileUrl: att.fileUrl, type: "ملف مرفق", lessonId: updatedLesson.id }
                  });
                }
              }
            }
          } else {
            await tx.lesson.create({
              data: {
                title: lessonData.title,
                description: lessonData.description || null,
                videoUrl: lessonData.videoUrl || null,
                content: lessonData.content || null,
                order: lIndex + 1,
                isLocked: false, 
                chapterId: chapterId,
                attachments: (lessonData.attachments && lessonData.attachments.length > 0) ? {
                  create: lessonData.attachments.map((a) => ({
                    title: a.title,
                    fileUrl: a.fileUrl,
                    type: "ملف مرفق"
                  }))
                } : undefined
              }
            });
          }
        }
      }
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/courses");
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}
