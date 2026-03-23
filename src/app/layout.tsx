import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import NextTopLoader from 'nextjs-toploader';
import ToasterProvider from "@/components/ToasterProvider"; // Added ToasterProvider import
import { SpeedInsights } from "@vercel/speed-insights/next";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://etkan.vercel.app"),
  title: {
    default: "منصة إتقان (ITQAN) | إمبراطورية العلم في جيبك للثانوية العامة",
    template: "%s | منصة إتقان"
  },
  description: "منصة إتقان التعليمية - المرجع الأول لطالب الثانوية العامة. شرح مواد، مراجعات نهائية، تدريبات ذكية، ومتابعة دورية. نوفر لك الخلاصة في الكيمياء، الفيزياء، والأحياء بأسلوب علمي مبتكر.",
  keywords: [
    "منصة إتقان", "منصة تعليمية أونلاين", "ثانوية عامة 2024", "ثانوية عامة 2025", 
    "شرح كيمياء", "مراجعة فيزياء", "أحياء ثانوية عامة", "بنك المعرفة", 
    "مراجعة نهائية", "نظام التابلت", "مدرسين ثانوية عامة", "أكاديمية تعليمية"
  ],
  authors: [{ name: "ITQAN Team" }],
  creator: "ITQAN Academy",
  publisher: "ITQAN Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "منصة إتقان (ITQAN) | رحلتك نحو التميز في الثانوية العامة",
    description: "انضم الآن لأقوى سيستم تعليمي في مصر. مراجعات، امتحانات، وشرح متكامل لكل المواد المختارة بعناية.",
    url: "https://etkan.vercel.app",
    siteName: "منصة إتقان",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "منصة إتقان (ITQAN) | عالمك التعليمي الجديد",
    description: "أقوى شرح ومراجعات للثانوية العامة بين يديك بأحدث أساليب التعليم.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "https://i.postimg.cc/J7KdmMYh/Screenshot-2026-03-22-191339.png",
    shortcut: "https://i.postimg.cc/J7KdmMYh/Screenshot-2026-03-22-191339.png",
    apple: "https://i.postimg.cc/J7KdmMYh/Screenshot-2026-03-22-191339.png",
  },
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
        {/* JSON-LD Professional SEO Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "إتقان (ITQAN)",
              "url": "https://etkan.vercel.app",
              "logo": "https://i.postimg.cc/J7KdmMYh/Screenshot-2026-03-22-191339.png",
              "description": "منصة تعليمية متخصصة في شرح مواد الثانوية العامة بأسلوب علمي مبتكر واحترافي لضمان التميز والوصول للدرجة النهائية.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Cairo",
                "addressCountry": "Egypt"
              },
              "author": {
                "@type": "Person",
                "name": "Admin ITQAN"
              }
            })
          }}
        />
        <AuthProvider>
          {children}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
