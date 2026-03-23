"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, ExternalLink, HelpCircle, ShieldAlert } from "lucide-react";

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examCode?: string | null;
  examUrl?: string | null;
  title: string;
}

export default function ExamModal({ isOpen, onClose, examCode, examUrl, title }: ExamModalProps) {
  const [isFull, setIsFull] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${isFull ? 'w-full h-full' : 'w-full max-w-5xl h-[85vh]'}`}
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                 <h2 className="text-lg md:text-xl font-black text-white leading-none mb-1">{title}</h2>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">نظام الامتحانات المدمج - إتقان</p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                  onClick={() => setIsFull(!isFull)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 transition-colors hidden md:block"
               >
                  {isFull ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
               </button>
               <button 
                  onClick={onClose}
                  className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white relative overflow-hidden">
            {examCode ? (
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: examCode }}
              />
            ) : examUrl ? (
              <iframe 
                src={examUrl} 
                className="w-full h-full border-none"
                title="Exam Content"
                allow="geolocation; microphone; camera"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-950">
                <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold">رابط الامتحان غير متوفر حالياً.</p>
              </div>
            )}
            
            {/* Custom Overlay for Embeds if needed */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-600"></div>
          </div>

          {/* Footer Warning */}
          <div className="p-3 bg-zinc-950 text-center text-[10px] font-bold text-zinc-500 border-t border-white/5 flex items-center justify-center gap-4">
             <span>⚠️ تنبيه: لا تقم بإغلاق هذه النافذة أو تحديث الصفحة أثناء الحل.</span>
             {examUrl && (
               <a href={examUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                  فتح في صفحة مستقلة <ExternalLink className="w-3 h-3" />
               </a>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
