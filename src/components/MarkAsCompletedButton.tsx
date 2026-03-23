"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { toggleLessonCompletion } from "@/app/actions/courseActions";
import toast from "react-hot-toast";

export default function MarkAsCompletedButton({ 
  lessonId, 
  initialCompleted 
}: { 
  lessonId: string; 
  initialCompleted: boolean 
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !completed;
    startTransition(async () => {
      const res = await toggleLessonCompletion(lessonId, nextState);
      if (res.error) {
        toast.error(res.error);
      } else {
        setCompleted(nextState);
        toast.success(nextState ? "عاش يا بطل! تم تحديد الدرس كـ تمت المذاكرة ✅" : "تم إلغاء تحديد الدرس.");
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full text-lg font-bold py-4 rounded-xl mb-4 transition-all flex items-center justify-center gap-2 border shadow-lg ${
        completed 
          ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20" 
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
      } disabled:opacity-50`}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className={`w-5 h-5 ${completed ? "fill-white/20" : ""}`} />
      )}
      {completed ? "تمت المذاكرة بنجاح" : "تحديد كـ تمت المذاكرة"}
    </button>
  );
}
