import { prisma } from "@/lib/prisma";
import CoursesClient from "@/components/CoursesClient";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      subject: true,
      chapters: {
        include: { lessons: true }
      },
      enrollments: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <CoursesClient initialCourses={courses} />;
}
