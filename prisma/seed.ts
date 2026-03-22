import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  // 1. Create Admins and Students
  await prisma.user.upsert({
    where: { email: 'admin@alfa.com' },
    update: {},
    create: {
      email: 'admin@alfa.com',
      name: 'مدير النظام',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'student@alfa.com' },
    update: {},
    create: {
      email: 'student@alfa.com',
      name: 'أحمد بطل الثانوية',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  // 2. Create Subjects
  const physics = await prisma.subject.upsert({
    where: { id: 'subj-physics' },
    update: {},
    create: {
      id: 'subj-physics',
      name: 'الفيزياء',
      description: 'كل ما يخص علم الطبيعة وحل المسائل المعقدة ببساطة.',
    },
  })

  await prisma.subject.upsert({
    where: { id: 'subj-chemistry' },
    update: {},
    create: {
      id: 'subj-chemistry',
      name: 'الكيمياء',
      description: 'فهم المعادلات والتفاعلات والكيمياء العضوية بسهولة.',
    },
  })

  // 3. Create Courses
  const physicsCourse = await prisma.course.upsert({
    where: { id: 'course-physics-101' },
    update: {},
    create: {
      id: 'course-physics-101',
      title: 'الفيزياء الكلاسيكية والحديثة',
      description: 'هنفهمك الفيزيا من الصفر لحد الاحتراف، شرح مبسط للقوانين وحل مسائل النظام الجديد بكل أفكارها.',
      price: 0,
      subjectId: physics.id,
    },
  })

  // 4. Create Chapters
  const chapter1 = await prisma.chapter.upsert({
    where: { id: 'chap-phys-1' },
    update: {},
    create: {
      id: 'chap-phys-1',
      title: 'الوحدة الأولى: البدايات وقوانين الحركة',
      order: 1,
      courseId: physicsCourse.id,
    },
  })

  // 5. Create Lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-1' },
    update: {},
    create: {
      id: 'lesson-1',
      title: 'الدرس الأول: قوانين نيوتن بشكل مختلف',
      description: 'في الدرس ده هنشرح قوانين نيوتن التلاتة ونطبق عليها عملي.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video
      order: 1,
      isLocked: false,
      chapterId: chapter1.id,
    },
  })

  await prisma.lesson.upsert({
    where: { id: 'lesson-2' },
    update: {},
    create: {
      id: 'lesson-2',
      title: 'الدرس الثاني: الاحتكاك وأنواعه',
      description: 'شرح مفصل للاحتكاك السكوني والحركي.',
      order: 2,
      isLocked: true, // Requires passing lesson 1
      chapterId: chapter1.id,
    },
  })

  // 6. Create Quiz for Lesson 1
  const quiz1 = await prisma.quiz.upsert({
    where: { id: 'quiz-1' },
    update: {},
    create: {
      id: 'quiz-1',
      title: 'امتحان الدرس الأول (قوانين نيوتن)',
      lessonId: lesson1.id,
    },
  })

  // Adding questions
  await prisma.question.create({
    data: {
      text: 'إيه اللي بيحصل للجسم لو أثرت عليه قوة محصلة لا تساوي صفر؟',
      correctOption: 2,
      quizId: quiz1.id,
      options: {
        create: [
          { text: 'بيفضل ثابت وتقف سرعته' },
          { text: 'بيتحرك بسرعة منتظمة في نفس الاتجاه' },
          { text: 'بيكتسب عجلة (تسارع) في اتجاه القوة' },
          { text: 'كل الإجابات غلط' },
        ],
      },
    },
  })

  console.log('Seed finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
