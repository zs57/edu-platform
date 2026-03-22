"use client";

import { useEffect, useRef, useState } from "react";
import { PlayCircle, Maximize, Lock, FileX } from "lucide-react";
import toast from "react-hot-toast";

interface SecureVideoPlayerProps {
  videoUrl: string;
}

export default function SecureVideoPlayer({ videoUrl }: SecureVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to extract YouTube ID
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Helper to extract Vimeo ID
  const getVimeoVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  };

  const ytId = getYoutubeVideoId(videoUrl);
  const vimeoId = getVimeoVideoId(videoUrl);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Prevent right-click to download, especially on standard video tags
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Print Screen or basic shortcut recording
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "s") || (e.ctrlKey && e.key === "c")) {
        e.preventDefault();
        toast.error("⚠️ تصوير الشاشة غير مسموح لحماية حقوق الملكية");
        
        // Obscure video momentarily if it's a direct HTML5 video
        if (videoRef.current) {
          videoRef.current.style.filter = "blur(20px)";
          setTimeout(() => {
            if (videoRef.current) videoRef.current.style.filter = "none";
          }, 3000);
        }
      }
    };

    // Only apply the aggressive context menu blocker strictly if it's a native video, 
    // but applying to document covers the whole page (adding extra security).
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group border border-white/10 shadow-2xl">
      {/* Dynamic Watermark to prevent screen recording sharing */}
      <div className="absolute top-4 right-4 z-20 opacity-30 pointer-events-none flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
        <Lock className="w-4 h-4 text-emerald-400" />
        <span className="text-white text-xs font-bold tracking-widest">محمي بحقوق ألفا</span>
      </div>

      {ytId ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&autoplay=0&hl=ar`}
          className="w-full h-full border-0 absolute top-0 left-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : vimeoId ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&color=3b82f6`}
          className="w-full h-full border-0 absolute top-0 left-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          className="w-full h-full object-contain absolute top-0 left-0"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoUrl} />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      )}

      {/* Overlay to catch right clicks if controls are hidden, strictly for direct videos */}
      {!ytId && !vimeoId && (
        <div 
          className="absolute inset-0 z-10 opacity-0 bg-transparent pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
}
