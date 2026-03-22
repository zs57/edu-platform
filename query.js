import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("LESSONS:", lessons);
}
main();
