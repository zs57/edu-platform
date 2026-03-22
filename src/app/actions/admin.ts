"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const settingsPath = path.join(process.cwd(), "settings.json");

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("غير مصرح لك بالقيام بهذا الإجراء.");
  }
  return session;
}

export async function deleteUser(id: string) {
  try {
    await checkAdmin();
    const user = await prisma.user.findUnique({ where: { id }});
    if (user?.role === "ADMIN") return { error: "لا يمكن حذف مدير النظام الأساسي." };

    await prisma.user.delete({ where: { id }});
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function deleteCourse(id: string) {
  try {
    await checkAdmin();
    await prisma.course.delete({ where: { id }});
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch(e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function toggleSetting(key: string, value: string) {
  try {
    await checkAdmin();
    let currentSettings: Record<string, string> = {};
    try {
      const data = await fs.readFile(settingsPath, "utf-8");
      currentSettings = JSON.parse(data);
    } catch(e) { /* file doesn't exist yet */ }

    currentSettings[key] = value;
    await fs.writeFile(settingsPath, JSON.stringify(currentSettings, null, 2));
    
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch(e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}

export async function clearCache() {
  try {
    await checkAdmin();
    // Clears the Next.js router cache for the entire site
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    return { error: error.message };
  }
}
