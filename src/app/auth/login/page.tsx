"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowLeft, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("بيانات الدخول غير صحيحة، تأكد من الإيميل وباسوردك.");
        setIsLoading(false);
      } else {
        const params = new URLSearchParams(window.location.search);
        const destination = params.get("from") || params.get("callbackUrl") || "/dashboard";
        window.location.href = destination;
      }
    } catch (e) {
      setError("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans relative flex items-center justify-center p-4 overflow-hidden">
      {/* Optimized Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent" />
      </div>

      <div className="w-full max-w-lg relative z-10 transition-all duration-500">
        <div className="bg-zinc-950 border border-white/5 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
          <Link href="/" className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-all bg-white/5 p-2 rounded-lg border border-white/5">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="mb-10 text-right">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-2">
              تسجيل الدخول <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-zinc-500 text-sm font-bold">
              استكمل رحلتك نحو التميز في <span className="text-blue-500">منصة إتقان</span>.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl text-right font-black flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-zinc-500 mb-2 px-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 px-5 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-bold placeholder:text-zinc-700"
                  placeholder="name@student.com"
                  dir="ltr"
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-xs font-black text-zinc-500">كلمة المرور</label>
                <Link href="#" className="text-[10px] text-blue-500 font-bold hover:underline">نسيت كلمة السر؟</Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-4 px-5 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-bold placeholder:text-zinc-700"
                  placeholder="••••••••••••"
                  dir="ltr"
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>دخول مباشر</span>
                  <Zap className="w-4 h-4" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500 font-bold">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-blue-400 font-black hover:underline">
                انضم الآن للمتفوقين
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
