import React, { useEffect, useState } from "react";
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
  RotateCcw,
  Sparkles,
  ChevronLast,
  Phone
} from "lucide-react";
import { audio } from "../utils/audio";

interface FinalCinematicProps {
  key?: string;
  onReplay?: () => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  isSubmitted: boolean;
  handleSubmitEmail: (e: React.FormEvent) => void;
  handleCopyEmail: () => void;
  copiedEmail: boolean;
}

type CinematicStage = "arrival" | "network_glow" | "logo_formation" | "manifesto" | "cta";

export default function FinalCinematic({
  onReplay,
  email,
  setEmail,
  phone,
  setPhone,
  isSubmitted,
  handleSubmitEmail,
  handleCopyEmail,
  copiedEmail
}: FinalCinematicProps) {
  const [stage, setStage] = useState<CinematicStage>("arrival");
  
  // Timed stats for Stage 1 (Arrival)
  const [visibleStats, setVisibleStats] = useState<number>(0);
  
  // Manifesto slide sub-stage
  const [manifestoSlide, setManifestoSlide] = useState(0);
  
  // Last animation: see you on the road
  const [tinyBikeFinished, setTinyBikeFinished] = useState(false);
  const [blackout, setBlackout] = useState(false);

  // Auto-play timer coordination
  useEffect(() => {
    let t1: any, t2: any, t3: any, t4: any, t5: any, t6: any, t7: any, t8: any;

    if (stage === "arrival") {
      // Step through stats fade-ins during arrival
      setVisibleStats(0);
      t1 = setTimeout(() => setVisibleStats(1), 1200);
      t2 = setTimeout(() => setVisibleStats(2), 2400);
      t3 = setTimeout(() => setVisibleStats(3), 3600);
      t4 = setTimeout(() => setVisibleStats(4), 4800);
      t5 = setTimeout(() => setVisibleStats(5), 6000);
      t6 = setTimeout(() => setVisibleStats(6), 7200);

      // Transition to network_glow after 10 seconds of breathing room
      t7 = setTimeout(() => {
        setStage("network_glow");
        try {
          audio.startCityAmbient();
        } catch (e) {}
      }, 11000);
    } else if (stage === "network_glow") {
      // Transition to logo_formation after 7 seconds
      t1 = setTimeout(() => {
        setStage("logo_formation");
      }, 7000);
    } else if (stage === "logo_formation") {
      // Transition to manifesto after 6 seconds
      t1 = setTimeout(() => {
        setStage("manifesto");
        setManifestoSlide(0);
      }, 6000);
    } else if (stage === "manifesto") {
      // Step through manifesto texts (3 seconds per sentence)
      t1 = setTimeout(() => setManifestoSlide(1), 3500);
      t2 = setTimeout(() => setManifestoSlide(2), 7000);
      t3 = setTimeout(() => {
        setStage("cta");
      }, 10500);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, [stage]);

  // Handle tiny bike journey at the end of the CTA
  useEffect(() => {
    if (stage === "cta") {
      setTinyBikeFinished(false);
      setBlackout(false);
      const t1 = setTimeout(() => {
        setTinyBikeFinished(true);
      }, 3500); // Ride duration matches transition

      const t2 = setTimeout(() => {
        setBlackout(true);
      }, 6500); // Fade to black shortly after completion

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [stage]);

  const handleRestart = () => {
    setStage("arrival");
    setVisibleStats(0);
    setManifestoSlide(0);
    setTinyBikeFinished(false);
    setBlackout(false);
    if (onReplay) onReplay();
  };

  return (
    <div className="fixed inset-0 w-full h-full z-50 bg-[#e9eaec] text-[#2a2e34] overflow-hidden flex flex-col font-sans select-none">
      
      {/* Dynamic top bar with skip / controls */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#e9eaec]/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#2a2e34]/15 pointer-events-auto">
          <CircleDot className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffb300]" />
          <span className="font-display font-black text-[10px] sm:text-xs tracking-wider sm:tracking-widest text-[#2a2e34]">
            MOVEBUDDY<span className="text-[#ffb300]">.IO</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {stage !== "cta" && (
            <button 
              onClick={() => setStage("cta")}
              className="flex items-center gap-1 bg-[#2a2e34]/5 hover:bg-[#2a2e34]/10 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#2a2e34]/10 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              Skip <span className="hidden sm:inline">to CTA</span> <ChevronLast className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button 
            onClick={handleRestart}
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-full bg-[#2a2e34]/5 hover:bg-[#2a2e34]/10 border border-[#2a2e34]/10 transition-all cursor-pointer"
            title="Restart Cinematic Sequence"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Visual Stage */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* ==========================================
              STAGE 1: THE OFFICE ARRIVAL & FAREWELL
              ========================================== */}
          {stage === "arrival" && (
            <motion.div 
              key="arrival-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6"
            >
              <div className="w-full max-w-4xl aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9] bg-[#e9eaec] border border-[#2a2e34]/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                
                {/* SVG Visual Stage */}
                <div className="flex-1 w-full relative overflow-hidden bg-gradient-to-b from-[#d8dadf]/30 to-[#e9eaec]">
                  <svg viewBox="0 0 800 450" className="w-full h-full">
                    <defs>
                      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2a2e34" floodOpacity="0.1" />
                      </filter>
                      <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Morning Sunlight Reflection rays on Glass building */}
                    <g opacity="0.45">
                      <polygon points="50,0 120,0 260,350 140,350" fill="url(#sunlight)" opacity="0.25" />
                      <polygon points="180,0 290,0 450,350 280,350" fill="url(#sunlight)" opacity="0.2" />
                      <linearGradient id="sunlight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb300" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#e9eaec" stopOpacity="0" />
                      </linearGradient>
                    </g>

                    {/* Wind / Leaf particles */}
                    <g opacity="0.6">
                      <circle cx="280" cy="120" r="1.5" fill="#2a2e34" opacity="0.2" />
                      <circle cx="340" cy="180" r="1.8" fill="#ffb300" opacity="0.4" />
                      <circle cx="450" cy="140" r="1.2" fill="#2a2e34" opacity="0.3" />
                      <circle cx="580" cy="220" r="1.6" fill="#2a2e34" opacity="0.25" />
                    </g>

                    {/* Flying Birds Overhead */}
                    <g>
                      {/* Bird 1 */}
                      <path d="M 120,60 Q 125,52 130,60 Q 135,52 140,60" fill="none" stroke="#2a2e34" strokeWidth="1.2" opacity="0.6">
                        <animateTransform attributeName="transform" type="translate" values="0,0; 80,-10; 160,-5" dur="9s" repeatCount="indefinite" />
                      </path>
                      {/* Bird 2 */}
                      <path d="M 180,45 Q 184,38 188,45 Q 192,38 196,45" fill="none" stroke="#2a2e34" strokeWidth="1" opacity="0.5">
                        <animateTransform attributeName="transform" type="translate" values="0,0; 90,-15; 180,-10" dur="11s" repeatCount="indefinite" />
                      </path>
                      {/* Bird 3 */}
                      <path d="M 150,75 Q 154,68 158,75 Q 162,68 166,75" fill="none" stroke="#2a2e34" strokeWidth="1" opacity="0.4">
                        <animateTransform attributeName="transform" type="translate" values="0,0; 75,-8; 150,-4" dur="10s" repeatCount="indefinite" />
                      </path>
                    </g>

                    {/* Swaying Trees on Left/Right */}
                    <g transform="translate(680, 240)">
                      {/* Trunk */}
                      <path d="M 30,110 Q 28,60 25,0" fill="none" stroke="#2a2e34" strokeWidth="3.5" />
                      {/* Leaves - Sway Animation */}
                      <g>
                        <animateTransform attributeName="transform" type="rotate" values="0 25 0; 3 25 0; -2 25 0; 0 25 0" dur="6s" repeatCount="indefinite" />
                        <circle cx="25" cy="0" r="30" fill="none" stroke="#2a2e34" strokeWidth="2" />
                        <circle cx="10" cy="-20" r="22" fill="none" stroke="#2a2e34" strokeWidth="1.5" />
                        <circle cx="40" cy="-10" r="25" fill="none" stroke="#2a2e34" strokeWidth="1.5" />
                      </g>
                    </g>

                    {/* Security Entrance Gate on Right background */}
                    <g transform="translate(480, 260)">
                      <rect x="0" y="50" width="12" height="40" fill="none" stroke="#2a2e34" strokeWidth="2" />
                      {/* Animated security barrier boom pole */}
                      <g transform="translate(6, 60)">
                        <line x1="0" y1="0" x2="-80" y2="0" stroke="#ffb300" strokeWidth="3" strokeDasharray="6,3">
                          <animateTransform 
                            attributeName="transform" 
                            type="rotate" 
                            values="0; -75; -75; 0" 
                            keyTimes="0; 0.25; 0.75; 1"
                            dur="8s" 
                            repeatCount="indefinite" 
                          />
                        </line>
                      </g>
                    </g>

                    {/* Ground and Roads */}
                    <line x1="0" y1="350" x2="800" y2="350" stroke="#2a2e34" strokeWidth="3.5" />
                    
                    {/* The Office Tech Park Building */}
                    <g transform="translate(60, 40)">
                      {/* Main Facade */}
                      <rect x="0" y="0" width="240" height="310" fill="none" stroke="#2a2e34" strokeWidth="2.5" />
                      {/* Corporate Name Decal */}
                      <text x="30" y="40" fill="#2a2e34" className="font-display font-black text-[11px] tracking-widest uppercase">TECH OVAL ONE</text>
                      <line x1="30" y1="48" x2="140" y2="48" stroke="#ffb300" strokeWidth="2.5" />
                      
                      {/* Office Windows */}
                      {Array.from({ length: 5 }).map((_, col) => 
                        Array.from({ length: 5 }).map((_, row) => (
                          <rect 
                            key={`win-${col}-${row}`} 
                            x={30 + col * 38} 
                            y={75 + row * 45} 
                            width="24" 
                            height="30" 
                            rx="2"
                            fill="none" 
                            stroke="#2a2e34" 
                            strokeWidth="1.2" 
                            opacity="0.2" 
                          />
                        ))
                      )}

                      {/* Glass Entrance door sliding */}
                      <g transform="translate(95, 260)">
                        <rect x="0" y="0" width="50" height="50" fill="none" stroke="#2a2e34" strokeWidth="2" />
                        <line x1="25" y1="0" x2="25" y2="50" stroke="#2a2e34" strokeWidth="1.5" />
                      </g>
                    </g>

                    {/* ==========================================
                        THE STOPPED MOTORBIKE & CHARACTERS
                        ========================================== */}
                    {/* Position: (x: 440, y: 260) */}
                    <g transform="translate(440, 260)">
                      
                      {/* 1. Wheels */}
                      <circle cx="-35" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="4.5" />
                      <circle cx="-35" cy="70" r="14" fill="none" stroke="#2a2e34" strokeWidth="1" />
                      <path d="M -35,70 L -48,60 M -35,70 L -22,60 M -35,70 L -35,88 M -35,70 L -49,76 M -35,70 L -21,76" stroke="#2a2e34" strokeWidth="1.5" />

                      <circle cx="35" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="4.5" />
                      <circle cx="35" cy="70" r="14" fill="none" stroke="#2a2e34" strokeWidth="1" />
                      <path d="M 35,70 L 22,60 M 35,70 L 48,60 M 35,70 L 35,88 M 35,70 L 21,76 M 35,70 L 49,76" stroke="#2a2e34" strokeWidth="1.5" />
                      <path d="M 20,62 Q 35,48 50,62" fill="none" stroke="#2a2e34" strokeWidth="2.5" strokeLinecap="round" />

                      {/* 2. Forks and suspension */}
                      <line x1="35" y1="70" x2="22" y2="28" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
                      <path d="M -22,51 L -22,68" stroke="#2a2e34" strokeWidth="4" strokeLinecap="round" />
                      <path d="M -24,53 Q -20,53 -22,55 Q -24,57 -22,59" fill="none" stroke="#ffb300" strokeWidth="1.8" />

                      {/* 3. Engine block & Side stand Down (Supporting the stopped bike) */}
                      <rect x="-10" y="58" width="24" height="16" rx="4" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.8" />
                      <line x1="-5" y1="74" x2="-14" y2="92" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />

                      {/* 4. Fuel Tank & Body Seat */}
                      <path d="M -18,36 Q -2,18 20,34 C 25,38 25,42 20,45 Q 1,47 -18,36 Z" fill="#2a2e34" stroke="#2a2e34" strokeWidth="1" />
                      <path d="M -12,32 Q 0,26 15,34" fill="none" stroke="#ffb300" strokeWidth="1.8" />
                      <path d="M -34,37 Q -22,33 -12,34 Q 1,36 8,41 L 8,44 Q -12,44 -34,37 Z" fill="#2a2e34" opacity="0.9" />

                      {/* Handlebars */}
                      <line x1="22" y1="28" x2="10" y2="25" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />

                      {/* ==========================================
                          ROHIT (HOST) - Removing Helmet
                          ========================================== */}
                      <g transform="translate(0, 0)">
                        <circle cx="0" cy="14" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.5" />
                        <path d="M 0,22 L -2,52" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Smile vector */}
                        <path d="M -2,15 Q 1,18 4,15" fill="none" stroke="#2a2e34" strokeWidth="1" />
                        
                        {/* Helmet being lifted off (gently float upward/fade) */}
                        <g>
                          <animateTransform 
                            attributeName="transform" 
                            type="translate" 
                            values="0,0; 0,-8; 0,-25; 15,-28" 
                            keyTimes="0; 0.2; 0.6; 1"
                            dur="4s" 
                            fill="freeze" 
                          />
                          <animate attributeName="opacity" values="1; 1; 0.7; 0.4" dur="4s" fill="freeze" />
                          <circle cx="0" cy="11" r="8.5" fill="#ffb300" stroke="#2a2e34" strokeWidth="1.5" />
                          <path d="M -4,8 L 6,8 Q 8,11 6,14 L -1,14 Z" fill="#2a2e34" /> {/* Visor */}
                        </g>

                        {/* Nodding effect */}
                        <animateTransform 
                          attributeName="transform" 
                          type="translate" 
                          values="0,0; 0,2; 0,-1; 0,0" 
                          begin="4.5s" 
                          dur="1s" 
                          repeatCount="1" 
                        />
                      </g>

                      {/* ==========================================
                          AMAN (GUEST) - Getting off, removing helmet, walking
                          ========================================== */}
                      <g>
                        {/* Animate Aman leaving the bike and walking to building */}
                        <animateTransform 
                          attributeName="transform" 
                          type="translate" 
                          values="0,0; -35,-10; -80,0; -160,20; -240,25" 
                          keyTimes="0; 0.15; 0.4; 0.7; 1"
                          dur="7s" 
                          begin="1.5s"
                          fill="freeze" 
                        />
                        <animate attributeName="opacity" values="1; 1; 1; 0.8; 0" keyTimes="0; 0.6; 0.8; 0.95; 1" dur="7s" begin="1.5s" fill="freeze" />

                        {/* Body */}
                        <circle cx="-16" cy="14" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.5" />
                        <path d="M -16,22 L -18,52" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
                        {/* Smile */}
                        <path d="M -15,15 Q -13,17 -11,15" fill="none" stroke="#2a2e34" strokeWidth="1" />

                        {/* Waving hand motion */}
                        <path d="M -16,30 L -28,15">
                          <animateTransform 
                            attributeName="transform" 
                            type="rotate" 
                            values="0 -16 30; -20 -16 30; 10 -16 30; 0 -16 30" 
                            begin="3.5s" 
                            dur="1.5s" 
                            repeatCount="2" 
                          />
                        </path>

                        {/* Helmet being lifted off */}
                        <g>
                          <animateTransform 
                            attributeName="transform" 
                            type="translate" 
                            values="0,0; 0,-10; 0,-28; -20,-30" 
                            keyTimes="0; 0.2; 0.6; 1"
                            dur="3.8s" 
                            fill="freeze" 
                          />
                          <animate attributeName="opacity" values="1; 1; 0.7; 0" dur="3.8s" fill="freeze" />
                          <circle cx="-16" cy="12" r="8.5" fill="#2a2e34" stroke="#ffb300" strokeWidth="1.5" />
                          <path d="M -20,9 L -10,9 Q -8,12 -10,15 L -17,15 Z" fill="#ffb300" opacity="0.9" /> {/* Amber Visor */}
                        </g>
                      </g>

                    </g>

                    {/* Speech Bubbles for friendly farewell */}
                    <g opacity="0">
                      <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.15; 0.85; 1" dur="4.5s" begin="2s" fill="freeze" />
                      <rect x="360" y="190" width="130" height="32" rx="8" fill="#2a2e34" />
                      <polygon points="415,222 420,230 425,222" fill="#2a2e34" />
                      <text x="425" y="209" textAnchor="middle" fill="#e9eaec" className="font-sans text-[8px] font-black">"Thank you, Rohit!"</text>
                    </g>
                    
                    <g opacity="0">
                      <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.15; 0.85; 1" dur="4s" begin="4.5s" fill="freeze" />
                      <rect x="450" y="190" width="130" height="32" rx="8" fill="#ffb300" />
                      <polygon points="505,222 510,230 515,222" fill="#ffb300" />
                      <text x="515" y="209" textAnchor="middle" fill="#2a2e34" className="font-sans text-[8px] font-black">"Anytime, Aman! TC."</text>
                    </g>

                  </svg>

                  {/* Absolute positioning overlay stats - fading in sequentially */}
                  <div className="absolute inset-x-0 bottom-6 px-6 flex flex-wrap justify-center gap-3">
                    <AnimatePresence>
                      {visibleStats >= 1 && (
                        <motion.div 
                          key="stat-completed"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-[#2a2e34] text-white font-mono text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md border border-white/5"
                        >
                          <span className="text-[#ffb300]">✓</span> RIDE COMPLETED
                        </motion.div>
                      )}
                      
                      {visibleStats >= 2 && (
                        <motion.div 
                          key="stat-arrival"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-[#2a2e34] text-white font-mono text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md border border-white/5"
                        >
                          <span className="text-[#ffb300]">✓</span> SAFE ARRIVAL
                        </motion.div>
                      )}

                      {visibleStats >= 3 && (
                        <motion.div 
                          key="stat-saved"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-[#ffb300] text-[#2a2e34] font-mono text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md"
                        >
                          <span>₹</span> YOU SAVED ₹340 TODAY
                        </motion.div>
                      )}

                      {visibleStats >= 4 && (
                        <motion.div 
                          key="stat-earned"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-[#ffb300] text-[#2a2e34] font-mono text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md"
                        >
                          <span>₹</span> HOST EARNED ₹180 TODAY
                        </motion.div>
                      )}

                      {visibleStats >= 5 && (
                        <motion.div 
                          key="stat-time"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-[#2a2e34] text-white font-mono text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md border border-white/5"
                        >
                          <span>⏱</span> TIME SAVED: 35 MINS
                        </motion.div>
                      )}

                      {visibleStats >= 6 && (
                        <motion.div 
                          key="stat-co2"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md"
                        >
                          <span>🌱</span> CO2 REDUCED: 4.2KG
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Subtitle card */}
                <div className="bg-[#2a2e34] text-[#e9eaec] p-3 sm:p-5 text-center flex flex-col items-center justify-center border-t border-white/5 space-y-1">
                  <span className="font-mono text-[8px] sm:text-[9px] font-black text-[#ffb300] tracking-widest uppercase">A NEW MORNING CONQUERED</span>
                  <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-tight text-[#e9eaec]/80">Aman arrives safely. Both take off their helmets and exchange smiles. The morning routine is conquered.</p>
                </div>

              </div>
            </motion.div>
          )}

          {/* ==========================================
              STAGE 2: ZOOM OUT & ROUTE GLOW (NETWORK)
              ========================================== */}
          {stage === "network_glow" && (
            <motion.div 
              key="network-stage"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6"
            >
              <div className="w-full max-w-4xl aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9] bg-[#2a2e34] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                
                {/* SVG Route Networks */}
                <div className="flex-1 w-full relative overflow-hidden bg-gradient-to-b from-[#1b1e22] to-[#2a2e34]">
                  
                  {/* Grid Lines background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px]" />

                  <svg viewBox="0 0 800 450" className="w-full h-full">
                    <defs>
                      <filter id="glow-bright" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Base city outline dots */}
                    <g opacity="0.15" stroke="#ffffff" strokeWidth="1">
                      <line x1="100" y1="100" x2="700" y2="100" strokeDasharray="3,6" />
                      <line x1="100" y1="200" x2="700" y2="200" strokeDasharray="3,6" />
                      <line x1="100" y1="300" x2="700" y2="300" strokeDasharray="3,6" />
                      <line x1="200" y1="50" x2="200" y2="400" strokeDasharray="3,6" />
                      <line x1="400" y1="50" x2="400" y2="400" strokeDasharray="3,6" />
                      <line x1="600" y1="50" x2="600" y2="400" strokeDasharray="3,6" />
                    </g>

                    {/* Main Commuted Route (Starts glowing first) */}
                    <path 
                      d="M 220,280 L 320,180 L 450,230" 
                      fill="none" 
                      stroke="#ffb300" 
                      strokeWidth="5.5" 
                      filter="url(#glow-bright)"
                      strokeLinecap="round"
                    >
                      <animate attributeName="stroke-dasharray" values="1000; 1000" dur="4s" />
                    </path>

                    {/* Dozens and Hundreds of Other Glowing Routes Drawing dynamically */}
                    <g stroke="#ffb300" strokeLinecap="round" opacity="0.9">
                      {/* Secondary Routes */}
                      <path d="M 120,80 L 260,140" fill="none" strokeWidth="2.5" filter="url(#glow-bright)">
                        <animate attributeName="stroke-dashoffset" values="300; 0" dur="2.5s" fill="freeze" />
                        <animate attributeName="stroke-dasharray" values="300" dur="1s" />
                      </path>

                      <path d="M 280,320 L 410,240 L 520,380" fill="none" strokeWidth="3" filter="url(#glow-bright)">
                        <animate attributeName="stroke-dashoffset" values="500; 0" dur="3s" begin="0.5s" fill="freeze" />
                        <animate attributeName="stroke-dasharray" values="500" dur="1s" />
                      </path>

                      <path d="M 540,110 L 680,180 L 620,320" fill="none" strokeWidth="2" filter="url(#glow-bright)">
                        <animate attributeName="stroke-dashoffset" values="400; 0" dur="2.8s" begin="0.8s" fill="freeze" />
                        <animate attributeName="stroke-dasharray" values="400" dur="1s" />
                      </path>

                      <path d="M 150,380 L 280,350 L 390,410" fill="none" strokeWidth="2.5" filter="url(#glow-bright)">
                        <animate attributeName="stroke-dashoffset" values="400; 0" dur="3.2s" begin="1.2s" fill="freeze" />
                        <animate attributeName="stroke-dasharray" values="400" dur="1s" />
                      </path>

                      <path d="M 450,80 L 590,50 L 720,140" fill="none" strokeWidth="2.8" filter="url(#glow-bright)">
                        <animate attributeName="stroke-dashoffset" values="500; 0" dur="3.5s" begin="1.5s" fill="freeze" />
                        <animate attributeName="stroke-dasharray" values="500" dur="1s" />
                      </path>
                    </g>

                    {/* Massive background web lines (hundreds of connections) */}
                    <g stroke="#ffb300" strokeWidth="0.8" opacity="0.4" strokeDasharray="2,5">
                      <line x1="260" y1="140" x2="280" y2="320" />
                      <line x1="320" y1="180" x2="410" y2="240" />
                      <line x1="450" y1="230" x2="540" y2="110" />
                      <line x1="680" y1="180" x2="520" y2="380" />
                      <line x1="280" y1="350" x2="320" y2="180" />
                      <line x1="590" y1="50" x2="680" y2="180" />
                    </g>

                    {/* Pulse dots simulating commuters moving along lines */}
                    <g fill="#ffb300">
                      <circle cx="220" cy="280" r="4" filter="url(#glow-bright)" />
                      <circle cx="450" cy="230" r="4.5" filter="url(#glow-bright)" />
                      <circle cx="260" cy="140" r="3" />
                      <circle cx="410" cy="240" r="3.5" />
                      <circle cx="680" cy="180" r="3" />
                      
                      {/* Animated commuter micro-dots traveling */}
                      <circle cx="0" cy="0" r="2.5">
                        <animateMotion path="M 120,80 L 260,140" dur="4s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="2.8">
                        <animateMotion path="M 280,320 L 410,240 L 520,380" dur="5s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="0" cy="0" r="2.2">
                        <animateMotion path="M 540,110 L 680,180" dur="4.2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  </svg>

                  {/* Text Manifestos Fading In */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-6 text-center space-y-2 sm:space-y-4 pointer-events-none bg-black/50">
                    <motion.h2 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="font-display font-black text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white uppercase tracking-tight max-w-md sm:max-w-2xl px-2"
                    >
                      "You're not watching one ride."
                    </motion.h2>

                    <motion.p 
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.8 }}
                      className="font-sans text-[10px] sm:text-xs md:text-sm lg:text-base text-[#ffb300] font-bold max-w-xs sm:max-w-xl px-2"
                    >
                      "You're watching the future of daily commuting."
                    </motion.p>
                  </div>

                </div>

                {/* Subtitle bottom card */}
                <div className="bg-[#1b1e22] text-[#e9eaec]/60 p-3 sm:p-5 text-center flex flex-col items-center justify-center border-t border-white/5 space-y-1">
                  <span className="font-mono text-[8px] sm:text-[9px] font-black text-[#ffb300] tracking-widest uppercase">CONNECTED PATHWAYS</span>
                  <p className="font-sans text-[10px] sm:text-[11px] text-[#e9eaec]/80 font-bold">Every route is integrated. Connecting daily routes for thousands of commuters.</p>
                </div>

              </div>
            </motion.div>
          )}

          {/* ==========================================
              STAGE 3: MEGA ZOOM & LOGO FORMATION
              ========================================== */}
          {stage === "logo_formation" && (
            <motion.div 
              key="logo-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#e9eaec]"
            >
              <div className="w-full max-w-4xl aspect-[4/3] xs:aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9] bg-[#e9eaec] border border-[#2a2e34]/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                
                <div className="flex-1 w-full relative overflow-hidden bg-gradient-to-b from-[#d8dadf]/20 to-[#e9eaec] flex items-center justify-center">
                  
                  {/* Background particle grids */}
                  <div className="absolute inset-0 bg-[radial-gradient(#2a2e340a_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70" />

                  {/* Glowing vector canvas drawing the MoveBuddy Logo */}
                  <svg viewBox="0 0 600 350" className="w-full max-w-lg aspect-video">
                    <defs>
                      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Pulse coordinates */}
                    <g stroke="#2a2e34" strokeWidth="1" strokeDasharray="3,6" opacity="0.25">
                      <circle cx="300" cy="175" r="140" fill="none" />
                      <circle cx="300" cy="175" r="90" fill="none" />
                      <line x1="300" y1="10" x2="300" y2="340" />
                      <line x1="100" y1="175" x2="500" y2="175" />
                    </g>

                    {/* Animated converging route paths morphing into the circle */}
                    <g fill="none" strokeLinecap="round">
                      {/* Left Route wrapping circle */}
                      <path 
                        d="M 120,175 A 180,180 0 1,1 480,175" 
                        stroke="#ffb300" 
                        strokeWidth="7" 
                        filter="url(#logo-glow)"
                      >
                        <animate attributeName="stroke-dasharray" values="0,1000; 1000,1000" dur="3s" fill="freeze" />
                      </path>

                      {/* Complete outer circle outline in bold Charcoal */}
                      <circle 
                        cx="300" 
                        cy="175" 
                        r="68" 
                        stroke="#2a2e34" 
                        strokeWidth="10" 
                      >
                        <animate attributeName="stroke-dasharray" values="0,500; 500,500" dur="2.8s" begin="0.2s" fill="freeze" />
                      </circle>

                      {/* Inner dot - pulsing and glowing */}
                      <circle 
                        cx="300" 
                        cy="175" 
                        r="18" 
                        fill="#ffb300" 
                        filter="url(#logo-glow)"
                      >
                        <animate attributeName="r" values="14; 19; 14" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>

                    {/* Pulsing City Pins converging */}
                    <g fill="#2a2e34">
                      <circle cx="210" cy="120" r="4" className="animate-ping" />
                      <circle cx="390" cy="230" r="4.5" className="animate-ping" />
                      <circle cx="160" cy="220" r="3.5" />
                      <circle cx="440" cy="120" r="4" />
                    </g>
                  </svg>

                  {/* Absolute subtle watermark */}
                  <div className="absolute bottom-12 text-center flex flex-col items-center">
                    <span className="font-display font-black text-lg tracking-[0.3em] text-[#2a2e34] uppercase">MOVEBUDDY</span>
                    <span className="font-mono text-[8px] font-bold text-[#2a2e34]/50 tracking-widest uppercase mt-1">Your Smart Daily Commute</span>
                  </div>

                </div>

                {/* Subtitle card */}
                <div className="bg-[#2a2e34] text-[#e9eaec]/60 p-3 sm:p-5 text-center flex flex-col items-center justify-center border-t border-white/5 space-y-1">
                  <span className="font-mono text-[8px] sm:text-[9px] font-black text-[#ffb300] tracking-widest uppercase">THE UNIFIED NETWORK</span>
                  <p className="font-sans text-[10px] sm:text-[11px] text-[#e9eaec]/80 font-bold">Daily commuting paths come together to shape the unified MoveBuddy community.</p>
                </div>

              </div>
            </motion.div>
          )}

          {/* ==========================================
              STAGE 4: TEXT MANIFESTO SLIDES
              ========================================== */}
          {stage === "manifesto" && (
            <motion.div 
              key="manifesto-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#e9eaec]"
            >
              <div className="w-full max-w-3xl text-center space-y-8 px-6">
                
                {/* Floating graphic element */}
                <div className="flex justify-center mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#ffb300] animate-ping" />
                </div>

                <AnimatePresence mode="wait">
                  {manifestoSlide === 0 && (
                    <motion.div
                      key="slide-0"
                      initial={{ opacity: 0, y: 35 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4"
                    >
                      <h3 className="font-mono text-[10px] font-black text-[#2a2e34]/40 uppercase tracking-[0.4em] mb-2">A BETTER WAY TO COMMUTE.</h3>
                      <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2a2e34] leading-tight uppercase tracking-tight">
                        "Every great workday<br />
                        begins with a<br />
                        <span className="text-[#ffb300]">better journey.</span>"
                      </h1>
                    </motion.div>
                  )}

                  {manifestoSlide === 1 && (
                    <motion.div
                      key="slide-1"
                      initial={{ opacity: 0, y: 35 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4"
                    >
                      <h3 className="font-mono text-[10px] font-black text-[#2a2e34]/40 uppercase tracking-[0.4em] mb-2">EVERY MORNING. MADE BETTER.</h3>
                      <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2a2e34] leading-tight uppercase tracking-tight">
                        One Ride.<br />
                        One Platform.<br />
                        <span className="text-[#ffb300]">One Smarter Commute.</span>
                      </h1>
                    </motion.div>
                  )}

                  {manifestoSlide === 2 && (
                    <motion.div
                      key="slide-2"
                      initial={{ opacity: 0, y: 35 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -25 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4"
                    >
                      <h3 className="font-mono text-[10px] font-black text-[#2a2e34]/40 uppercase tracking-[0.4em] mb-2">THE FUTURE OF DAILY COMMUTING.</h3>
                      <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#2a2e34] leading-tight uppercase tracking-tight">
                        The Journey<br />
                        Starts Here<br />
                        <span className="text-[#ffb300]">With MoveBuddy.</span>
                      </h1>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          )}

          {/* ==========================================
              STAGE 5: REVEAL FINAL CALL-TO-ACTION (CTA)
              ========================================== */}
          {stage === "cta" && (
            <motion.div 
              key="cta-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#e9eaec] overflow-y-auto"
            >
              <div className="w-full max-w-3xl text-center flex flex-col items-center justify-center space-y-6 py-7 md:py-12 relative">
                
                {/* 1. Centered MoveBuddy Logo assembling & breathing */}
                <div className="relative w-full max-w-xs h-28 flex items-center justify-center mb-1">
                  {/* Subtle route network background lines behind the logo */}
                  <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                    <defs>
                      <filter id="logo-glow-subtle" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    {/* Glowing golden routes */}
                    <path d="M 20,50 Q 100,20 180,50" stroke="#ffb300" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
                    <path d="M 50,80 Q 100,20 150,80" stroke="#2a2e34" strokeWidth="1" fill="none" opacity="0.3" />
                    
                    {/* Moving glowing particles */}
                    <circle cx="0" cy="0" r="2.2" fill="#ffb300" filter="url(#logo-glow-subtle)">
                      <animateMotion path="M 20,50 Q 100,20 180,50" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="0" cy="0" r="1.5" fill="#2a2e34">
                      <animateMotion path="M 50,80 Q 100,20 150,80" dur="6s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                  
                  {/* Breathing and assembling logo */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ 
                      scale: [0.96, 1.04, 0.96],
                      opacity: 1
                    }}
                    transition={{
                      scale: {
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      opacity: {
                        duration: 1.2,
                        ease: "easeOut"
                      }
                    }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    <div className="w-16 h-16 bg-[#2a2e34] rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 relative">
                      {/* Assembling path effect around the logo box */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                        <motion.rect
                          x="2"
                          y="2"
                          width="60"
                          height="60"
                          rx="21"
                          fill="none"
                          stroke="#ffb300"
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.4 }}
                        />
                      </svg>
                      <CircleDot className="w-8 h-8 text-[#ffb300]" />
                    </div>
                  </motion.div>
                </div>

                {/* 2. Headline Statement */}
                <div className="space-y-2 max-w-xl text-center">
                  <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#2a2e34] leading-tight tracking-tight uppercase">
                    Join MoveBuddy Early Access
                  </h1>
                  <p className="font-sans text-xs sm:text-sm text-[#2a2e34]/75 max-w-md mx-auto leading-relaxed font-medium">
                    Be among the first commuters shaping India's safest and smartest recurring mobility network.
                  </p>
                </div>

                {/* 3. Rounded Premium Floating Card rises */}
                <motion.div 
                  initial={{ y: 35, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md bg-[#2a2e34] border border-[#2a2e34]/10 p-5 sm:p-7 rounded-3xl shadow-2xl space-y-3.5 text-left text-white relative overflow-hidden"
                >
                  {/* Subtle card background grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

                  <div className="flex items-center gap-2 relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffb300] animate-ping" />
                    <span className="font-mono text-[9px] font-bold text-white/50 uppercase tracking-widest">
                      🚀 SECURE YOUR SPOT ON THE WAITLIST
                    </span>
                  </div>

                  <p className="text-[11px] text-white/75 leading-relaxed relative z-10 font-sans">
                    Help shape India's safest and smartest recurring commute platform. Enter your email to immediately reserve your slot.
                  </p>

                  {!isSubmitted ? (
                    <form onSubmit={handleSubmitEmail} className="space-y-3 relative z-10 w-full">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="email" 
                            required
                            placeholder="yourname@workplace.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#ffb300] focus:border-[#ffb300] transition-all"
                          />
                          <input 
                            type="tel" 
                            required
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#ffb300] focus:border-[#ffb300] transition-all"
                          />
                        </div>
                        
                        <button 
                          type="submit"
                          className="w-full bg-[#ffb300] hover:bg-[#ffb300]/95 text-[#2a2e34] text-xs font-black py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Join the Waitlist <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-2 py-1 text-center relative z-10 bg-white/5 rounded-2xl p-4 border border-white/5 w-full"
                    >
                      <div className="w-8 h-8 bg-[#ffb300]/10 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Check className="w-4 h-4 text-[#ffb300]" />
                      </div>
                      <h4 className="font-display font-black text-xs uppercase text-white tracking-wide">
                        WAITLIST SECURED!
                      </h4>
                      <p className="text-[10px] text-white/75 leading-relaxed max-w-xs mx-auto">
                        We are redirecting you to complete the coordinate onboarding questionnaire.
                      </p>
                      <a 
                        href="https://forms.gle/yNu2wQKQiTUi5fn17"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#ffb300] hover:underline mt-1"
                      >
                        Go to Survey Form <ExternalLink className="w-3 h-3" />
                      </a>
                    </motion.div>
                  )}
                </motion.div>

                {/* 4. Elegant Action Cards Below - Responsive 3-Column Grid */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="w-full max-w-md sm:max-w-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-left"
                >
                  {/* Follow Journey card */}
                  <a 
                    href="https://www.instagram.com/movebuddy.io?igsh=MWJmZmozajUxM3J0OA=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-[#2a2e34]/10 p-3.5 rounded-2xl shadow-sm hover:border-[#ffb300] transition-colors flex flex-col justify-between sm:h-24 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="p-1.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]/20 rounded-xl">
                        <Instagram className="w-3.5 h-3.5 text-[#2a2e34] group-hover:scale-110 transition-transform" />
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#2a2e34]/30 group-hover:text-[#2a2e34] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-[9px] tracking-wide text-[#2a2e34] uppercase">Instagram</h4>
                      <span className="text-[9px] font-mono font-bold text-[#2a2e34]/50">@movebuddy.io</span>
                    </div>
                  </a>

                  {/* Mail feedback card - directly clickable with mailto */}
                  <a 
                    href="mailto:Subratpradhan.mb@gmail.com"
                    className="bg-white border border-[#2a2e34]/10 p-3.5 rounded-2xl shadow-sm hover:border-[#ffb300] transition-colors flex flex-col justify-between sm:h-24 text-left group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="p-1.5 bg-[#ffb300]/10 rounded-xl">
                        <Mail className="w-3.5 h-3.5 text-[#2a2e34] group-hover:scale-110 transition-transform" />
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#2a2e34]/30 group-hover:text-[#2a2e34] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-[9px] tracking-wide text-[#2a2e34] uppercase">Email Us</h4>
                      <span className="text-[9px] font-mono font-bold text-[#2a2e34]/50 leading-none block truncate">
                        Subratpradhan.mb@gmail.com
                      </span>
                    </div>
                  </a>

                  {/* Phone feedback card - directly clickable with tel */}
                  <a 
                    href="tel:+918249089921"
                    className="bg-white border border-[#2a2e34]/10 p-3.5 rounded-2xl shadow-sm hover:border-[#ffb300] transition-colors flex flex-col justify-between sm:h-24 text-left group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="p-1.5 bg-[#ffb300]/10 rounded-xl">
                        <Phone className="w-3.5 h-3.5 text-[#2a2e34] group-hover:scale-110 transition-transform" />
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#2a2e34]/30 group-hover:text-[#2a2e34] transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-[9px] tracking-wide text-[#2a2e34] uppercase">Call Us</h4>
                      <span className="text-[9px] font-mono font-bold text-[#2a2e34]/50 leading-none block">
                        +91 82490 89921
                      </span>
                    </div>
                  </a>
                </motion.div>

                {/* ==========================================
                    5. THE VERY LAST MOTORBIKE ANIMATION
                    ========================================== */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="w-full max-w-md pt-8 flex flex-col items-center justify-center space-y-4 border-t border-[#2a2e34]/10 mt-6"
                >
                  <span className="font-display font-black text-sm text-[#2a2e34] tracking-wider uppercase">MOVEBUDDY</span>
                  
                  {/* Thin glowing yellow route line and tiny bike */}
                  <div className="w-full max-w-[260px] h-10 relative flex items-center justify-center">
                    <div className="absolute inset-x-0 bottom-4 h-[1.5px] bg-[#2a2e34]/10 rounded-full" />
                    
                    {/* Glowing active yellow road drawn from left-to-right */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.2, delay: 1.2, ease: "linear" }}
                      className="absolute left-0 bottom-4 h-[2px] bg-[#ffb300] shadow-[0_0_8px_#ffb300]"
                    />

                    {/* Tiny motorcycle riding across from left-to-right */}
                    <motion.div 
                      initial={{ left: 0 }}
                      animate={{ left: "calc(100% - 16px)" }}
                      transition={{ duration: 3.2, delay: 1.2, ease: "linear" }}
                      className="absolute bottom-4 mb-[-3px] z-10"
                    >
                      <svg viewBox="0 0 16 10" className="w-4 h-2.5">
                        <circle cx="2" cy="7" r="1.5" fill="#2a2e34" />
                        <circle cx="14" cy="7" r="1.5" fill="#2a2e34" />
                        <path d="M 2,7 L 6,7 L 10,4 L 14,7" stroke="#2a2e34" strokeWidth="1" fill="none" />
                        <path d="M 5,4 Q 8,2 11,4" stroke="#ffb300" strokeWidth="1" fill="none" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Words "See You On The Road" morphing from the animation */}
                  <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {tinyBikeFinished ? (
                        <motion.span 
                          key="see-you"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          className="font-display font-black text-[11px] text-[#2a2e34] tracking-widest uppercase"
                        >
                          "See You On The Road."
                        </motion.span>
                      ) : (
                        <motion.span 
                          key="riding-ride"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          className="font-mono text-[8px] font-bold text-[#2a2e34] tracking-widest uppercase"
                        >
                          Algorithm-Based Co-Commuting Engaged...
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                </motion.div>

                {/* Direct Google Form link */}
                <div className="pt-2 text-center">
                  <a 
                    href="https://forms.gle/yNu2wQKQiTUi5fn17"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2a2e34]/50 hover:text-[#ffb300] hover:underline"
                  >
                    Direct Coordinate Form: forms.gle/yNu2wQKQiTUi5fn17 <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

              </div>

              {/* ==========================================
                  6. FADE TO BLACK OVERLAY
                  ========================================== */}
              <AnimatePresence>
                {blackout && (
                  <motion.div 
                    key="blackout-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="text-center space-y-3"
                    >
                      <CircleDot className="w-10 h-10 text-[#ffb300] mx-auto animate-pulse" />
                      <h1 className="font-display font-black text-2xl text-[#e9eaec] tracking-widest uppercase">MOVEBUDDY</h1>
                      <p className="font-sans text-[11px] text-[#e9eaec]/60 max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
                        Thank you for exploring our vision of recurring mobility.
                      </p>
                      
                      <div className="pt-6 flex justify-center gap-4">
                        <button 
                          onClick={() => {
                            setBlackout(false);
                            setTinyBikeFinished(false);
                            setTimeout(() => {
                              // Trigger tiny bike redraw
                              setTinyBikeFinished(true);
                            }, 3500);
                          }}
                          className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white font-mono text-[9px] font-bold tracking-widest uppercase transition-all active:scale-95 cursor-pointer"
                        >
                          Stay on CTA Screen
                        </button>

                        <button 
                          onClick={handleRestart}
                          className="px-5 py-2.5 rounded-full bg-[#ffb300] hover:bg-[#ffb300]/95 text-[#2a2e34] font-mono text-[9px] font-black tracking-widest uppercase transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Replay Story
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
