import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import NextTopLoader from 'nextjs-toploader';
import ToasterProvider from "@/components/ToasterProvider"; // Added ToasterProvider import

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "منصة إتقان (ITQAN) | إمبراطورية العلم في جيبك",
  description: "منصة إتقان التعليمية أونلاين، شرح المواد العلمية للثانوية العامة، مراجعات شاملة وأنظمة اختبارات ذكية. إحنا مش مجرد منصة بتشرح دروس، إحنا سيستم متكامل مبني على إتقان الوقت والجهد.",
  keywords: "منصة تعليمية أونلاين, شرح كيمياء ثانوية عامة, مراجعة فيزياء لغات وعربي, أفضل مدرس كيمياء ثانوية عامة, ملخصات ثانوية عامة PDF, حل امتحانات السنين السابقة, خلاصة المنهج في فيديو, شرح الدرس في 10 دقائق, مراجعة نهائية فيزياء, توقعات امتحان الكيمياء, أقوى ملخص كيمياء وثانوية عامة, منصة البايو التعليمية, نظام التابلت الجديد, أسئلة بنك المعرفة, حل امتحانات الوزارة, مراجعة الفصل بفصل, إزاي ألم منهج الكيمياء في وقت قصير؟, أفضل طريقة لمراجعة الفيزياء ثانوية عامة, تحميل ملخصات كيمياء وفيزياء لثالثة ثانوي, منصة شرح فيزياء بأسلوب سهل ومبسط, ثانوية عامة",
  icons: {
    icon: "https://i.postimg.cc/gJkTRyyz/Screenshot-2026-03-22-191339.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased bg-black text-zinc-100 min-h-screen relative selection:bg-blue-500/30 selection:text-blue-200`}>
        {/* Global Ambient Mesh Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#09090b]">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full mix-blend-screen" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
        </div>
        <NextTopLoader color="#3b82f6" height={3} showSpinner={false} />
        <ToasterProvider />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
