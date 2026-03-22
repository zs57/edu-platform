import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import CourseBuilderClient from "@/components/admin/CourseBuilderClient";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-4xl font-black text-white mb-2">منطقة محظورة!</h1>
      </div>
    );
  }

  // Pass subjects to allow autocomplete or selection
  const subjects = await prisma.subject.findMany();
  
  const formattedSubjects = subjects.map((s: any) => ({
    ...s,
    gradeLevel: s.gradeLevel || "غير محدد"
  }));

  return <CourseBuilderClient existingSubjects={formattedSubjects as any} />;
}
