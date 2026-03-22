"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourseWithCurriculum } from "@/app/actions/courseActions";
import { ArrowRight, BookOpen, PlusCircle, Trash2, Video, FileText, Loader2, Save, Plus, Info, GripVertical, PlayCircle, Lock, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

interface Subject {
  id: string;
  name: string;
  gradeLevel: string;
}

interface Attachment {
  title: string;
  fileUrl: string;
  type: string;
}

interface Lesson {
  title: string;
  description: string;
  videoUrl: string;
  content: string;
  attachments: Attachment[];
}

interface Chapter {
  title: string;
  examUrl: string;
  lessons: Lesson[];
}

export default function CourseBuilderClient({ existingSubjects }: { existingSubjects: Subject[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [subjectId, setSubjectId] = useState("");
  const [gradeLevel, setGradeLevel] = useState("الأول الثانوي");
  const [imageUrl, setImageUrl] = useState("");
  const [examUrl, setExamUrl] = useState("");
  const [isExamOnly, setIsExamOnly] = useState(false);

  const [chapters, setChapters] = useState<Chapter[]>([
    { title: "الفصل الأول", examUrl: "", lessons: [{ title: "الدرس الأول", description: "", videoUrl: "", content: "", attachments: [] }] }
  ]);

  const addChapter = () => {
    setChapters([...chapters, { title: `الفصل الجديد`, examUrl: "", lessons: [] }]);
  };

  const addLesson = (cIndex: number) => {
    const newChapters = [...chapters];
    newChapters[cIndex].lessons.push({ title: "درس جديد", description: "", videoUrl: "", content: "", attachments: [] });
    setChapters(newChapters);
  };

  const addAttachment = (cIndex: number, lIndex: number) => {
    const newChapters = [...chapters];
    newChapters[cIndex].lessons[lIndex].attachments.push({ title: "ملف جديد", fileUrl: "", type: "pdf" });
    setChapters(newChapters);
  };

  const removeAttachment = (cIndex: number, lIndex: number, aIndex: number) => {
    const newChapters = [...chapters];
    newChapters[cIndex].lessons[lIndex].attachments.splice(aIndex, 1);
    setChapters(newChapters);
  };

  const removeChapter = (cIndex: number) => {
    const newChapters = [...chapters];
    newChapters.splice(cIndex, 1);
    setChapters(newChapters);
  };

  const removeLesson = (cIndex: number, lIndex: number) => {
    const newChapters = [...chapters];
    newChapters[cIndex].lessons.splice(lIndex, 1);
    setChapters(newChapters);
  };

  const handleSave = () => {
    if (!title || !subjectId) return toast.error("الرجاء إدخال اسم الكورس واختيار المادة!");

    startTransition(async () => {
      // Find the subject name for the legacy action if needed, or update action to take ID
      const selectedSubject = existingSubjects.find((s) => s.id === subjectId);
      const data = { title, description, price, subjectName: selectedSubject?.name || "", gradeLevel, imageUrl, examUrl, isExamOnly, chapters };
      const res = await createCourseWithCurriculum(data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم إنشاء الكورس الاحترافي بنجاح!");
        router.push("/dashboard/admin");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard/admin" className="text-zinc-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
          <ArrowRight className="w-5 h-5" /> العودة للوحة الإدارة
        </Link>
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          حفظ ونشر الكورس
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="panel p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" /> المعلومات الأساسية للكورس
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">اسم الكورس (مثال: مراجعة نهائية فيزياء)</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="أدخل اسم الكورس..." />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">الصف الدراسي</label>
              <select 
                value={gradeLevel} 
                onChange={e => {
                  setGradeLevel(e.target.value);
                  setSubjectId(""); // Reset subject when grade changes
                }} 
                className="w-full bg-zinc-950 rounded-xl p-3 text-white border border-white/5 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">المادة (المتاحة لهذا الصف)</label>
              <select 
                value={subjectId} 
                onChange={e => setSubjectId(e.target.value)} 
                className="w-full bg-zinc-950 rounded-xl p-3 text-white border border-white/5 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="">اختر المادة...</option>
                {existingSubjects
                  ?.filter((s) => s.gradeLevel === gradeLevel)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))
                }
              </select>
              {existingSubjects?.filter((s) => s.gradeLevel === gradeLevel).length === 0 && (
                <p className="text-red-400 text-[10px] mt-2 font-bold">⚠️ لا يوجد مواد مضافة لهذا الصف بعد. أضف مادة أولاً من لوحة التحكم.</p>
              )}
            </div>
          </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">وصف احترافي للكورس</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="شرح مفصل ومبسط..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">رابط صورة الكورس الغلاف (ارفعها على درايف أو إيمجور)</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="مثال: https://i.imgur.com/image.jpg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">سعر الكورس بالجنيه (اتركه 0 للمجاني)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-amber-400 font-bold text-lg outline-none focus:border-amber-500 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">رابط امتحان الكورس الشامل (إن وجد)</label>
                <input type="text" value={examUrl} onChange={e => setExamUrl(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-blue-400 font-bold outline-none focus:border-blue-500 transition-colors" placeholder="رابط Google Form أو منصة امتحانات..." dir="ltr" />
              </div>
              <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-xl p-3 mt-7">
                <input type="checkbox" id="isExamOnly" checked={isExamOnly} onChange={e => setIsExamOnly(e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                <label htmlFor="isExamOnly" className="text-sm font-bold text-white cursor-pointer select-none">هذا الكورس عبارة عن امتحان فقط (لن تظهر الدروس)</label>
              </div>
            </div>
        </div>

        {/* Curriculum Builder */}
        <div className="panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-400" /> بناء المنهج والتسلسل
            </h2>
            <button onClick={addChapter} className="text-emerald-400 hover:text-emerald-300 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-lg flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> إضافة فصل جديد
            </button>
          </div>

          <div className="space-y-6">
            {chapters.map((chapter, cIndex) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={cIndex} className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 relative group">
                <button onClick={() => removeChapter(cIndex)} className="absolute top-6 left-6 text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="mb-6 w-full space-y-4 pr-0 md:pr-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">اسم الفصل (الباب)</label>
                    <input type="text" value={chapter.title} onChange={e => { const nc = [...chapters]; nc[cIndex].title = e.target.value; setChapters(nc); }} className="w-full bg-transparent border-b border-white/10 p-2 text-xl font-bold text-white outline-none focus:border-emerald-500 transition-colors" placeholder="مثال: الباب الأول - الكيمياء العضوية" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-400/80 mb-1">رابط امتحان الفصل الشامل (اختياري)</label>
                    <input type="url" value={chapter.examUrl || ""} onChange={e => { const nc = [...chapters]; nc[cIndex].examUrl = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 border border-white/5 focus:border-blue-500/50 rounded-xl p-3 text-sm text-blue-300 outline-none transition-colors shadow-inner" placeholder="ضع رابط خارجي للاختبار كـ Google Forms" />
                  </div>
                </div>

                <div className="space-y-3 pl-8 border-l-2 border-white/5">
                  {chapter.lessons.map((lesson, lIndex) => (
                    <div key={lIndex} className="bg-zinc-950 p-4 rounded-xl border border-white/5 flex flex-col gap-4 relative group/lesson">
                       <button onClick={() => removeLesson(cIndex, lIndex)} className="absolute top-4 left-4 text-red-400/30 hover:text-red-400 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                         <Trash2 className="w-4 h-4" />
                       </button>

                       <div className="w-full">
                         <input type="text" placeholder="عنوان الدرس..." value={lesson.title} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].title = e.target.value; setChapters(nc); }} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-bold text-lg outline-none focus:border-blue-500 mb-3" />
                         <textarea placeholder="تفاصيل ومحتوى الدرس (اختياري)..." value={lesson.description || ""} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].description = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 outline-none border border-white/5 focus:border-blue-500 shadow-inner resize-none h-20 mb-2"></textarea>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                             <Video className="w-4 h-4 text-red-500" />
                           </div>
                           <input type="text" placeholder="رابط فيديو الشرح المباشر أو يوتيوب" value={lesson.videoUrl} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].videoUrl = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 outline-none border border-white/5 focus:border-red-500 shadow-inner" dir="ltr" />
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                             <FileText className="w-4 h-4 text-blue-500" />
                           </div>
                           <input type="text" placeholder="رابط المذكرة الرئيسية (PDF Direct Link)" value={lesson.content} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].content = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 outline-none border border-white/5 focus:border-blue-500 shadow-inner" dir="ltr" />
                         </div>
                       </div>

                       {/* Extra Attachments UI */}
                       <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                         <p className="text-xs font-bold text-zinc-500">مرفقات وملفات إضافية (اختياري)</p>
                         {lesson.attachments?.map((attachment, aIndex) => (
                           <div key={aIndex} className="flex flex-col sm:flex-row gap-2 relative group/att">
                             <input type="text" placeholder="عنوان المرفق (مثال: نموذج الإجابة)" value={attachment.title} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].attachments[aIndex].title = e.target.value; setChapters(nc); }} className="w-full sm:w-1/3 bg-black/40 border border-white/5 focus:border-zinc-500 p-2 text-xs text-white rounded-lg outline-none" />
                             <input type="text" placeholder="رابط المرفق..." value={attachment.fileUrl} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].attachments[aIndex].fileUrl = e.target.value; setChapters(nc); }} className="w-full sm:w-2/3 bg-black/40 border border-white/5 focus:border-zinc-500 p-2 text-xs text-zinc-400 rounded-lg outline-none text-left" dir="ltr" />
                             <button onClick={() => removeAttachment(cIndex, lIndex, aIndex)} className="absolute -left-3 -top-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                           </div>
                         ))}
                         <button onClick={() => addAttachment(cIndex, lIndex)} className="text-zinc-400 hover:text-white bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold flex items-center gap-1.5 transition-colors">
                           <PlusCircle className="w-3 h-3" /> إضافة مرفق
                         </button>
                       </div>
                    </div>
                  ))}
                  
                  <button onClick={() => addLesson(cIndex)} className="text-zinc-500 hover:text-white text-sm font-bold flex items-center gap-2 mt-2 transition-colors">
                    <PlusCircle className="w-4 h-4" /> إضافة درس للفصل
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
