"use client";

import { useState } from "react";
import { FileText, PlayCircle, Download, ExternalLink, FileDown, FolderOpen } from "lucide-react";
import SecureVideoPlayer from "./SecureVideoPlayer";
import { motion } from "framer-motion";

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
}

interface Attachment {
  id: string;
  title: string;
  fileUrl: string;
  type?: string | null;
}

interface LessonContentProps {
  lesson: Lesson;
  attachments: Attachment[];
}

export default function LessonContent({ lesson, attachments }: LessonContentProps) {
  return (
    <div className="space-y-6">
      <div className="panel p-1 border-white/5 shadow-2xl overflow-hidden rounded-2xl">
        {lesson.videoUrl ? (
          <SecureVideoPlayer videoUrl={lesson.videoUrl} />
        ) : (
          <div className="aspect-video bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <FileText className="w-20 h-20 mb-6 text-blue-500/50 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-500 relative z-10" />
            <h3 className="text-2xl font-black text-white mb-2 relative z-10">محتوى مقروء فقط</h3>
            <p className="font-medium text-zinc-400 relative z-10">هذا الدرس يعتمد على المذكرة وملفات الـ PDF ولا يحتوي على فيديو.</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/5 p-8 rounded-3xl shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] -z-10 rounded-full" />
           <h2 className="text-2xl font-black text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-3">
             <PlayCircle className="w-6 h-6 text-blue-400" />
             تفاصيل الدرس والمحتوى
           </h2>
           <p className="text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap text-lg">
             {lesson.description || "استمع وتفاعل مع الشرح لضمان أعلى درجات الفهم والإلمام بالمنهج. لا تنسَ مراجعة المذكرة المرفقة والملفات المتاحة بالأسفل."}
           </p>
        </motion.div>

        <div className="space-y-6">
           <div className="flex items-center gap-3 mb-2 px-2">
             <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
               <FolderOpen className="w-5 h-5 text-blue-400" />
             </div>
             <div>
               <h3 className="font-black text-white text-xl tracking-tight">المصادر والمرفقات التعليمية</h3>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">كل ما تحتاجه للتميز في هذا الدرس</p>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Main PDF / Content File */}
             {lesson.content && (
                <motion.a 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  href={lesson.content} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="group relative p-6 bg-gradient-to-br from-blue-600/20 to-zinc-900 border border-blue-500/30 rounded-[32px] hover:border-blue-500/50 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-blue-500/10 overflow-hidden flex flex-col justify-between min-h-[180px]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <FileDown className="w-7 h-7 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter">ملف أساسي</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-4">
                    <p className="font-black text-white text-xl mb-1 group-hover:text-blue-200 transition-colors leading-tight">المذكرة الأساسية PDF</p>
                    <div className="flex items-center gap-1 text-blue-400 group-hover:gap-2 transition-all">
                      <span className="text-xs font-bold">بدء التحميل الآن</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.a>
             )}
             
             {/* Secondary Attachments */}
             {attachments.map((file, idx) => (
               <motion.a 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 transition={{ delay: 0.05 * (idx + 1) }} 
                 key={file.id} 
                 href={file.fileUrl} 
                 target="_blank" 
                 rel="noreferrer" 
                 className="group relative p-6 bg-zinc-900/80 border border-white/5 rounded-[32px] hover:bg-zinc-800 hover:border-white/20 transition-all shadow-xl overflow-hidden flex flex-col justify-between min-h-[180px]"
               >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-zinc-700 transition-colors border border-white/5">
                      <FileText className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                    </div>
                    <Download className="w-5 h-5 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                  </div>

                  <div className="relative z-10 mt-4">
                    <p className="font-black text-zinc-100 text-lg mb-1 truncate group-hover:text-white transition-colors">{file.title}</p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 w-fit px-2 py-0.5 rounded-md">{file.type || "مرفق إضافي"}</p>
                  </div>
               </motion.a>
             ))}

             {!lesson.content && attachments.length === 0 && (
               <div className="col-span-full bg-zinc-950/40 border-2 border-dashed border-white/5 p-16 rounded-[40px] text-center flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4 border border-white/5">
                   <FileText className="w-8 h-8 text-zinc-700" />
                 </div>
                 <h4 className="text-zinc-500 font-black text-lg">لا يوجد ملفات مرفوعة حالياً</h4>
                 <p className="text-zinc-700 text-sm font-bold mt-1">المحتوى التعليمي سيظهر هنا قريباً جداً.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
