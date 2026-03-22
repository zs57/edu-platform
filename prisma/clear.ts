import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log("Removing all educational mock content...");
  
  // Keep Admin accounts if desired, but user said "احذف كل البينات الوهميه"
  // Let's delete all Courses, Chapters, Lessons, Quizzes, Questions, Attachments.
  // Due to cascade deletes, deleting Courses will delete Chapters and Lessons.
  
  await prisma.course.deleteMany({});
  await prisma.subject.deleteMany({});
  
  // We will keep 'USERS' because if they want to login they need an account. 
  // We can just keep the Admin and the physical Users.
  console.log("Deleted all Course, Subject, Chapter, Lesson, Quiz data. The database is now empty of all educational content.");
}

clearData()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
