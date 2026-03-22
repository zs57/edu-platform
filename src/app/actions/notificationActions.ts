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

export type NotificationType = "INFO" | "SUCCESS" | "WARNING";

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  type: string; // Prisma model type is usually string, but we can cast it
  createdAt: Date;
}

export async function createNotification(data: { title: string, message: string, link?: string, type?: string }) {
  try {
    await checkAdmin();
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        link: data.link || null,
        type: data.type || "INFO",
      },
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true, notification };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { error: "حدث خطأ أثناء إرسال الإشعار" };
  }
}

export async function getNotifications() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function deleteNotification(id: string) {
  try {
    await checkAdmin();
    await prisma.notification.delete({
      where: { id },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { error: "حدث خطأ أثناء حذف الإشعار" };
  }
}
