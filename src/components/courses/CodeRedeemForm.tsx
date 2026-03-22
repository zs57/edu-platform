"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { activateCourseWithCode } from "@/app/actions/courseActions";
import { Key, Loader2, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function CodeRedeemForm({ courseId, price, studentId }: { courseId: string, price: number, studentId: string }) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRedeem = () => {
    if (!code) return toast.error("الرجاء إدخال كود التفعيل!");
    
    startTransition(async () => {
      const res = await activateCourseWithCode(code);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("🎉 مبرووك! تم تفعيل الكورس بنجاح وبإمكانك البدء الآن.", { duration: 4000 });
      }
    });
  };

  return (
    <div className="bg-zinc-950/80 border border-amber-500/20 p-6 flex flex-col items-start gap-4 shadow-[0_0_30px_rgba(245,158,11,0.1)] rounded-2xl w-full max-w-md backdrop-blur-md">
      <div>
        <h3 className="text-xl font-black text-white flex items-center gap-2 mb-1">
          <Key className="w-5 h-5 text-amber-500" /> كورس مغلق
        </h3>
        <p className="text-zinc-400 text-sm font-medium">
          هذا الكورس يتطلب كود تفعيل للوصول لمحتواه. <br/>
          {price > 0 && <span className="text-amber-500 font-bold block mt-1">سعر الكورس: {price} ج.م</span>}
        </p>
      </div>

      <div className="w-full relative">
        <input 
          type="text" 
          placeholder="أدخل الكود هنا (مثال: ALFA-XXXXXX)" 
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-center text-amber-400 font-black tracking-widest text-lg outline-none focus:border-amber-500 transition-colors uppercase"
          dir="ltr"
        />
        <Sparkles className="w-5 h-5 text-zinc-500 absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none" />
      </div>

      <button 
        onClick={handleRedeem}
        disabled={isPending || !code}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "تفعيل الكورس الآن!"}
      </button>

      <div className="w-full mt-2 pt-4 border-t border-white/5 text-center">
        <p className="text-zinc-400 text-sm font-bold mb-3">معندكش كود تفعيل الكورس؟</p>
        <Link 
          href="/dashboard/buy-code" 
          className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-inner hover:-translate-y-1"
        >
           <MessageCircle className="w-5 h-5" /> تواصل واتساب لشراء الكود
        </Link>
      </div>
    </div>
  );
}
