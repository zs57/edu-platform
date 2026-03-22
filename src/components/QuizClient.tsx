"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface QuizQuestion {
  id?: string;
  text: string;
  options: { id?: string; text: string }[];
  correctOption: number;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export default function QuizClient({ quiz }: { quiz: QuizData }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [warnings, setWarnings] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = quiz.questions;

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    let currentScore = 0;
    questions.forEach((q: QuizQuestion, i: number) => {
      if (answers[i] === q.correctOption) {
        currentScore++;
      }
    });
    setScore(Math.round((currentScore / (questions.length || 1)) * 100));
  }, [answers, questions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setWarnings(w => {
          const newWarnings = w + 1;
          if (newWarnings >= 3) {
            handleSubmit();
            toast.error("تم تسليم الاختبار تلقائياً لتجاوز الحد المسموح به من محاولات الغش (تبديل النوافذ).", { duration: 5000 });
          } else {
            toast.error(`⚠️ تحذير لمنع الغش! يرجى عدم مغادرة صفحة الاختبار. (تحذير ${newWarnings} من 3)`, { duration: 4000 });
          }
          return newWarnings;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSubmitted, handleSubmit]);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, handleSubmit]);

  const handleSelect = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIndex }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="panel p-10 max-w-md w-full text-center border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
        >
          <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black mb-3 text-white">النتيجة النهائية</h2>
          <p className="text-zinc-400 text-lg mb-8">
            يا بطل إنت جبت <span className="text-emerald-400 font-black text-3xl block my-2">{score}%</span> في الامتحان ده! عاش جداً.
          </p>
          <Link href="/dashboard" className="btn-primary w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20">
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <div className="text-center p-10 font-bold text-zinc-400">لا توجد أسئلة مضافة لهذا الاختبار بعد.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="panel p-5 flex items-center justify-between mb-8 sticky top-24 z-50 border-blue-500/20 bg-zinc-950/80">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">{quiz.title}</h1>
          {warnings > 0 && (
            <div className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg mt-2">
              <AlertTriangle className="w-4 h-4" />
              تحذير: بلاش تبدل الصفحة ({warnings}/3 محاولات غش)
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl font-mono text-2xl font-black tracking-widest border transition-colors ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
          <Clock className="w-6 h-6" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-zinc-500 mb-3">
          <span>السؤال {currentQuestion + 1} من {questions.length}</span>
          <span className="text-blue-400">{Math.round(((currentQuestion + 1) / questions.length) * 100)}% مكتمل</span>
        </div>
        <div className="w-full bg-zinc-900 rounded-full h-3 border border-white/5 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="panel p-8 md:p-10 mb-8 border-white/10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-relaxed">
            {questions[currentQuestion].text}
          </h2>

          <div className="space-y-4">
            {questions[currentQuestion].options.map((option: { id?: string; text: string }, index: number) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <button
                  key={option.id || index}
                  onClick={() => handleSelect(index)}
                  className={`w-full text-right p-5 rounded-xl border transition-all duration-200 flex items-center gap-5 group ${
                    isSelected 
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                      : "border-white/5 hover:border-white/20 hover:bg-white/5 bg-zinc-950/50"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "border-blue-400" : "border-zinc-600 group-hover:border-zinc-400"
                  }`}>
                    {isSelected && <div className="w-3.5 h-3.5 rounded-full bg-blue-400" />}
                  </div>
                  <span className={`text-xl font-medium ${isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}>{option.text}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="px-8 py-4 text-lg font-bold rounded-xl panel border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          السؤال اللي فات
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={answers[currentQuestion] === undefined}
            className="btn-primary px-8 py-4 text-lg gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
          >
            تسليم الامتحان
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={answers[currentQuestion] === undefined}
            className="btn-primary px-10 py-4 text-lg gap-2 disabled:opacity-50"
          >
            اللي بعده
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
