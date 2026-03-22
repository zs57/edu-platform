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

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("بيانات الدخول غير صحيحة، تأكد من الإيميل وباسوردك.");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans relative flex items-center justify-center p-6 overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000"></div>

          <Link href="/" className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-all bg-white/5 p-2.5 rounded-xl border border-white/5 hover:border-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="mb-12 text-right">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-3xl mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/20"
            >
              <Zap className="w-10 h-10 text-white" fill="currentColor" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
              تسجيل الدخول <Sparkles className="w-8 h-8 text-amber-400" />
            </h1>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed">
              مرحباً بك مجدداً في <span className="text-blue-400 font-black">منصة الباير</span>. استكمل رحلتك نحو التميز الحقيقي.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-5 rounded-2xl text-right font-bold flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-sm font-black text-zinc-400 mb-2.5 px-1">
                البريد الإلكتروني للطلبة
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 px-6 text-white outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all text-lg font-medium placeholder:text-zinc-700 shadow-inner group-hover:border-white/10"
                  placeholder="name@student.com"
                  dir="ltr"
                />
                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex justify-between items-center mb-2.5 px-1">
                <label className="text-sm font-black text-zinc-400">كلمة المرور</label>
                <Link href="#" className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors">نسيت كلمة السر؟</Link>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 px-6 text-white outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all text-lg font-medium placeholder:text-zinc-700 shadow-inner group-hover:border-white/10"
                  placeholder="••••••••••••"
                  dir="ltr"
                />
                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xl py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex justify-center items-center gap-3 disabled:opacity-50 mt-4 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>دخول مباشر</span>
                  <Zap className="w-5 h-5" />
                </div>
              )}
            </motion.button>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-zinc-500 font-bold">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-all font-black decoration-2 underline-offset-8">
                انضم الآن لمجتمع المتفوقين
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Floating status dots */}
        <div className="mt-8 flex justify-center gap-3">
           <div className="w-2 h-2 rounded-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
           <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
           <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
        </div>
      </motion.div>
    </div>
  );
}
