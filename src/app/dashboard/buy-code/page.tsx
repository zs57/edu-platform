import { MessageCircle, ShieldCheck, Zap, CreditCard } from "lucide-react";

export default function DashboardBuyCodePage() {
  const whatsappNumber = "201028914389";
  const message = encodeURIComponent("أهلاً بك، أريد شراء كود تفعيل لمنصة الباير (EL-BIO).");
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="panel p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ring-1 ring-white/5">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              شراء أكواد التفعيل
            </h1>
            <p className="text-zinc-400 font-medium text-lg leading-relaxed">
              تواصل معنا مباشرة للحصول على كودك الخاص وفتح جميع محتويات الكورسات المغلقة.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action: WhatsApp Contact - MOVED TO TOP */}
      <div className="panel p-10 text-center relative overflow-hidden border-emerald-500/30 bg-emerald-500/[0.02]">
           <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent"></div>
           <h2 className="text-2xl md:text-4xl font-black text-white mb-8 relative z-10 tracking-tight">ابدأ رحلتك الآن بمجرد رسالة!</h2>
           <a 
            href={`https://wa.me/${whatsappNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto relative z-10 inline-flex mx-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-2xl px-12 py-6 rounded-2xl items-center justify-center gap-4 transition-all shadow-2xl shadow-[#25D366]/30 hover:-translate-y-1 hover:scale-[1.02]"
           >
             <MessageCircle className="w-8 h-8 font-black" />
             تواصل معنا الآن عبر واتساب
           </a>
           
           <p className="text-center text-zinc-500 mt-10 font-bold relative z-10 text-lg">
             رقم خدمة المبيعات المباشر: <br/> 
             <span dir="ltr" className="text-white mt-4 block tracking-widest text-2xl font-mono bg-zinc-900 border border-white/10 w-fit mx-auto px-8 py-3 rounded-2xl shadow-inner">01028914389</span>
           </p>
      </div>

      {/* Details Section - MOVED TO BOTTOM */}
      <div className="grid md:grid-cols-2 gap-8">
         <div className="panel p-8 relative overflow-hidden group border-white/5">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">دفع آمن وسريع</h3>
            <p className="text-zinc-400 leading-relaxed font-medium">نوفر لك طرق دفع متعددة وسريعة عبر المحافظ الإلكترونية، بمجرد التحويل يتم إرسال الكود الحصري لك فوراً دون تأخير.</p>
         </div>

         <div className="panel p-8 relative overflow-hidden group border-white/5">
             <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
               <Zap className="w-8 h-8 text-amber-400" />
             </div>
             <h3 className="text-2xl font-black text-white mb-3">خصوصية تامة للكود</h3>
             <p className="text-zinc-400 leading-relaxed font-medium">الكود المخصص لك يعمل لمرة واحدة ويرتبط بحسابك فقط، مما يمنع سرقته ويضمن لك الحماية التامة لحسابك ومسارك التعليمي.</p>
         </div>
      </div>

    </div>
  );
}
