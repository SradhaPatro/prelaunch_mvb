import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Instagram, 
  Mail, 
  ChevronRight, 
  Check, 
  CircleDot,
  ArrowRight,
  ExternalLink,
  Volume2
} from "lucide-react";
import StoryVisualizer from "./components/StoryVisualizer";
import FinalCinematic from "./components/FinalCinematic";
import { audio } from "./utils/audio";

// Narrative timeline chapters corresponding to scroll progress (0 to 1)
const narrativeTimeline = [
  {
    range: [0.00, 0.10],
    title: "A BETTER WAY TO COMMUTE",
    text: "Every day, millions of people travel to work alone in heavy traffic, paying high fares for cancelled rides. We are changing that."
  },
  {
    range: [0.10, 0.28],
    title: "THE MORNING STRUGGLE",
    text: "High surge prices, sudden cancellations, and stressful bookings make mornings difficult. Your day shouldn't start this way."
  },
  {
    range: [0.28, 0.44],
    title: "SAME DIRECTION, SAME TIME",
    text: "MoveBuddy instantly matches co-commuters heading to the same office zones or tech parks at the exact same hour."
  },
  {
    range: [0.44, 0.58],
    title: "VERIFIED & SECURE",
    text: "We verify company emails and identity badges so both hosts and guests can ride in complete comfort and trust."
  },
  {
    range: [0.58, 0.70],
    title: "ONE ROUTE. TWO PEOPLE.",
    text: "Share comfortable daily rides, save over 60% on fuel costs, and bypass daily booking hassles entirely."
  },
  {
    range: [0.70, 0.88],
    title: "REAL-TIME SAFETY",
    text: "Track your route live, enjoy automated wallet splits, and commute with secure emergency support built right in."
  },
  {
    range: [0.88, 0.94],
    title: "REACH WORK & SAVE",
    text: "Aman reaches his workspace on time, and Rohit covers his fuel expenses. It's safe, affordable, and incredibly easy."
  },
  {
    range: [0.94, 0.97],
    title: "JOIN THE NETWORK",
    text: "MoveBuddy is building India’s smartest, most reliable peer-to-peer office commuting network. Reserve your spot today."
  }
];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track global viewport scroll progress relative to the massive container
  useEffect(() => {
    const handleScroll = () => {
      if (!storyContainerRef.current) return;
      const rect = storyContainerRef.current.getBoundingClientRect();
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const totalScrollable = containerHeight - windowHeight;
      const scrolled = -rect.top;
      
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle local waitlist email and phone submission
  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubmitted(true);
    audio.playPaymentDing();
    
    // Auto open survey in secondary tab to map coordinates
    setTimeout(() => {
      window.open("https://forms.gle/yNu2wQKQiTUi5fn17", "_blank");
    }, 1200);
  };

  // Helper to copy contact email address
  const handleCopyEmail = () => {
    navigator.clipboard.writeText("Subratpradhan.mb@gmail.com");
    setCopiedEmail(true);
    audio.playTap();
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Get active narrative text based on progress
  const getActiveNarrative = () => {
    return narrativeTimeline.find(
      (item) => scrollProgress >= item.range[0] && scrollProgress < item.range[1]
    );
  };

  const activeNarrative = getActiveNarrative();

  return (
    <div 
      ref={storyContainerRef} 
      className="w-full relative bg-[#e9eaec] select-none text-[#2a2e34] overflow-x-hidden font-sans"
      style={{ minHeight: isMobile ? "760vh" : "950vh" }}
    >
      
      {/* ==========================================
          FIXED CINEMATIC VIEWPORT (Z-0)
          ========================================== */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
        <StoryVisualizer progress={scrollProgress} />
      </div>

      {/* ==========================================
          FLOATING BRANDING & SCENE PROGRESS (Z-50)
          ========================================== */}
      <header className="fixed top-3 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between pointer-events-none">
        <div className={`flex items-center w-full pointer-events-none gap-2 ${isMobile ? "justify-center" : "justify-between"}`}>
          {/* Minimal branding */}
          <div className="flex items-center gap-1.5 bg-[#e9eaec]/80 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#2a2e34]/15 pointer-events-auto shadow-sm">
            <CircleDot className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#ffb300]" />
            <span className="font-display font-black text-[10px] sm:text-xs tracking-wider sm:tracking-widest text-[#2a2e34]">
              MOVEBUDDY<span className="text-[#ffb300]">.IO</span>
            </span>
          </div>

          {/* Custom progress capsule - Keep on desktop/tablet, hide on mobile */}
          {!isMobile && (
            <div className="flex items-center gap-1.5 sm:gap-3 bg-[#e9eaec]/95 backdrop-blur-lg px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#2a2e34]/25 shadow-md pointer-events-auto">
              <span className="font-mono text-[9px] sm:text-xs font-black text-[#2a2e34] tracking-wider mr-1 sm:mr-3">THE JOURNEY</span>
              <div className="w-8 sm:w-24 h-[3.5px] sm:h-[4px] bg-[#2a2e34]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffb300] transition-all duration-300"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <span className="font-mono text-[9px] sm:text-xs font-black text-[#ffb300]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ==========================================
          CINEMATIC FLOATING SCENE NARRATIVE (Z-40)
          ========================================== */}
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-12 sm:left-8 sm:right-8 z-40 pointer-events-none flex flex-col items-center sm:items-start justify-end">
        <AnimatePresence mode="wait">
          {activeNarrative && scrollProgress < 0.95 && (
            <motion.div
              key={activeNarrative.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl sm:max-w-2xl bg-[#e9eaec]/85 backdrop-blur-lg border border-[#2a2e34]/15 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl pointer-events-auto shadow-2xl space-y-2 sm:space-y-4"
            >
              {/* Scene Indicator */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb300] animate-ping" />
                <span className="font-mono text-[8px] sm:text-[9px] font-bold text-[#2a2e34]/50 tracking-widest uppercase">
                  OUR VISION
                </span>
              </div>

              {/* Dynamic Title */}
              <h1 
                className="font-display font-black text-[#2a2e34] leading-tight tracking-tight uppercase"
                style={{ fontSize: "clamp(16px, 5vw, 36px)" }}
              >
                {activeNarrative.title}
              </h1>

              {/* Dynamic Subtext */}
              <p 
                className="font-sans text-[13px] sm:text-[16px] text-[#2a2e34]/85 leading-relaxed sm:leading-[1.7] max-w-full sm:max-w-[85%] font-medium"
                style={{ letterSpacing: "0.1px" }}
              >
                {activeNarrative.text}
              </p>

              {/* Interactive micro prompt to scroll - high contrast and readability */}
              <div className="flex items-center gap-1.5 pt-2 sm:pt-4 text-[9px] sm:text-xs font-mono font-black text-[#2a2e34]/80 uppercase tracking-widest">
                <span>SCROLL TO CONTINUE THE STORY</span>
                <span className="text-[#ffb300] animate-bounce text-xs sm:text-sm font-black">↓</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==========================================
          FINAL CINEMATIC SEQUENCE OVERLAY (Z-50)
          ========================================== */}
      <AnimatePresence>
        {scrollProgress >= 0.94 && (
          <FinalCinematic
            key="final-cinematic"
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            isSubmitted={isSubmitted}
            handleSubmitEmail={handleSubmitEmail}
            handleCopyEmail={handleCopyEmail}
            copiedEmail={copiedEmail}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
