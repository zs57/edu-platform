"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourseWithCurriculum } from "@/app/actions/courseActions";
import { ArrowRight, BookOpen, PlusCircle, Trash2, Video, FileText, Loader2, Save, Plus, Info, GripVertical, PlayCircle, Lock, Upload, FileUp } from "lucide-react";
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
  const [isUploading, setIsUploading] = useState<string | null>(null);

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

  const handleFileUpload = async (file: File, type: "image" | "lesson" | "attachment", cIndex?: number, lIndex?: number, aIndex?: number) => {
    const uploadId = `${type}-${cIndex ?? ''}-${lIndex ?? ''}-${aIndex ?? ''}`;
    setIsUploading(uploadId);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      if (type === "image") {
        setImageUrl(data.url);
        toast.success("تم رفع الغلاف بنجاح!");
      } else if (type === "lesson") {
        if (cIndex !== undefined && lIndex !== undefined) {
          const newChapters = [...chapters];
          newChapters[cIndex].lessons[lIndex].content = data.url;
          setChapters(newChapters);
          toast.success("تم رفع المذكرة!");
        }
      } else if (type === "attachment") {
        if (cIndex !== undefined && lIndex !== undefined && aIndex !== undefined) {
          const newChapters = [...chapters];
          newChapters[cIndex].lessons[lIndex].attachments[aIndex].fileUrl = data.url;
          if (newChapters[cIndex].lessons[lIndex].attachments[aIndex].title === "ملف جديد") {
             const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;
             newChapters[cIndex].lessons[lIndex].attachments[aIndex].title = fileName;
          }
          setChapters(newChapters);
          toast.success("تم رفع المرفق!");
        }
      }
    } catch (error) {
      toast.error("فشل الرفع.");
    } finally {
      setIsUploading(null);
    }
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
      const selectedSubject = existingSubjects.find((s) => s.id === subjectId);
      const data = { title, description, price, subjectName: selectedSubject?.name || "", gradeLevel, imageUrl, examUrl, isExamOnly, chapters };
      const res = await createCourseWithCurriculum(data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم إنشاء الكورس بنجاح!");
        router.push("/dashboard/admin");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-24" dir="rtl">
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
          حفظ ونشر الكورس الحقيقي
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="panel p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" /> المعلومات الأساسية للكورس الشامل
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">اسم الكورس</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="أدخل اسم الكورس..." />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">الصف الدراسي</label>
              <select value={gradeLevel} onChange={e => { setGradeLevel(e.target.value); setSubjectId(""); }} className="w-full bg-zinc-950 rounded-xl p-3 text-white border border-white/5 focus:border-blue-500 outline-none cursor-pointer">
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">المادة</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full bg-zinc-950 rounded-xl p-3 text-white border border-white/5 focus:border-blue-500 outline-none cursor-pointer">
                <option value="">اختر المادة...</option>
                {existingSubjects?.filter((s) => s.gradeLevel === gradeLevel).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">وصف احترافي</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="شرح مفصل..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">صورة الغلاف (رابط أو رفع)</label>
              <div className="flex gap-2">
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="flex-1 bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none" placeholder="https://..." />
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 w-12 rounded-xl flex items-center justify-center transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")} />
                  {isUploading === "image--" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">سعر الكورس</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-amber-400 font-bold" />
            </div>
          </div>
        </div>

        {/* Curriculum Builder */}
        <div className="panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-400" /> بناء المنهج
            </h2>
            <button onClick={addChapter} className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-lg flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> إضافة فصل
            </button>
          </div>

          <div className="space-y-6">
            {chapters.map((chapter, cIndex) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={cIndex} className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 relative group text-right">
                <button onClick={() => removeChapter(cIndex)} className="absolute top-6 left-6 text-red-400/50 hover:text-red-400 transition-opacity">
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="mb-6 w-full space-y-4">
                  <input type="text" value={chapter.title} onChange={e => { const nc = [...chapters]; nc[cIndex].title = e.target.value; setChapters(nc); }} className="w-full bg-transparent border-b border-white/10 p-2 text-xl font-bold text-white outline-none focus:border-emerald-500" placeholder="اسم الفصل..." />
                  <input type="url" value={chapter.examUrl || ""} onChange={e => { const nc = [...chapters]; nc[cIndex].examUrl = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-sm text-blue-300 outline-none shadow-inner" placeholder="رابط امتحان الفصل" />
                </div>

                <div className="space-y-3 pr-8 border-r-2 border-white/5">
                  {chapter.lessons.map((lesson, lIndex) => (
                    <div key={lIndex} className="bg-zinc-950 p-4 rounded-xl border border-white/5 flex flex-col gap-4 relative">
                       <input type="text" placeholder="عنوان الدرس..." value={lesson.title} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].title = e.target.value; setChapters(nc); }} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-bold" />
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input type="text" placeholder="رابط الفيديو" value={lesson.videoUrl} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].videoUrl = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 border border-white/5 shadow-inner" dir="ltr" />
                         <div className="flex gap-2">
                           <input type="text" placeholder="رابط المذكرة" value={lesson.content} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].content = e.target.value; setChapters(nc); }} className="flex-1 bg-zinc-950 rounded-xl p-3 text-xs text-zinc-300 border border-white/5 shadow-inner" dir="ltr" />
                           <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-3 rounded-xl flex items-center justify-center transition-colors">
                             <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "lesson", cIndex, lIndex)} />
                             {isUploading === `lesson-${cIndex}-${lIndex}-` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                           </label>
                         </div>
                       </div>

                       <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                         {lesson.attachments?.map((attachment, aIndex) => (
                           <div key={aIndex} className="flex gap-2 relative">
                             <input type="text" placeholder="عنوان المرفق" value={attachment.title} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].attachments[aIndex].title = e.target.value; setChapters(nc); }} className="w-1/3 bg-black/40 border border-white/5 p-2 text-xs text-white rounded-lg outline-none" />
                             <div className="flex-1 flex gap-2">
                               <input type="text" placeholder="رابط الملف..." value={attachment.fileUrl} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].attachments[aIndex].fileUrl = e.target.value; setChapters(nc); }} className="flex-1 bg-black/40 border border-white/5 p-2 text-xs text-zinc-400 rounded-lg text-left" dir="ltr" />
                               <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-3 rounded-lg flex items-center justify-center transition-colors">
                                 <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "attachment", cIndex, lIndex, aIndex)} />
                                 {isUploading === `attachment-${cIndex}-${lIndex}-${aIndex}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3 text-zinc-400" />}
                               </label>
                             </div>
                           </div>
                         ))}
                         <button onClick={() => addAttachment(cIndex, lIndex)} className="text-zinc-500 hover:text-white text-xs font-bold flex items-center gap-1.5"><PlusCircle className="w-3 h-3" /> إضافة مرفق</button>
                       </div>
                    </div>
                  ))}
                  <button onClick={() => addLesson(cIndex)} className="text-zinc-500 hover:text-white text-sm font-bold flex items-center gap-2 mt-2"><PlusCircle className="w-4 h-4" /> إضافة درس</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
