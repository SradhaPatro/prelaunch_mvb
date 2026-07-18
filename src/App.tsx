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
  Volume2,
  VolumeX
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
    range: [0.70, 0.89],
    title: "REAL-TIME SAFETY",
    text: "Track your route live, enjoy automated wallet splits, and commute with secure emergency support built right in."
  },
  {
    range: [0.89, 0.95],
    title: "REACH WORK & SAVE",
    text: "Aman reaches his workspace on time, and Rohit covers his fuel expenses. It's safe, affordable, and incredibly easy."
  },
  {
    range: [0.95, 0.98],
    title: "JOIN THE NETWORK",
    text: "MoveBuddy is building India’s smartest, most reliable peer-to-peer office commuting network. Reserve your spot today."
  }
];

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const storyContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasInteractedPopup, setHasInteractedPopup] = useState(false);
  const [isMuted, setIsMuted] = useState(audio.getMutedState());

  const handleToggleMute = () => {
    const newState = audio.toggleMute();
    setIsMuted(newState);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track global viewport scroll progress relative to the massive container
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (storyContainerRef.current) {
            const rect = storyContainerRef.current.getBoundingClientRect();
            const containerHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            const totalScrollable = containerHeight - windowHeight;
            const scrolled = -rect.top;
            
            let progress = 0;
            if (totalScrollable > 0) {
              progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
            }
            if (isNaN(progress)) {
              progress = 0;
            }
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle local waitlist single email or phone submission with local persistence
  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();
    if (!val) return;
    
    const isEmail = val.includes("@") && val.includes(".");
    const digits = val.replace(/[^0-9]/g, "");
    const isPhone = digits.length >= 10;
    
    if (!isEmail && !isPhone) {
      setErrorMsg("Please enter a valid email or phone number.");
      return;
    }
    
    setErrorMsg("");
    setIsSubmitted(true);
    audio.playPaymentDing();

    // Persist waitlist signups in localStorage safely
    try {
      const list = JSON.parse(localStorage.getItem("movebuddy_waitlist") || "[]");
      const phoneVal = isPhone ? val : phone;
      const emailVal = isEmail ? val : email;
      list.push({
        name: "Anonymous Commuter",
        email: emailVal,
        phone: phoneVal,
        joinedAt: new Date().toISOString(),
        source: "LandingCinematic"
      });
      localStorage.setItem("movebuddy_waitlist", JSON.stringify(list));
    } catch (err) {
      console.error("Local storage persistence error:", err);
    }
    
    // Direct synchronous open to prevent browser popup blockers from blocking the redirect
    try {
      window.open("https://forms.gle/yNu2wQKQiTUi5fn17", "_blank");
    } catch (e) {
      console.error("Popup window block caught: ", e);
    }
  };

  // Jump smoothly to any specific chapter scroll percentage (0 to 1)
  const handleJumpToChapter = (p: number) => {
    audio.playTap();
    if (storyContainerRef.current) {
      const containerHeight = storyContainerRef.current.scrollHeight;
      const windowHeight = window.innerHeight;
      const totalScrollable = containerHeight - windowHeight;
      window.scrollTo({
        top: p * totalScrollable,
        behavior: "smooth"
      });
    }
  };

  // Skip directly to waitlist section
  const handleSkipToContribute = () => {
    setHasInteractedPopup(true);
    if (storyContainerRef.current) {
      const containerHeight = storyContainerRef.current.scrollHeight;
      const windowHeight = window.innerHeight;
      const totalScrollable = containerHeight - windowHeight;
      window.scrollTo({
        top: totalScrollable, // Scroll exactly to the bottom
        behavior: "smooth"
      });
    }
    audio.playTap();
  };

  // Continue reading/scrolling the story
  const handleContinueStory = () => {
    setHasInteractedPopup(true);
    audio.playTap();
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

  const chapters = [
    { name: "City Intro", p: 0.00, desc: "India's commuter struggle" },
    { name: "Morning Struggle", p: 0.15, desc: "Cancelled cabs & surges" },
    { name: "MoveBuddy Match", p: 0.33, desc: "Instant matching pass" },
    { name: "Verified Badges", p: 0.50, desc: "Enterprise credentials" },
    { name: "Shared Route", p: 0.63, desc: "Split expenses, save fuel" },
    { name: "Live Safety HUD", p: 0.78, desc: "Active safe transit tracking" },
    { name: "Safe Arrival", p: 0.92, desc: "Aman & Rohit arrive" },
    { name: "Join Waitlist", p: 0.97, desc: "Reserve your early spot" }
  ];

  return (
    <div 
      ref={storyContainerRef} 
      className="w-full relative bg-[#e9eaec] select-none text-[#2a2e34] overflow-x-hidden font-sans"
      style={{ minHeight: isMobile ? "380vh" : "550vh" }}
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
        <div className="flex items-center w-full pointer-events-none justify-between gap-2 sm:gap-4">
          {/* Minimal branding */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[#e9eaec]/80 backdrop-blur-md px-2.5 py-1 sm:px-4 sm:py-2 rounded-full border border-[#2a2e34]/15 pointer-events-auto shadow-sm">
            <CircleDot className="w-3 h-3 sm:w-5 sm:h-5 text-[#ffb300]" />
            <span className="font-display font-black text-[9px] sm:text-xs tracking-wider sm:tracking-widest text-[#2a2e34]">
              MOVEBUDDY<span className="text-[#ffb300]">.IO</span>
            </span>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Quick Skip/Join Waitlist Action Button */}
            <button
              onClick={handleSkipToContribute}
              className="flex items-center gap-1 sm:gap-2 bg-[#2a2e34] hover:bg-[#1c1f24] text-[#ffb300] font-black tracking-widest text-[8px] sm:text-[10px] uppercase py-1.5 px-3 sm:py-2 sm:px-4 rounded-full transition-all active:scale-95 shadow-md cursor-pointer border border-[#ffb300]/20"
              title="Skip directly to Waitlist Form"
            >
              <span>Join Waitlist</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {/* Custom progress capsule - Optimized for both Desktop & Mobile */}
            <div className="flex items-center gap-1 sm:gap-3 bg-[#e9eaec]/95 backdrop-blur-lg px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-[#2a2e34]/15 shadow-md">
              <span className="font-mono text-[7px] sm:text-xs font-black text-[#2a2e34] tracking-wider mr-0.5 sm:mr-3 uppercase">
                {isMobile ? "JOURNEY" : "THE JOURNEY"}
              </span>
              <div className="w-10 sm:w-24 h-[2px] sm:h-[4px] bg-[#2a2e34]/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffb300] transition-all duration-300"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <span className="font-mono text-[8px] sm:text-xs font-black text-[#ffb300]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>

            {/* Floating Audio Toggle Badge */}
            <button
              onClick={handleToggleMute}
              className="flex items-center justify-center bg-[#e9eaec]/95 hover:bg-[#2a2e34]/5 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-[#2a2e34]/15 shadow-md transition-all active:scale-90 cursor-pointer text-[#2a2e34]"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-red-500/80" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-[#ffb300] animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          FLOATING DESKTOP CHAPTER TIMELINE SIDEBAR (Z-40)
          ========================================== */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4 bg-[#e9eaec]/90 backdrop-blur-md px-3.5 py-6 rounded-full border border-[#2a2e34]/15 shadow-lg">
        {chapters.map((ch, idx) => {
          const isActive = idx === chapters.length - 1 
            ? scrollProgress >= ch.p
            : scrollProgress >= ch.p && scrollProgress < chapters[idx + 1].p;
          return (
            <div key={idx} className="relative group flex items-center justify-center">
              {/* Chapter dot button */}
              <button
                onClick={() => handleJumpToChapter(ch.p)}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 relative z-10 flex items-center justify-center cursor-pointer ${
                  isActive 
                    ? "bg-[#ffb300] scale-125 ring-4 ring-[#ffb300]/20" 
                    : "bg-[#2a2e34]/25 hover:bg-[#2a2e34]/60 hover:scale-110"
                }`}
              >
                {isActive && <div className="w-1.5 h-1.5 bg-[#2a2e34] rounded-full" />}
              </button>

              {/* Connected thin timeline line between dots */}
              {idx < chapters.length - 1 && (
                <div className="absolute top-3.5 bottom-[-18px] w-[1.5px] bg-[#2a2e34]/15 pointer-events-none" />
              )}

              {/* Left-sliding hover tooltip overlay */}
              <div className="absolute right-full mr-4 pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex flex-col items-end whitespace-nowrap">
                <div className="bg-[#2a2e34] text-[#e9eaec] px-3 py-1.5 rounded-xl shadow-md border border-white/5 text-right">
                  <p className="font-display font-black text-[10px] tracking-wider uppercase text-[#ffb300]">{ch.name}</p>
                  <p className="text-[9px] font-sans text-[#e9eaec]/70 font-medium">{ch.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==========================================
          BOUNCING MOUSE SCROLL PROMPT (Visible on first screen)
          ========================================== */}
      <AnimatePresence>
        {scrollProgress < 0.05 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1.5 text-[#2a2e34]/70 font-mono text-[9px] font-black tracking-widest uppercase"
          >
            <span>Scroll to Explore Story</span>
            {/* Animated mouse visualizer */}
            <div className="w-5 h-8 border-2 border-[#2a2e34]/30 rounded-full flex justify-center pt-1.5">
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-1.5 bg-[#ffb300] rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {/* Scene Indicator & Skip Dot Links */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#2a2e34]/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb300] animate-ping" />
                  <span className="font-mono text-[8px] sm:text-[9px] font-bold text-[#2a2e34]/50 tracking-widest uppercase">
                    OUR VISION
                  </span>
                </div>
                
                {/* Inline Chapter Quick dots - clickable path navigator for both desktop and mobile screens */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 py-0.5">
                  {chapters.map((item, idx) => {
                    const isDotActive = idx === chapters.length - 1
                      ? scrollProgress >= item.p
                      : scrollProgress >= item.p && scrollProgress < chapters[idx + 1].p;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleJumpToChapter(item.p)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                          isDotActive 
                            ? "bg-[#ffb300] scale-135 ring-4 ring-[#ffb300]/20" 
                            : "bg-[#2a2e34]/25 hover:bg-[#2a2e34]/60"
                        }`}
                        title={item.name}
                      />
                    );
                  })}
                </div>
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
            errorMsg={errorMsg}
            isSubmitted={isSubmitted}
            handleSubmitEmail={handleSubmitEmail}
            handleCopyEmail={handleCopyEmail}
            copiedEmail={copiedEmail}
          />
        )}
      </AnimatePresence>

      {/* ==========================================
          FLOATING WHATSAPP BUTTON (Z-[999])
          ========================================== */}
      <motion.a
        href="https://chat.whatsapp.com/CyEU0UqMp0H4FCwh3M68lC?s=sw&p=a&ilr=0&amv=0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join MoveBuddy WhatsApp Community"
        className="fixed bottom-6 right-6 w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-[0_8px_24px_rgba(37,211,102,0.4)] z-[999] group transition-all duration-300 pointer-events-auto"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* WhatsApp Official SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current transition-transform duration-300 group-hover:rotate-12"
        >
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.988l-1.417 5.176 5.297-1.391c1.464.797 3.111 1.217 4.776 1.217 5.506 0 9.988-4.482 9.988-9.988S17.518 2 12.012 2zm6.012 14.195c-.247.695-1.42 1.272-1.954 1.349-.49.071-.976.275-3.136-.612-2.756-1.129-4.512-3.931-4.646-4.116-.135-.185-1.097-1.458-1.097-2.782s.686-1.973.93-2.22c.244-.247.534-.309.712-.309.18 0 .359.002.514.009.16.007.375-.061.587.45.218.528.745 1.815.809 1.947.065.132.108.286.02.463-.087.177-.132.285-.262.438-.13.153-.274.341-.392.458-.132.13-.27.271-.116.536.153.265.681 1.121 1.458 1.812.999.889 1.839 1.163 2.102 1.295.263.132.417.11.572-.069.155-.18.665-.776.843-1.039.177-.263.356-.22.599-.13.243.09 1.545.728 1.809.86.265.132.441.198.508.312.066.114.066.662-.181 1.357z" />
        </svg>

        {/* Desktop Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#2a2e34] text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md hidden sm:block">
          Join our WhatsApp Community
          {/* Tooltip Arrow */}
          <span className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-4 border-transparent border-l-[#2a2e34]" />
        </span>
      </motion.a>

    </div>
  );
}
