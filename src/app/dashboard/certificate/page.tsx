"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Award, Download } from "lucide-react";
import { useRef } from "react";

export default function CertificatePage() {
  const { data: session } = useSession();
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border-l-4 border-l-accent">
        <div>
          <h1 className="text-2xl font-bold mb-1">الشهادات والاعتمادات</h1>
          <p className="text-gray-400 text-sm">تم التصحيح التلقائي لمسارك واجتزت المتطلبات.</p>
        </div>
        <button onClick={handlePrint} className="btn-primary py-2 px-6 gap-2 bg-gradient-to-r from-accent to-emerald-600 print:hidden">
          <Download className="w-4 h-4" />
          تحميل كـ PDF
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full aspect-[1.414/1] bg-white text-black p-12 rounded-lg shadow-2xl relative overflow-hidden"
        ref={certificateRef}
        id="printable-certificate"
      >
        {/* Certificate Border & Background */}
        <div className="absolute inset-4 border-[12px] border-double border-gray-800 rounded"></div>
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-gray-900 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-8 pt-8">
          <div className="flex items-center gap-3 text-emerald-800 border-b-2 border-emerald-800 pb-4 px-12">
            <Award className="w-12 h-12" />
            <h2 className="text-4xl font-black tracking-widest uppercase" style={{ fontFamily: 'serif' }}>شهـادة إتمـام</h2>
            <Award className="w-12 h-12" />
          </div>

          <div className="space-y-4">
            <p className="text-xl text-gray-600 font-medium">تشهد منصة ألفا التعليمية بأن الطالب/ـة</p>
            <h3 className="text-5xl font-bold text-gray-900 italic" style={{ fontFamily: 'var(--font-cairo)' }}>
              {session?.user?.name || "طالب ألفا المتميز"}
            </h3>
          </div>

          <div className="space-y-4 max-w-2xl px-12">
            <p className="text-lg text-gray-700 leading-relaxed">
              قد أتم بنجاح وبكفاءة عالية جميع متطلبات المقرر الدراسي والتطبيقات العملية والتقييمات الذاتية، وذلك في الدورة التعليمية المكثفة لمادة:
            </p>
            <h4 className="text-3xl font-black text-blue-900 bg-blue-100 py-3 px-8 rounded-full border border-blue-200 inline-block">
              الفيزياء الكلاسيكية والحديثة
            </h4>
          </div>

          <p className="text-gray-600 text-lg font-medium">
            بتقدير عام: <span className="font-bold text-emerald-600">ممتاز (95%)</span>
          </p>

          <div className="w-full flex justify-between items-end px-20 pt-8 mt-auto">
            <div className="text-center">
              <div className="w-40 border-b border-gray-400 mb-2 h-12 flex items-end justify-center">
                <span className="font-script text-2xl opacity-70">Alpha Edu</span>
              </div>
              <p className="text-sm font-bold text-gray-800">توقيع إدارة المنصة</p>
            </div>
            
            <div className="w-32 h-32 rounded-full border-4 border-yellow-500 flex items-center justify-center relative overflow-hidden bg-yellow-50">
               <div className="absolute inset-0 bg-yellow-400 opacity-20 transform rotate-45"></div>
               <div className="text-center">
                 <div className="text-xs font-bold text-yellow-800">ALPHA</div>
                 <div className="text-[10px] text-yellow-700">CERTIFIED</div>
               </div>
            </div>

            <div className="text-center">
              <div className="w-40 border-b border-gray-400 mb-2 h-12 flex items-end justify-center">
                <span className="text-lg font-medium">{new Date().toLocaleDateString('ar-EG')}</span>
              </div>
              <p className="text-sm font-bold text-gray-800">تاريخ الإصدار</p>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            margin: 0;
            box-shadow: none;
            page-break-after: avoid;
            background-color: white !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
