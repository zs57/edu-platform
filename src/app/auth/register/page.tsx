"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState("الأول الثانوي");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, gradeLevel }),
      });

      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        throw new Error(errorData.message || "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
      }
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!signInRes?.error) {
        router.push("/dashboard");
      } else {
        setError("تعذر تسجيل الدخول بعد إنشاء الحساب");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "حدث خطأ غير معروف");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#050505] text-zinc-100 relative overflow-hidden">
      {/* Absolute Ambient Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      
      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
        <Link href="/" className="absolute top-6 left-6 text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="mb-8 text-center pt-2">
          <div className="w-16 h-16 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4 flex items-center justify-center shadow-inner">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-wide">تسجيل حساب جديد</h1>
          <p className="text-zinc-500 mt-2 text-sm font-medium">ابدأ رحلتك نحو القمة في أكاديمية ألفا</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              الاسم الرباعي
            </label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-white/5 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600 text-sm font-medium shadow-inner"
                placeholder="مثال: أحمد محمد علي محمود"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-zinc-400 mb-2">
               الصف الدراسي
             </label>
             <select
               value={gradeLevel}
               onChange={(e) => setGradeLevel(e.target.value)}
               className="w-full bg-zinc-900/50 border border-white/5 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors text-sm font-bold shadow-inner"
             >
               <option value="الأول الثانوي">الأول الثانوي</option>
               <option value="الثاني الثانوي">الثاني الثانوي</option>
               <option value="الثالث الثانوي">الثالث الثانوي</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-white/5 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600 text-sm font-medium shadow-inner"
                placeholder="student@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-zinc-900/50 border border-white/5 text-white rounded-xl py-3 pr-12 pl-4 focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600 text-sm font-medium shadow-inner"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : "إنشاء الحساب والتسجيل"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500 font-bold border-t border-white/5 pt-6">
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="text-blue-400 transition-colors hover:text-blue-300 hover:underline">
            سجل دخولك من هنا
          </Link>
        </div>
      </div>
    </div>
  );
}
