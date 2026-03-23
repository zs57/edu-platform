"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCourseWithCurriculum } from "@/app/actions/editCourseActions";
import { ArrowLeft, BookOpen, PlusCircle, Trash2, Video, FileText, Loader2, Save, Edit3, Plus, ArrowRight, Info, GripVertical, PlayCircle, Lock, Upload, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

interface Subject {
  id: string;
  name: string;
}

interface Attachment {
  id?: string;
  title: string;
  fileUrl: string;
}

interface Lesson {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  content: string;
  attachments: Attachment[];
}

interface Chapter {
  id?: string;
  title: string;
  examUrl?: string | null;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
  gradeLevel: string | null;
  examUrl: string | null;
  isExamOnly: boolean;
  subject: { name: string };
  chapters: (Chapter & { lessons: (Lesson & { attachments: Attachment[] })[] })[];
}

export default function CourseEditClient({ course, existingSubjects }: { course: CourseData; existingSubjects: Subject[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "");
  const [price, setPrice] = useState(course.price.toString());
  const [subjectName, setSubjectName] = useState(course.subject.name);
  const [gradeLevel, setGradeLevel] = useState(course.gradeLevel || "الأول الثانوي");
  const [imageUrl, setImageUrl] = useState(course.image || "");
  const [examUrl, setExamUrl] = useState(course.examUrl || "");
  const [isExamOnly, setIsExamOnly] = useState(course.isExamOnly || false);

  // Initialize chapters from course data
  const initialChapters: Chapter[] = course.chapters.map((ch) => ({
    id: ch.id,
    title: ch.title,
    lessons: ch.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description || "",
      videoUrl: l.videoUrl || "",
      content: l.content || "",
      attachments: l.attachments?.map((a) => ({
        id: a.id,
        title: a.title,
        fileUrl: a.fileUrl
      })) || []
    }))
  }));

  const [chapters, setChapters] = useState<Chapter[]>(initialChapters.length > 0 ? initialChapters : [
    { title: "الفصل الأول", examUrl: "", lessons: [{ title: "الدرس الأول", description: "", videoUrl: "", content: "", attachments: [] }] }
  ]);

  const addChapter = () => {
    setChapters([...chapters, { title: `الفصل الجديد`, lessons: [] }]);
  };

  const addLesson = (cIndex: number) => {
    const newChapters = [...chapters];
    newChapters[cIndex].lessons.push({ title: "درس جديد", description: "", videoUrl: "", content: "", attachments: [] });
    setChapters(newChapters);
  };

  const addAttachment = (cIndex: number, lIndex: number) => {
    const newChapters = [...chapters];
    newChapters[cIndex].lessons[lIndex].attachments = newChapters[cIndex].lessons[lIndex].attachments || [];
    newChapters[cIndex].lessons[lIndex].attachments.push({ title: "ملف جديد", fileUrl: "" });
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
          toast.success("تم رفع الملف الأساسي!");
        }
      } else if (type === "attachment") {
        if (cIndex !== undefined && lIndex !== undefined && aIndex !== undefined) {
          const newChapters = [...chapters];
          newChapters[cIndex].lessons[lIndex].attachments[aIndex].fileUrl = data.url;
          // Set title to filename without extension if it's still default
          if (newChapters[cIndex].lessons[lIndex].attachments[aIndex].title === "ملف جديد") {
             const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;
             newChapters[cIndex].lessons[lIndex].attachments[aIndex].title = fileName;
          }
          setChapters(newChapters);
          toast.success("تم رفع المرفق!");
        }
      }
    } catch (error) {
      toast.error("فشل الرفع، حاول مرة أخرى.");
      console.error(error);
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
    if (!confirm("هل أنت متأكد من حذف هذا الفصل بجميع دروسه؟")) return;
    const newChapters = [...chapters];
    newChapters.splice(cIndex, 1);
    setChapters(newChapters);
  };

  const removeLesson = (cIndex: number, lIndex: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    const newChapters = [...chapters];
    newChapters[cIndex].lessons.splice(lIndex, 1);
    setChapters(newChapters);
  };

  const handleSave = () => {
    if (!title || !subjectName) return toast.error("الرجاء إدخال اسم الكورس والمادة!");

    startTransition(async () => {
      const data = { title, description, price, subjectName, gradeLevel, imageUrl, examUrl, isExamOnly, chapters };
      const res = await updateCourseWithCurriculum(course.id, data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("تم تعديل الكورس والتحديث بنجاح!");
        router.refresh();
        router.push("/dashboard/admin");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 relative z-10" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard/admin" className="text-zinc-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
          <ArrowRight className="w-5 h-5" /> عودة للوحة الإدارة 
        </Link>
        <button 
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.3)] text-lg px-8 py-3 rounded-2xl"
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          تحديث بيانات الكورس
        </button>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="panel p-8 shadow-2xl bg-black/40 backdrop-blur-xl border-blue-500/20">
          <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Edit3 className="w-5 h-5 text-blue-400" />
            </div>
            تعديل معلومات الكورس
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">اسم الكورس</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors shadow-inner" placeholder="أدخل اسم الكورس..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">اسم المادة</label>
              <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} className="w-full bg-zinc-950 rounded-xl p-3 text-white border border-white/5 focus:border-blue-500 outline-none" required />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">الصف الدراسي</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} className="w-full bg-zinc-950 rounded-xl p-3 text-white border border-white/5 focus:border-blue-500 outline-none">
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
                <option value="عام / تأسيس">عام / تأسيس</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <datalist id="subjects">
                {existingSubjects?.map((s: { id: string; name: string }) => <option key={s.id} value={s.name} />)}
              </datalist>
            </div>
          </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">وصف احترافي للكورس</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 outline-none border border-white/5 focus:border-blue-500 shadow-inner resize-none h-20 mb-2" placeholder="شرح مفصل ومبسط..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">صورة الغلاف (رابط أو رفع)</label>
                <div className="flex gap-2">
                  <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition-colors shadow-inner text-sm" placeholder="مثال: https://i.imgur.com/image.jpg" />
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 w-14 rounded-2xl flex items-center justify-center transition-colors shrink-0">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")} />
                    {isUploading === "image--" ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Upload className="w-5 h-5 text-white" />}
                  </label>
                </div>
                {imageUrl && (
                  <div className="mt-4 relative h-32 w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-400 uppercase tracking-widest bg-black/40">
                      معاينة الغلاف الحالي
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">سعر الكورس بالجنيه</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-amber-400 font-black text-xl outline-none focus:border-amber-500 transition-colors shadow-inner text-center" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-white/5 pt-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">رابط امتحان الكورس الشامل (إن وجد)</label>
                <input type="text" value={examUrl} onChange={e => setExamUrl(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-blue-400 font-bold outline-none focus:border-blue-500 transition-colors shadow-inner" placeholder="رابط Google Form أو منصة امتحانات..." dir="ltr" />
              </div>
              <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-2xl p-4 mt-7 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setIsExamOnly(!isExamOnly)}>
                <input type="checkbox" id="isExamOnlyEdit" checked={isExamOnly} onChange={e => setIsExamOnly(e.target.checked)} onClick={e => e.stopPropagation()} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                <label htmlFor="isExamOnlyEdit" className="text-sm font-bold text-white cursor-pointer select-none">هذا الكورس عبارة عن امتحان فقط (لن تظهر الدروس)</label>
              </div>
            </div>
        </div>

        {/* Curriculum Builder */}
        <div className="panel p-8 shadow-2xl border-white/5 bg-zinc-950/80">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              مراجعة وتعديل المنهج
            </h2>
            <button onClick={addChapter} className="text-emerald-400 hover:text-white font-black text-sm bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-400 px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg">
              <PlusCircle className="w-5 h-5" /> إضافة فصل جديد
            </button>
          </div>

          <div className="space-y-6">
            {chapters.map((chapter, cIndex: number) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={cIndex} className="bg-black/60 border border-white/10 rounded-3xl p-6 relative group shadow-xl text-right">
                <button onClick={() => removeChapter(cIndex)} className="absolute top-6 left-6 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-50 hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="mb-6 w-full space-y-4 pr-0 md:pr-4">
                  <div>
                    <label className="block text-sm font-black text-zinc-500 mb-2">اسم الفصل (الباب)</label>
                    <input type="text" value={chapter.title} onChange={e => { const nc = [...chapters]; nc[cIndex].title = e.target.value; setChapters(nc); }} className="w-full bg-transparent border-b-2 border-white/10 focus:border-emerald-500 p-2 text-2xl font-black text-white outline-none transition-colors" placeholder="مثال: الباب الأول - الكيمياء العضوية" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-400/80 mb-1">رابط امتحان الفصل الشامل (اختياري)</label>
                    <input type="url" value={chapter.examUrl || ""} onChange={e => { const nc = [...chapters]; nc[cIndex].examUrl = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 border border-white/5 focus:border-blue-500/50 rounded-xl p-3 text-sm text-blue-300 outline-none transition-colors shadow-inner" placeholder="ضع رابط خارجي للاختبار كـ Google Forms" />
                  </div>
                </div>

                <div className="space-y-4 pr-4 md:pr-8 border-r-2 border-white/5 pt-2">
                  {chapter.lessons.map((lesson, lIndex: number) => (
                    <div key={lIndex} className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 relative group/lesson shadow-md hover:border-white/10 transition-all">
                       <button onClick={() => removeLesson(cIndex, lIndex)} className="absolute top-5 left-5 text-red-400/30 hover:text-red-400 transition-opacity">
                         <Trash2 className="w-5 h-5" />
                       </button>

                       <div className="w-full">
                         <input type="text" placeholder="عنوان الدرس..." value={lesson.title} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].title = e.target.value; setChapters(nc); }} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-bold text-lg outline-none focus:border-blue-500 mb-3" />
                         <textarea placeholder="تفاصيل ومحتوى الدرس (اختياري)..." value={lesson.description || ""} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].description = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 outline-none border border-white/5 focus:border-blue-500 shadow-inner resize-none h-20 mb-2"></textarea>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                             <Video className="w-5 h-5 text-red-500" />
                           </div>
                           <input type="text" placeholder="رابط فيديو الشرح المباشر" value={lesson.videoUrl} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].videoUrl = e.target.value; setChapters(nc); }} className="w-full bg-zinc-950 rounded-xl p-3 text-sm text-zinc-300 outline-none border border-white/5 focus:border-red-500 shadow-inner" dir="ltr" />
                         </div>
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                             <FileText className="w-5 h-5 text-blue-500" />
                           </div>
                           <div className="flex-1 flex gap-2">
                             <input type="text" placeholder="رابط المذكرة الأساسية" value={lesson.content} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].content = e.target.value; setChapters(nc); }} className="flex-1 bg-zinc-950 rounded-xl p-3 text-xs text-zinc-300 outline-none border border-white/5 focus:border-blue-500 shadow-inner" dir="ltr" />
                             <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-3 rounded-xl flex items-center justify-center transition-colors">
                               <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "lesson", cIndex, lIndex)} />
                               {isUploading === `lesson-${cIndex}-${lIndex}-` ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
                             </label>
                           </div>
                         </div>
                       </div>

                       {/* Extra Attachments UI */}
                       <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                         <p className="text-xs font-bold text-zinc-500">مرفقات وملفات إضافية (مثل الواجب، الإجابات)</p>
                         {lesson.attachments?.map((attachment, aIndex: number) => (
                           <div key={aIndex} className="flex flex-col sm:flex-row gap-2 relative group/att">
                             <input type="text" placeholder="عنوان المرفق" value={attachment.title} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].attachments[aIndex].title = e.target.value; setChapters(nc); }} className="w-full sm:w-1/3 bg-black/40 border border-white/5 focus:border-zinc-500 p-2 text-xs text-white rounded-lg outline-none font-bold" />
                             <div className="flex-1 flex gap-2">
                               <input type="text" placeholder="رابط الملف..." value={attachment.fileUrl} onChange={e => { const nc = [...chapters]; nc[cIndex].lessons[lIndex].attachments[aIndex].fileUrl = e.target.value; setChapters(nc); }} className="flex-1 bg-black/40 border border-white/5 focus:border-zinc-500 p-2 text-xs text-zinc-400 rounded-lg outline-none text-left" dir="ltr" />
                               <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 px-3 rounded-lg flex items-center justify-center transition-colors">
                                 <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "attachment", cIndex, lIndex, aIndex)} />
                                 {isUploading === `attachment-${cIndex}-${lIndex}-${aIndex}` ? <Loader2 className="w-3 h-3 animate-spin text-zinc-400" /> : <FileUp className="w-3 h-3 text-zinc-400" />}
                               </label>
                             </div>
                             <button onClick={() => removeAttachment(cIndex, lIndex, aIndex)} className="absolute -left-3 -top-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                           </div>
                         ))}
                         <button onClick={() => addAttachment(cIndex, lIndex)} className="text-zinc-500 hover:text-white bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold flex items-center gap-1.5 transition-colors">
                           <PlusCircle className="w-3 h-3" /> إضافة مرفق جديد للحصة
                         </button>
                       </div>
                    </div>
                  ))}
                  
                  <button onClick={() => addLesson(cIndex)} className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 mt-4 transition-all">
                    <PlusCircle className="w-4 h-4" /> إضافة درس جديد داخل الفصل
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
