"use client";

import { useState } from "react";
import { HelpCircle, ExternalLink, PlayCircle } from "lucide-react";
import ExamModal from "../ExamModal";

interface ExamTriggerProps {
  examUrl?: string | null;
  examCode?: string | null;
  title: string;
  isChapter?: boolean;
  isGeneral?: boolean;
}

export default function ExamTrigger({ examUrl, examCode, title, isChapter, isGeneral }: ExamTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If no exam is available, don't render anything or render placeholder
  if (!examUrl && !examCode) return null;

  if (isChapter) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-right block p-6 mt-4 rounded-3xl transition-all border-2 border-dashed border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 bg-blue-500/[0.02] group shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[20px] bg-blue-500/20 flex flex-col items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform shadow-inner">
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-blue-300 text-2xl mb-1">الامتحان الشامل للباب</h4>
              <p className="text-sm text-blue-400/60 font-black">اختبر مستواك الحقيقي في هذا الفصل فوراً.</p>
            </div>
            <div className="hidden sm:flex text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity ml-4">
              {examCode ? <PlayCircle className="w-8 h-8" /> : <ExternalLink className="w-8 h-8" />}
            </div>
          </div>
        </button>
        <ExamModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          examCode={examCode} 
          examUrl={examUrl} 
          title={title} 
        />
      </>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary text-xl px-12 py-5 rounded-2xl h-auto shadow-2xl shadow-blue-500/20 active-scale border-none bg-blue-600 hover:bg-blue-500"
      >
        بدء الامتحان الآن
      </button>
      <ExamModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        examCode={examCode} 
        examUrl={examUrl} 
        title={title} 
      />
    </>
  );
}
