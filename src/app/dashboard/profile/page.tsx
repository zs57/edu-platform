import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      enrollments: { 
        include: { 
          course: true 
        } 
      },
      progress: true,
      quizResults: true,
    }
  });

  if (!user) redirect("/auth/login");

  // Pass plain object to avoid hydration issues with Prisma dates
  const userData = JSON.parse(JSON.stringify(user));

  return <ProfileClient user={userData} />;
}
