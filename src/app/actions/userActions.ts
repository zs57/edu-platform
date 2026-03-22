"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string, email?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "غير مصرح لك" };

  try {
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        email: data.email,
      }
    });
    revalidatePath("/dashboard/profile");
    return { success: true, user: updated };
  } catch (error: unknown) {
    const err = error as { code?: string; message: string };
    if (err.code === 'P2002') return { error: "هذا البريد الإلكتروني مستخدم بالفعل" };
    return { error: "حدث خطأ أثناء التحديث" };
  }
}

export async function updatePassword(data: { currentPassword?: string, newPassword: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "غير مصرح لك" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return { error: "مستخدم غير صالح" };

  // Some users might not have a password (if oauth, though this app seems to use credentials)
  if (user.password) {
    const isValid = await bcrypt.compare(data.currentPassword || "", user.password);
    if (!isValid) return { error: "كلمة المرور الحالية غير صحيحة" };
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);

  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashedPassword }
  });

  return { success: true };
}
