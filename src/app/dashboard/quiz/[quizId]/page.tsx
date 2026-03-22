import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizClient from "@/components/QuizClient";

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = await params;
  
  const quiz = await prisma.quiz.findUnique({
    where: { id: resolvedParams.quizId },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  if (!quiz) {
    notFound();
  }

  return <QuizClient quiz={quiz} />;
}
