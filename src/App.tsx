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
import SoundControl from "./components/SoundControl";
import FinalCinematic from "./components/FinalCinematic";
import { audio } from "./utils/audio";

// Narrative timeline chapters corresponding to scroll progress (0 to 1)
const narrativeTimeline = [
  {
    range: [0.00, 0.10],
    title: "WHAT IF EVERY COMMUTE FELT EFFORTLESS?",
    text: "Millions of professionals commute alone daily through heavy metropolitan traffic, surge pricing, and sudden cancellations. What if there was a smarter, connected way?"
  },
  {
    range: [0.10, 0.28],
    title: "EVERY MORNING BEGINS THE SAME.",
    text: "The alarm rings. Surge rates spike up to 2x. Drivers cancel in your critical hour. The stress starts before you even step outside your apartment."
  },
  {
    range: [0.28, 0.44],
    title: "SOMEONE SHARES YOUR EXACT ROUTE.",
    text: "MoveBuddy's smart matching engine works silently in the background, linking co-commuters sharing identical pathways and coordinates in real-time."
  },
  {
    range: [0.44, 0.58],
    title: "VERIFICATION IS INSTANT. SAFETY IS MUTUAL.",
    text: "Two-sided identity checks and digital security PIN keys ensure every host and guest rides in complete, trusted comfort."
  },
  {
    range: [0.58, 0.70],
    title: "ONE ROUTE. TWO PEOPLE. ALGORITHM-BASED CO-COMMUTING.",
    text: "Enjoy comfortable daily rides, reduce carbon emissions by over 60%, and reclaim your mornings. No repetitive bookings, no negotiation."
  },
  {
    range: [0.70, 0.88],
    title: "INTEGRATED DEFENSE & SAFETY.",
    text: "Track matches live via 24/7 GPS safety telemetry, instant auto-split wallets, and single-tap SOS guard alerts to safeguard your travel experience."
  },
  {
    range: [0.88, 0.94],
    title: "A SMARTER RECURRING NETWORK.",
    text: "Aman reaches his workspace tech park. Rohit covers his fuel expenses. One seamless co-commute covers and saves up to 40% on daily transit fees."
  },
  {
    range: [0.94, 0.97],
    title: "MILLIONS TRAVEL ALONE. THEY DON'T HAVE TO.",
    text: "MoveBuddy connects thousands of recurring routes simultaneously. We are shaping India's smartest, greenest peer-to-peer mobility highway."
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
          FLOATING BRANDING & SOUND TABS (Z-50)
          ========================================== */}
      <header className="fixed top-5 left-5 right-5 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between pointer-events-none gap-2">
        {/* Minimal branding */}
        <div className="flex items-center gap-1.5 bg-[#e9eaec]/70 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#2a2e34]/15 pointer-events-auto shadow-sm">
          <CircleDot className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#ffb300]" />
          <span className="font-display font-black text-[9px] sm:text-xs tracking-wider sm:tracking-widest text-[#2a2e34]">
            MOVEBUDDY<span className="text-[#ffb300]">.IO</span>
          </span>
        </div>

        {/* Custom progress capsule - High-contrast & always visible on mobile/desktop */}
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

        {/* Sound toggle container (receives pointer clicks) */}
        <div className="pointer-events-auto">
          <SoundControl />
        </div>
      </header>

      {/* ==========================================
          CINEMATIC FLOATING SCENE NARRATIVE (Z-40)
          ========================================== */}
      <div className="fixed bottom-5 left-5 right-5 sm:bottom-12 sm:left-8 sm:right-8 z-40 pointer-events-none flex flex-col items-start justify-end">
        <AnimatePresence mode="wait">
          {activeNarrative && scrollProgress < 0.95 && (
            <motion.div
              key={activeNarrative.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-[#e9eaec]/85 backdrop-blur-lg border border-[#2a2e34]/15 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl pointer-events-auto shadow-2xl space-y-2.5 sm:space-y-4"
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
                style={{ fontSize: "clamp(18px, 5.5vw, 36px)" }}
              >
                {activeNarrative.title}
              </h1>

              {/* Dynamic Subtext */}
              <p 
                className="font-sans text-[14px] sm:text-[16px] text-[#2a2e34]/85 leading-[1.7] max-w-full sm:max-w-[85%] font-medium"
                style={{ letterSpacing: "0.2px" }}
              >
                {activeNarrative.text}
              </p>

              {/* Interactive micro prompt to scroll - high contrast and readability */}
              <div className="flex items-center gap-1.5 pt-3 sm:pt-4 text-[10px] sm:text-xs font-mono font-black text-[#2a2e34]/80 uppercase tracking-widest">
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
