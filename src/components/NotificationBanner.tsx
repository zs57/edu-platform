"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info, Sparkles, Megaphone } from "lucide-react";
import { getNotifications, type NotificationData } from "@/app/actions/notificationActions";
import { usePathname } from "next/navigation";

// Use the imported NotificationData interface

export default function NotificationBanner() {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide notification if user leaves the dashboard
    if (pathname !== "/dashboard" && isVisible) {
      setTimeout(() => setIsVisible(false), 0);
    }
  }, [pathname, isVisible]);

  useEffect(() => {
    if (pathname !== "/dashboard") return;

    const fetchLatest = async () => {
      try {
        const notifications = await getNotifications();
        if (notifications && notifications.length > 0) {
          setNotification(notifications[0] as NotificationData);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchLatest();
  }, [pathname]);

  if (!notification) return null;

  const Icon = notification.type === "WARNING" ? AlertTriangle : (notification.type === "SUCCESS" ? CheckCircle : Info);
  const themeColor = notification.type === "WARNING" ? "amber" : (notification.type === "SUCCESS" ? "emerald" : "blue");
  
  const colors = {
    amber: {
      text: "text-amber-400",
      border: "border-amber-500/40",
      bgIcon: "bg-amber-500/15",
      shadow: "shadow-amber-500/20",
      glow: "from-amber-500/10",
      btn: "bg-amber-500/10 hover:bg-amber-500/20"
    },
    emerald: {
      text: "text-emerald-400",
      border: "border-emerald-500/40",
      bgIcon: "bg-emerald-500/15",
      shadow: "shadow-emerald-500/20",
      glow: "from-emerald-500/10",
      btn: "bg-emerald-500/10 hover:bg-emerald-500/20"
    },
    blue: {
      text: "text-blue-400",
      border: "border-blue-500/40",
      bgIcon: "bg-blue-500/15",
      shadow: "shadow-blue-500/20",
      glow: "from-blue-500/10",
      btn: "bg-blue-500/10 hover:bg-blue-500/20"
    }
  }[themeColor as "amber" | "emerald" | "blue"];

  return (
    <div className="fixed top-4 inset-x-0 z-[10000] flex justify-center pointer-events-none px-4 md:px-0" dir="rtl">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -200, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -200, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className={`pointer-events-auto w-full max-w-lg bg-[#0c0c0e]/98 backdrop-blur-3xl border ${colors.border} rounded-3xl md:rounded-[2.5rem] p-5 md:p-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] ${colors.shadow} flex flex-col items-center text-center md:flex-row md:text-right md:items-center gap-5 md:gap-6 group cursor-pointer overflow-hidden border-t-2 ${colors.border}`}
            onClick={() => {
              if (notification.link) window.open(notification.link, "_blank");
            }}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.glow.replace('from-', 'from-transparent via-').replace('/10', '/30')} to-transparent opacity-50`} />
            <div className="absolute -top-6 -left-6 p-2 opacity-[0.03] -rotate-12 pointer-events-none">
              <Megaphone className="w-24 h-24 text-white" />
            </div>
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${colors.bgIcon} flex items-center justify-center shrink-0 border border-white/5 relative z-10 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
               <Icon className={`w-8 h-8 md:w-9 md:h-9 ${colors.text} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
               <div className="absolute -top-1.5 -right-1.5">
                  <Sparkles className="w-5 h-5 text-white/30 animate-pulse" />
               </div>
            </div>
            <div className="flex-1 relative z-10 overflow-hidden flex flex-col items-center md:items-start w-full">
              <h2 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-1 truncate leading-tight w-full">
                {notification.title}
              </h2>
              <p className="text-zinc-400 text-sm md:text-base font-bold opacity-90 leading-relaxed line-clamp-2 w-full">
                {notification.message}
              </p>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 relative z-10 w-full md:w-auto md:border-r border-white/10 md:pr-4 mt-2 md:mt-0">
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="w-full md:w-auto px-6 py-3 md:p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-2 group/btn"
              >
                <span className="text-xs md:hidden font-black">إغلاق وتجاهل</span>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-tr ${colors.glow} to-transparent rounded-full blur-[50px] pointer-events-none`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
