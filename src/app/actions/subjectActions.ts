"use server";

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

export async function createSubject(data: { name: string, description?: string, image?: string, gradeLevel?: string }) {
  try {
    await checkAdmin();
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        gradeLevel: data.gradeLevel
      }
    });
    revalidatePath("/dashboard/courses");
    return { success: true, subject };
  } catch (error) {
    return { error: "حدث خطأ أثناء إضافة المادة" };
  }
}

export async function getSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        courses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return subjects;
  } catch (error) {
    return [];
  }
}

export async function deleteSubject(id: string) {
  try {
    await checkAdmin();
    // Check if subject has courses
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } }
    });

    if (subject && subject._count.courses > 0) {
      return { error: "لا يمكن حذف المادة لأنها تحتوي على كورسات مرتبطة بها" };
    }

    await prisma.subject.delete({
      where: { id }
    });
    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (error) {
    return { error: "حدث خطأ أثناء حذف المادة" };
  }
}

export async function updateSubject(id: string, data: { name?: string, description?: string, image?: string, gradeLevel?: string }) {
  try {
    await checkAdmin();
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        gradeLevel: data.gradeLevel
      }
    });
    revalidatePath("/dashboard/courses");
    return { success: true, subject };
  } catch (error) {
    return { error: "حدث خطأ أثناء تحديث المادة" };
  }
}
