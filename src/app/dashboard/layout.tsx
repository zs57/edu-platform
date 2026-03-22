"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  LogOut, 
  Atom, 
  User as UserIcon,
  Loader2,
  ShieldAlert,
  CreditCard,
  Bell
} from "lucide-react";
import NotificationBanner from "@/components/NotificationBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "الكورسات", href: "/dashboard/courses", icon: BookOpen },
    { name: "شراء أكواد", href: "/dashboard/buy-code", icon: CreditCard },
    { name: "لوحة الشرف", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "الملف الشخصي", href: "/dashboard/profile", icon: UserIcon },
  ];

  if ((session?.user as { role?: string })?.role === "ADMIN") {
    menuItems.push({ name: "الإدارة", href: "/dashboard/admin", icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen flex bg-background">
      <NotificationBanner />
      {/* Sidebar */}
      <aside className="w-64 border-l border-white/5 bg-background/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-white/5 mx-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ألـفــــا</span>
          </Link>
        </div>

        <div className="flex-1 py-8 px-4 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] pointer-events-none" />
        
        {/* Desktop Header Top Bar */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 border-b border-white/[0.03] bg-black/5 z-20">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent capitalize">
              {pathname === "/dashboard" ? "مرحباً بك مجدداً دكتور" : menuItems.find(i => i.href === pathname)?.name || "تحكم المنصة"}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-white leading-tight">{session?.user?.name || "طالب المنصة"}</p>
                <p className="text-[10px] text-zinc-500 font-bold">{(session?.user as { role?: string })?.role === "ADMIN" ? "الأدمن العام" : "طالب مقيد"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-sm uppercase">{session?.user?.name?.[0] || "S"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <Atom className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ألـفــــا</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => signOut()} className="text-red-400 p-1.5 rounded-lg bg-red-500/10">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 pb-24 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Bottom Navigation Component */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2 pb-safe">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href} className="flex-1 flex flex-col items-center justify-center gap-1 group">
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive 
                    ? "bg-blue-500/20 text-blue-400 group-hover:scale-110" 
                    : "text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/5"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? "text-blue-400" : "text-zinc-500"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
