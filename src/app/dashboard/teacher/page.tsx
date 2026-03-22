"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Authorization check
  if (session?.user?.role !== "TEACHER" && session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">غير مصرح لك بالدخول</h1>
        <p className="text-gray-400">هذه الصفحة مخصصة للمعلمين والإداريين فقط لعرض وإدارة المحتوى.</p>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadSuccess(true);
        setFile(null);
      } else {
        alert("حدث خطأ أثناء الرفع");
      }
    } catch (error) {
      alert("خطأ في الاتصال بالخادم");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="glass-panel p-8 rounded-3xl border-l-4 border-l-primary relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2">لوحة المعلم</h1>
        <p className="text-gray-400">إدارة الكورسات، رفع المذكرات والمرفقات للطلاب.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-primary" />
          رفع ملف جديد أو مذكرة
        </h2>

        {uploadSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            تم رفع الملف بنجاح وإتاحته للطلاب!
          </motion.div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors rounded-2xl p-10 text-center relative bg-white/5">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-white mb-1">
              {file ? file.name : "اسحب الملف هنا أو انقر للاختيار"}
            </p>
            <p className="text-sm text-gray-500">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "مسموح بملفات PDF و Word و PowerPoint"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select className="input-field max-w-xs" required>
              <option value="">اختر الكورس...</option>
              <option value="physics-101">الفيزياء الكلاسيكية والحديثة</option>
              <option value="chemistry-101">الكيمياء العضوية والتفاعلات</option>
            </select>
            
            <button 
              type="submit" 
              disabled={isUploading || !file}
              className="btn-primary w-full max-w-xs"
            >
              {isUploading ? "جاري الرفع..." : "تأكيد الرفع"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
