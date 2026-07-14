import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  CreditCard, 
  Coins, 
  Clock, 
  Smartphone, 
  ShieldAlert, 
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Navigation,
  PhoneCall,
  Sparkles,
  CalendarDays,
  CircleDot
} from "lucide-react";
import { audio } from "../utils/audio";

interface StoryVisualizerProps {
  progress: number; // raw scroll progress (0 to 1)
  activeSceneOverride?: number; // legacy hook compatibility
}

interface CameraKeyframe {
  p: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Seamless Camera coordinates mapping one continuous vector universe
const keyframes: CameraKeyframe[] = [
  { p: 0.00, x: 400,  y: 300,  w: 1200, h: 900 },  // 0. High altitude India Map Network
  { p: 0.12, x: 150,  y: 105,  w: 500,  h: 375 },  // 1. Zoom into Aman's apartment window
  { p: 0.28, x: 150,  y: 105,  w: 500,  h: 375 },  // 1. Waking up / Cab surges
  { p: 0.42, x: 1150, y: 150,  w: 500,  h: 375 },  // 2. Fly across city skyline to Rohit's garage
  { p: 0.58, x: 1150, y: 150,  w: 500,  h: 375 },  // 2. Rohit's bike starting / headlight glows
  { p: 0.68, x: 650,  y: 650,  w: 600,  h: 450 },  // 3. Pan down to street level meeting
  { p: 0.74, x: 650,  y: 650,  w: 600,  h: 450 },  // 3. Helmet match / pin verification
  { p: 0.82, x: 650,  y: 1100, w: 500,  h: 375 },  // 4. Highway cinematic active commute
  { p: 0.87, x: 650,  y: 1100, w: 500,  h: 375 },  // 4. Floating HUD product features
  { p: 0.91, x: 150,  y: 1100, w: 500,  h: 375 },  // 5. Office destination park arrival
  { p: 0.95, x: 150,  y: 1100, w: 500,  h: 375 },  // 5. Office destination pause
  { p: 0.98, x: 400,  y: 300,  w: 1200, h: 900 },  // 6. Seamless zoom back out to India Network
  { p: 1.00, x: 400,  y: -400, w: 1200, h: 900 }   // 7. Pan up into final sky call-to-action
];

// Refined, high-focus camera coordinates specifically designed for vertical mobile screens
const mobileKeyframes: CameraKeyframe[] = [
  { p: 0.00, x: 400,  y: 300,  w: 1200, h: 900 },  // 0. High altitude India Map Network
  { p: 0.12, x: 180,  y: 170,  w: 260,  h: 195 },  // 1. Zoom into Aman's bedroom (sleeping commuter)
  { p: 0.22, x: 180,  y: 170,  w: 260,  h: 195 },  // 1. Aman waking up, checking options
  { p: 0.28, x: 210,  y: 100,  w: 360,  h: 270 },  // 1. Bedside phone & surge warning panel
  { p: 0.38, x: 210,  y: 100,  w: 360,  h: 270 },  // 1. Bedside phone & surge warning panel
  { p: 0.45, x: 1100, y: 90,   w: 410,  h: 307.5 },// 2. Rohit's garage, starting bike, match popup
  { p: 0.58, x: 1100, y: 90,   w: 410,  h: 307.5 },// 2. Rohit's garage, match popup
  { p: 0.65, x: 700,  y: 640,  w: 380,  h: 285 },  // 3. Street level meeting (Aman & Rohit meet)
  { p: 0.74, x: 700,  y: 640,  w: 380,  h: 285 },  // 3. Verification/badges
  { p: 0.80, x: 700,  y: 1100, w: 400,  h: 300 },  // 4. Highway active ride & HUD tags
  { p: 0.85, x: 700,  y: 1100, w: 400,  h: 300 },  // 4. Highway active ride & HUD tags
  { p: 0.89, x: 130,  y: 1110, w: 280,  h: 210 },  // 5. Office destination park arrival
  { p: 0.95, x: 130,  y: 1110, w: 280,  h: 210 },  // 5. Office destination pause
  { p: 0.98, x: 400,  y: 300,  w: 1200, h: 900 },  // 6. Seamless zoom back out to India Network
  { p: 1.00, x: 400,  y: -400, w: 1200, h: 900 }   // 7. Pan up into final sky
];

export default function StoryVisualizer({ progress, activeSceneOverride }: StoryVisualizerProps) {
  const [smoothProgress, setSmoothProgress] = useState(0);
  const lastTriggeredScene = useRef<number | null>(null);
  const playedWakeUp = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const targetProgressRef = useRef(progress);
  const smoothProgressRef = useRef(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Buttery-smooth inertial scroll interpolation (120FPS glide feeling)
  useEffect(() => {
    targetProgressRef.current = progress;
    
    if (!animatingRef.current) {
      let rAF: number;
      const update = () => {
        let cleanProgress = targetProgressRef.current;
        if (typeof cleanProgress !== "number" || isNaN(cleanProgress)) {
          cleanProgress = 0;
        }
        let target = cleanProgress;
        if (isMobile) {
          const steps = [0.0, 0.20, 0.35, 0.52, 0.68, 0.80, 0.89, 0.95, 1.0];
          for (let i = 0; i < steps.length - 1; i++) {
            const s = steps[i];
            const e = steps[i + 1];
            if (cleanProgress >= s && cleanProgress <= e) {
              const t = (cleanProgress - s) / (e - s);
              // Linger around the scene keyframes (flatten slope near boundaries)
              const tWarped = t - 0.15 * Math.sin(2 * Math.PI * t);
              target = s + (e - s) * Math.max(0, Math.min(1, tWarped));
              break;
            }
          }
        }
        
        const prev = smoothProgressRef.current;
        const diff = target - prev;
        
        if (isNaN(diff) || Math.abs(diff) < 0.0001) {
          smoothProgressRef.current = target;
          setSmoothProgress(target);
          animatingRef.current = false;
          return;
        }
        
        const next = prev + diff * (isMobile ? 0.06 : 0.08);
        const finalNext = isNaN(next) ? target : next;
        
        smoothProgressRef.current = finalNext;
        setSmoothProgress(finalNext);
        
        if (Math.abs(target - finalNext) >= 0.0001) {
          rAF = requestAnimationFrame(update);
        } else {
          animatingRef.current = false;
        }
      };
      animatingRef.current = true;
      rAF = requestAnimationFrame(update);
      return () => {
        cancelAnimationFrame(rAF);
        animatingRef.current = false;
      };
    }
  }, [progress, isMobile]);

  // Interpolated Viewbox Camera Calculation
  const getInterpolatedViewBox = () => {
    const p = smoothProgress;
    const activeKeyframes = isMobile ? mobileKeyframes : keyframes;
    
    // Find enclosing keyframes
    let left = activeKeyframes[0];
    let right = activeKeyframes[activeKeyframes.length - 1];
    
    for (let i = 0; i < activeKeyframes.length - 1; i++) {
      if (p >= activeKeyframes[i].p && p <= activeKeyframes[i + 1].p) {
        left = activeKeyframes[i];
        right = activeKeyframes[i + 1];
        break;
      }
    }
    
    const range = right.p - left.p;
    const factor = range > 0 ? (p - left.p) / range : 0;
    
    // Smooth easing interpolation for camera movement
    const t = factor * factor * (3 - 2 * factor); // smoothstep
    
    let x = left.x + (right.x - left.x) * t;
    let y = left.y + (right.y - left.y) * t;
    let w = left.w + (right.w - left.w) * t;
    let h = left.h + (right.h - left.h) * t;
    
    // Professional Google-tier design layout fix for portrait and narrow screens (mobile):
    // Dynamically expand the viewBox height to match the window's exact tall aspect ratio
    // so there is zero empty space/letterboxing, and lift the content vertically upwards so
    // it sits beautifully in the upper-middle region, leaving plenty of room for the text overlay.
    if (typeof window !== "undefined") {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const containerRatio = winW / winH;
      const baseRatio = w / h; // e.g., 4/3 = 1.333
      
      if (containerRatio < baseRatio) {
        const originalH = h;
        const newH = w / containerRatio; // calculate matching tall height
        
        const centerY = y + originalH / 2;
        
        // Only offset the drawings upward during the interactive storytelling scenes.
        // During the opening and closing overview scenes, center them cleanly.
        const isMiddleScene = p >= 0.10 && p <= 0.94;
        const mobileYOffset = isMiddleScene ? newH * 0.18 : 0; // shift viewBox down, moving drawing UP
        
        y = (centerY - newH / 2) + mobileYOffset;
        h = newH;
      }
    }
    
    return `${x} ${y} ${w} ${h}`;
  };

  // Synchronize browser sound synthesis based on camera progress
  useEffect(() => {
    try {
      const p = smoothProgress;
      // Alarm condition: only between 0.12 and 0.20 (before Aman wakes up and turns it off)
      if (p >= 0.12 && p < 0.20) {
        audio.startAlarm();
        playedWakeUp.current = false;
      } else {
        audio.stopAlarm();
      }

      // Wake up chime trigger: exactly when he wakes up (transitioning past 0.20)
      if (p >= 0.20 && p < 0.35) {
        if (!playedWakeUp.current) {
          audio.playWakeUpChime();
          playedWakeUp.current = true;
        }
      }
      if (p < 0.12) {
        playedWakeUp.current = false;
      }

      // Engine conditions
      const arrivalThreshold = isMobile ? 0.89 : 0.91;
      if (p >= 0.42 && p < 0.58) {
        // Starts his bike
        audio.startEngine();
        audio.updateEngineRPM(0.3);
      } else if (p >= 0.58 && p < 0.70) {
        // Met up
        audio.updateEngineRPM(0.1);
      } else if (p >= 0.70 && p < arrivalThreshold) {
        // Commuting! Pitch revs high
        audio.startEngine();
        audio.updateEngineRPM(0.7);
      } else if (p >= arrivalThreshold && p < 0.95) {
        // Arrives
        audio.stopEngine();
      } else {
        audio.stopEngine();
      }

      // Arrival trigger (payment ding on arrival point)
      if (p >= arrivalThreshold && p < (arrivalThreshold + 0.02) && lastTriggeredScene.current !== 5) {
        audio.playPaymentDing();
        lastTriggeredScene.current = 5;
      }
      if (p < arrivalThreshold || p >= (arrivalThreshold + 0.02)) {
        if (lastTriggeredScene.current === 5) {
          lastTriggeredScene.current = null;
        }
      }
    } catch (err) {
      console.warn("Audio trigger error:", err);
    }
  }, [smoothProgress]);

  // Define some constant route coordinates across Bangalore Tech Corridors map
  const blrLocations = [
    { name: "Manyata Tech Park", x: 820, y: 350, id: "manyata" },
    { name: "Bagmane Tech Park", x: 920, y: 520, id: "bagmane" },
    { name: "ITPL", x: 1140, y: 510, id: "itpl" },
    { name: "Whitefield", x: 1160, y: 590, id: "whitefield" },
    { name: "Marathahalli", x: 1080, y: 680, id: "marathahalli" },
    { name: "Outer Ring Road", x: 970, y: 720, id: "orr" },
    { name: "Bellandur", x: 1000, y: 780, id: "bellandur" },
    { name: "RMZ Ecospace", x: 1020, y: 840, id: "ecospace" },
    { name: "Embassy TechVillage", x: 1060, y: 900, id: "etv" },
    { name: "Electronic City", x: 920, y: 1030, id: "ecity" },
    { name: "Global Village Tech Park", x: 620, y: 860, id: "globalvillage" }
  ];

  // Map route lines connecting tech corridors in Bangalore
  const blrRoutes = [
    { from: "manyata", to: "bagmane" },
    { from: "bagmane", to: "orr" },
    { from: "orr", to: "bellandur" },
    { from: "bellandur", to: "ecospace" },
    { from: "ecospace", to: "etv" },
    { from: "etv", to: "ecity" },
    { from: "orr", to: "globalvillage" },
    { from: "globalvillage", to: "ecity" },
    { from: "bagmane", to: "marathahalli" },
    { from: "marathahalli", to: "whitefield" },
    { from: "whitefield", to: "itpl" },
    { from: "marathahalli", to: "bellandur" }
  ];

  // Floating ambient wind/sparkles particles
  const [particles, setParticles] = useState<{id: number, x: number, y: number, size: number, speed: number}[]>([]);
  useEffect(() => {
    const list = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 2000,
      y: Math.random() * 1600,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1
    }));
    setParticles(list);
  }, []);

  return (
    <div id="cinematic-viewport" className="w-full h-full relative overflow-hidden select-none select-none text-[#2a2e34]">
      
      {/* 120fps smooth particle flow background */}
      <div className="absolute inset-0 bg-[#e9eaec] pointer-events-none" />

      {/* Main SVG continuous viewport */}
      <svg 
        id="master-canvas-svg"
        viewBox={getInterpolatedViewBox()} 
        className="w-full h-full relative z-10 transition-shadow duration-500"
        style={{ contentVisibility: "auto" }}
      >
        <defs>
          {/* Subtle drop shadow for floating tags */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2a2e34" floodOpacity="0.1" />
          </filter>
          <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="silver-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d8dadf" />
            <stop offset="100%" stopColor="#e9eaec" />
          </linearGradient>
          <style>{`
            @keyframes bike-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes exhaust-puff-1 {
              0% { transform: translate(0, 0) scale(0.4); opacity: 0.7; }
              50% { transform: translate(-12px, -6px) scale(1.1); opacity: 0.4; }
              100% { transform: translate(-24px, -12px) scale(1.6); opacity: 0; }
            }
            @keyframes exhaust-puff-2 {
              0% { transform: translate(0, 0) scale(0.3); opacity: 0.5; }
              40% { transform: translate(-15px, -4px) scale(1.0); opacity: 0.3; }
              100% { transform: translate(-30px, -8px) scale(1.5); opacity: 0; }
            }
            @keyframes road-dust-1 {
              0% { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0.4; }
              50% { transform: translate(-18px, 6px) scale(1.2) rotate(45deg); opacity: 0.2; }
              100% { transform: translate(-36px, 12px) scale(2.0) rotate(90deg); opacity: 0; }
            }
            @keyframes road-dust-2 {
              0% { transform: translate(0, 0) scale(0.5) rotate(0deg); opacity: 0.3; }
              60% { transform: translate(-22px, 4px) scale(1.4) rotate(-30deg); opacity: 0.15; }
              100% { transform: translate(-45px, 8px) scale(2.2) rotate(-60deg); opacity: 0; }
            }
            @keyframes phone-vibrate {
              0% { transform: translate(320px, 125px) translate(0, 0); }
              25% { transform: translate(320px, 125px) translate(-1.5px, 1px); }
              50% { transform: translate(320px, 125px) translate(1.5px, -1px); }
              75% { transform: translate(320px, 125px) translate(-1px, -1px); }
              100% { transform: translate(320px, 125px) translate(1px, 1px); }
            }
            @keyframes bike-engine-vibrate {
              0% { transform: translate(160px, 130px) translate(0, 0); }
              50% { transform: translate(160px, 130px) translate(0, -1.5px); }
              100% { transform: translate(160px, 130px) translate(0, 1.5px); }
            }
            .bike-wheel-spin {
              animation: bike-spin 0.35s linear infinite;
              transform-origin: center;
              will-change: transform;
            }
            .exhaust-puff-1 {
              animation: exhaust-puff-1 1s ease-out infinite;
              transform-origin: center;
              will-change: transform;
            }
            .exhaust-puff-2 {
              animation: exhaust-puff-2 1.4s ease-out infinite;
              animation-delay: 0.5s;
              transform-origin: center;
              will-change: transform;
            }
            .road-dust-1 {
              animation: road-dust-1 0.7s ease-out infinite;
              transform-origin: center;
              will-change: transform;
            }
            .road-dust-2 {
              animation: road-dust-2 1s ease-out infinite;
              animation-delay: 0.35s;
              transform-origin: center;
              will-change: transform;
            }
            .alarm-vibrate {
              animation: phone-vibrate 0.15s linear infinite;
              transform-origin: center;
              will-change: transform;
            }
            .bike-vibrate {
              animation: bike-engine-vibrate 0.08s linear infinite alternate;
              transform-origin: center;
              will-change: transform;
            }
          `}</style>
        </defs>

        {/* Ambient background grids */}
        <g opacity={isMobile ? "0.07" : "0.15"}>
          <path d="M 0,0 L 2000,0 M 0,200 L 2000,200 M 0,400 L 2000,400 M 0,600 L 2000,600 M 0,800 L 2000,800 M 0,1000 L 2000,1000 M 0,1200 L 2000,1200 M 0,1400 L 2000,1400" stroke="#2a2e34" strokeWidth="0.5" strokeDasharray="5,5" />
          <path d="M 0,0 L 0,1600 M 200,0 L 200,1600 M 400,0 L 400,1600 M 600,0 L 600,1600 M 800,0 L 800,1600 M 1000,0 L 1000,1600 M 1200,0 L 1200,1600 M 1400,0 L 1400,1600 M 1600,0 L 1600,1600 M 1800,0 L 1800,1600" stroke="#2a2e34" strokeWidth="0.5" strokeDasharray="5,5" />
        </g>

        {/* ==========================================
            STAGE BACKGROUND SKYLINE (Charcoal silhouettes)
            ========================================== */}
        <g id="city-skyline" opacity={isMobile ? "0.05" : "0.25"}>
          {/* Distant building lines */}
          <rect x="100" y="240" width="80" height="200" fill="#2a2e34" rx="4" />
          <rect x="230" y="190" width="120" height="250" fill="#2a2e34" rx="6" />
          <rect x="380" y="220" width="70" height="220" fill="#2a2e34" rx="3" />
          <rect x="470" y="150" width="110" height="290" fill="#2a2e34" rx="8" />
          
          <rect x="800" y="200" width="90" height="240" fill="#2a2e34" rx="4" />
          <rect x="940" y="160" width="140" height="280" fill="#2a2e34" rx="6" />
          <rect x="1110" y="220" width="80" height="220" fill="#2a2e34" rx="3" />
          <rect x="1240" y="140" width="120" height="300" fill="#2a2e34" rx="8" />

          {/* Elevated Metro Track Cross-linking the city */}
          <path d="M 0,280 L 2000,280" stroke="#2a2e34" strokeWidth="6" strokeDasharray="15,10" />
          <path d="M 0,285 L 2000,285" stroke="#2a2e34" strokeWidth="2" />
          {/* Metro pillars */}
          <rect x="150" y="285" width="12" height="160" fill="#2a2e34" opacity="0.4" />
          <rect x="500" y="285" width="12" height="160" fill="#2a2e34" opacity="0.4" />
          <rect x="850" y="285" width="12" height="160" fill="#2a2e34" opacity="0.4" />
          <rect x="1200" y="285" width="12" height="160" fill="#2a2e34" opacity="0.4" />
          <rect x="1550" y="285" width="12" height="160" fill="#2a2e34" opacity="0.4" />

          {/* Gliding Metro Train (controlled by progress for dynamic life) */}
          <g transform={`translate(${(smoothProgress * 3200) % 2400 - 300}, 265)`}>
            <rect width="180" height="12" fill="#2a2e34" rx="4" />
            <rect x="10" y="2" width="20" height="5" fill="#e9eaec" />
            <rect x="35" y="2" width="20" height="5" fill="#e9eaec" />
            <rect x="60" y="2" width="20" height="5" fill="#e9eaec" />
            <rect x="85" y="2" width="20" height="5" fill="#e9eaec" />
            <rect x="110" y="2" width="20" height="5" fill="#e9eaec" />
            <rect x="135" y="2" width="20" height="5" fill="#e9eaec" />
            <circle cx="170" cy="6" r="3" fill="#ffb300" /> {/* Glowing yellow indicator */}
          </g>
        </g>

        {/* Ambient clouds drifting */}
        <g opacity="0.3">
          <path d="M 200,80 Q 230,60 260,80 Q 290,70 310,90 Q 330,110 300,120 L 190,120 Z" fill="#d8dadf" transform={`translate(${(smoothProgress * 150) % 300}, 0)`} />
          <path d="M 1200,60 Q 1230,40 1260,60 Q 1290,50 1310,70 Q 1330,90 1300,100 L 1190,100 Z" fill="#d8dadf" transform={`translate(${-(smoothProgress * 100) % 200}, 20)`} />
        </g>


        {/* ==========================================
            SCENE 0 & 6: OUTLINE MAP OF INDIA & NETWORKS
            ========================================== */}
        <g id="blr-network-scene" opacity={smoothProgress < 0.15 || smoothProgress > 0.95 ? 1 : 0.05} style={{ transition: "opacity 0.6s" }}>
          {/* Stylized geometric background network of Bangalore tech highway arteries */}
          <path 
            d="M 620,860 L 920,1030 L 1060,900 L 1020,840 L 1000,780 L 970,720 L 1080,680 L 1160,590 L 1140,510 L 920,520 L 820,350 Z" 
            fill="none" 
            stroke="#2a2e34" 
            strokeWidth={isMobile ? "5.5" : "3"} 
            strokeLinejoin="round" 
            strokeDasharray={smoothProgress < 0.03 ? "1000" : "none"}
            style={{ transition: "stroke-dashoffset 2s ease-out" }}
          />
          <path 
            d="M 820,350 L 970,720 M 920,520 L 1140,510 L 1080,680 M 1080,680 L 1000,780 M 620,860 L 1020,840" 
            fill="none" 
            stroke="#2a2e34" 
            strokeWidth={isMobile ? "2" : "1"} 
            opacity="0.3" 
          />

          {/* Dynamic route lines between Bangalore tech park nodes */}
          {blrRoutes.map((line, idx) => {
            const start = blrLocations.find(c => c.id === line.from);
            const end = blrLocations.find(c => c.id === line.to);
            if (!start || !end) return null;
            return (
              <g key={`route-${idx}`}>
                {/* Backing structural path */}
                <line 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="#2a2e34" 
                  strokeWidth={isMobile ? "2.5" : "1.5"} 
                  opacity="0.2" 
                />
                {/* Active glowing yellow route line overlay */}
                <line 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="#ffb300" 
                  strokeWidth={isMobile ? "5.5" : "3.5"} 
                  strokeLinecap="round"
                  filter="url(#glow-yellow)"
                  strokeDasharray="12,12"
                  opacity={smoothProgress < 0.10 || smoothProgress > 0.95 ? 0.9 : 0}
                  className="animate-route-pulse"
                  style={{ 
                    strokeDashoffset: (smoothProgress * -400) % 200,
                    transition: "opacity 0.5s" 
                  }}
                />
              </g>
            );
          })}

          {/* Glowing Bangalore Tech Park Nodes */}
          {blrLocations
            .filter((loc) => {
              // Hide non-essential nodes on mobile to simplify density and ensure clear readability
              if (isMobile) {
                return ["manyata", "etv", "ecity", "whitefield", "itpl"].includes(loc.id);
              }
              return true;
            })
            .map((loc) => (
              <g key={`loc-${loc.id}`} transform={`translate(${loc.x}, ${loc.y})`}>
                <circle r={isMobile ? "16" : "12"} fill="#ffb300" opacity="0.12" className="animate-ping" />
                <circle r={isMobile ? "8" : "6"} fill="#ffb300" filter="url(#glow-yellow)" />
                <circle r={isMobile ? "4" : "3"} fill="#2a2e34" />
                
                {/* Location names labeled elegantly in display font - larger and highly readable on mobile */}
                <text 
                  y={isMobile ? "-16" : "-12"} 
                  textAnchor="middle" 
                  fill="#2a2e34" 
                  className="font-mono text-[13px] sm:text-[9px] font-black"
                  letterSpacing={isMobile ? "0.5" : "1"}
                  style={{ textShadow: "0px 1px 2px rgba(233, 234, 236, 0.95)" }}
                >
                  {loc.name.toUpperCase()}
                </text>
              </g>
            ))}
        </g>


        {/* ==========================================
            SEQUENCE 1: AMAN'S BEDROOM (Zoomed state)
            ========================================== */}
        <g id="aman-bedroom" transform="translate(100, 100)">
          {/* Room boundaries */}
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="#2a2e34" strokeWidth="2.5" rx="10" />
          
          {/* Window & sway curtains */}
          <rect x="50" y="40" width="80" height="90" fill="#d8dadf" rx="3" />
          <line x1="90" y1="40" x2="90" y2="130" stroke="#2a2e34" strokeWidth="1" />
          <line x1="50" y1="85" x2="130" y2="85" stroke="#2a2e34" strokeWidth="1" />
          {/* Left Curtain */}
          <path 
            d={`M 50,40 Q ${55 + Math.sin(smoothProgress * 15) * 5},85 65,130 L 50,130 Z`} 
            fill="#2a2e34" 
            opacity="0.15" 
          />
          {/* Right Curtain */}
          <path 
            d={`M 130,40 Q ${125 - Math.sin(smoothProgress * 15) * 5},85 115,130 L 130,130 Z`} 
            fill="#2a2e34" 
            opacity="0.15" 
          />

          {/* Alarm table and vibrating clock */}
          <rect x="300" y="140" width="40" height="60" fill="none" stroke="#2a2e34" strokeWidth="2" rx="4" />
          <line x1="300" y1="165" x2="340" y2="165" stroke="#2a2e34" strokeWidth="1" />
          
          {/* Vibrating Alarm Phone */}
          <g 
            className={smoothProgress >= 0.12 && smoothProgress < 0.20 ? "alarm-vibrate" : ""}
            transform="translate(320, 125)"
            style={{ transformOrigin: "center" }}
          >
            {/* Phone body */}
            <rect x="-8" y="-15" width="16" height="30" rx="3" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.5" />
            
            {/* Phone screen */}
            <rect x="-6" y="-13" width="12" height="26" rx="1.5" fill={smoothProgress >= 0.12 && smoothProgress < 0.20 ? "#ffb300" : "#2a2e34"} opacity={smoothProgress >= 0.12 && smoothProgress < 0.20 ? "0.9" : "0.15"} />
            
            {/* Details */}
            <line x1="-2" y1="-14" x2="2" y2="-14" stroke="#2a2e34" strokeWidth="1" />
            <circle cx="0" cy="14" r="1" fill="#2a2e34" />

            {/* Pulsing alarm soundwaves directly around the phone body */}
            {smoothProgress >= 0.12 && smoothProgress < 0.20 && (
              <g opacity="0.85" stroke="#ffb300" strokeWidth="1.2" fill="none">
                <path d="M -13,-6 Q -18,0 -13,6" />
                <path d="M -17,-11 Q -24,0 -17,11" />
                <path d="M 13,-6 Q 18,0 13,6" />
                <path d="M 17,-11 Q 24,0 17,11" />
              </g>
            )}
          </g>

          {/* Minimal bed & sleeping commuter (Aman) */}
          <g transform="translate(140, 150)">
            {/* Bedframe */}
            <rect x="0" y="30" width="150" height="20" fill="none" stroke="#2a2e34" strokeWidth="2.5" rx="3" />
            <line x1="10" y1="50" x2="10" y2="65" stroke="#2a2e34" strokeWidth="2.5" />
            <line x1="140" y1="50" x2="140" y2="65" stroke="#2a2e34" strokeWidth="2.5" />

            {/* Pillow */}
            <rect x="15" y="15" width="25" height="15" fill="#d8dadf" stroke="#2a2e34" strokeWidth="1.5" rx="2" />

            {/* Waking sequence based on progress stages */}
            {smoothProgress < 0.16 ? (
              // Stage 1 & 2: Sleeping & Alarm Rings (0.00 - 0.16)
              <g id="figure-sleeping">
                <circle cx="27" cy="12" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
                <path d="M 35,28 L 130,28" stroke="#2a2e34" strokeWidth="5" strokeLinecap="round" /> {/* blanket */}
                <path d="M 25,28 Q 75,22 135,28" fill="#2a2e34" opacity="0.15" />
                {smoothProgress >= 0.12 && (
                  <text x="35" y="-5" className="font-mono text-[10px] font-black fill-[#ffb300] animate-pulse">!? Zzz... !?</text>
                )}
              </g>
            ) : smoothProgress < 0.20 ? (
              // Stage 3: Reaching to turn off alarm (0.16 - 0.20)
              <g id="figure-reaching">
                {/* Slightly raised head */}
                <circle cx="32" cy="8" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
                <path d="M 38,28 L 130,28" stroke="#2a2e34" strokeWidth="5" strokeLinecap="round" /> {/* blanket */}
                {/* Arm reaching far right towards the alarm clock table */}
                <path d="M 38,18 Q 90,10 145,0" fill="none" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />
                <text x="50" y="-10" className="font-mono text-[8px] font-bold fill-[#2a2e34]/70">Waking up...</text>
              </g>
            ) : smoothProgress < 0.24 ? (
              // Stage 4: Sits up (0.20 - 0.24)
              <g id="figure-sitting">
                <circle cx="45" cy="-2" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
                {/* Sitting up torso */}
                <path d="M 45,6 L 45,30 L 130,30" stroke="#2a2e34" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 45,15 Q 60,20 70,25" fill="none" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" /> {/* arm resting */}
                <text x="60" y="-12" className="font-mono text-[8px] font-bold fill-[#2a2e34]/70">Yawn...</text>
              </g>
            ) : (
              // Stage 5: Sits up, picks up phone and looks at commute options (0.24 - 0.35)
              <g id="figure-checking-phone">
                <circle cx="45" cy="-2" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
                {/* Sitting up torso */}
                <path d="M 45,6 L 45,30 L 130,30" stroke="#2a2e34" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Arm holding a tiny glowing phone */}
                <path d="M 45,15 L 68,10" fill="none" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />
                {/* Glowing phone rect */}
                <rect x="68" y="2" width="6" height="12" rx="1" fill="#ffb300" stroke="#2a2e34" strokeWidth="1" />
                {/* Tiny light beam */}
                <polygon points="74,5 110,-5 110,20 74,11" fill="#ffb300" opacity="0.15" />
                
                <text x="58" y="-12" className="font-mono text-[8px] font-black fill-[#ffb300] tracking-tight">OPTIONS?</text>
              </g>
            )}
          </g>

          {/* Subtle curved leader line connecting phone on table to floating surge HUD */}
          <path
            d={isMobile ? "M 320,125 L 320,115" : "M 320,125 Q 335,120 350,115"}
            fill="none"
            stroke="#ff4444"
            strokeWidth={isMobile ? "2" : "1.5"}
            strokeDasharray="4,4"
            opacity={smoothProgress >= 0.24 && smoothProgress < 0.42 ? 0.65 : 0}
            style={{ transition: "opacity 0.4s ease-out" }}
          />

          {/* Floating glowing Phone Surges panel - visible at 24% scroll progress after yawn */}
          <g 
            transform={`translate(${isMobile ? 245 : 285}, 15)`} 
            opacity={smoothProgress >= 0.24 && smoothProgress < 0.42 ? 1 : 0}
            style={{ transition: "opacity 0.4s ease-out" }}
          >
            {/* Glassmorphic card frame - widened to 170 to fully prevent clipping and overlapping */}
            <rect width="170" height="100" fill="#e9eaec" fillOpacity="0.95" stroke="#2a2e34" strokeWidth="2" rx="12" filter="url(#shadow)" />
            
            {/* Header with clean top-rounded path */}
            <path d="M 1,11 A 10,10 0 0,1 11,1 L 159,1 A 10,10 0 0,1 169,11 L 169,22 L 1,22 Z" fill="#ff4444" />
            <text x="85" y="14" textAnchor="middle" fill="#e9eaec" className="font-mono text-[7.5px] font-black tracking-wider">08:12 AM • SURGE WARNING</text>

            {/* Red phone notification indicator */}
            <circle cx="158" cy="11" r="3" fill="#ffffff" />

            {/* Pricing rows in an elegant, non-overlapping 2-column layout */}
            <g transform="translate(12, 0)">
              {/* Row 1: Cab Fare */}
              <text y="38" fill="#2a2e34" opacity="0.5" className="font-sans text-[8px] font-bold uppercase tracking-wider">Cab Fare</text>
              <text x="146" y="38" textAnchor="end" fill="#ff4444" className="font-mono text-[9.5px] font-black tracking-wide" filter="url(#glow-yellow)">₹520 ⚠️</text>
              <line x1="0" y1="46" x2="146" y2="46" stroke="#2a2e34" strokeWidth="0.75" opacity="0.1" />

              {/* Row 2: Ride Status */}
              <text y="58" fill="#2a2e34" opacity="0.5" className="font-sans text-[8px] font-bold uppercase tracking-wider">Ride Status</text>
              <text x="146" y="58" textAnchor="end" fill="#ff4444" className="font-mono text-[8px] font-black uppercase tracking-wide">Cancelled</text>
              <line x1="0" y1="66" x2="146" y2="66" stroke="#2a2e34" strokeWidth="0.75" opacity="0.1" />

              {/* Row 3: Bike Status */}
              <text y="78" fill="#2a2e34" opacity="0.5" className="font-sans text-[8px] font-bold uppercase tracking-wider">Bike Status</text>
              <text x="146" y="78" textAnchor="end" fill="#ff4444" className="font-mono text-[8px] font-black uppercase tracking-wide">High Demand</text>
            </g>
          </g>
        </g>


        {/* ==========================================
            SEQUENCE 2: ROHIT'S GARAGE (Zoomed state)
            ========================================== */}
        <g id="rohits-garage" transform="translate(1100, 100)">
          {/* Garage boundary */}
          <rect x="20" y="20" width="360" height="260" fill="none" stroke="#2a2e34" strokeWidth="2.5" rx="10" />
          
          {/* Hanging workspace industrial lamp */}
          <line x1="200" y1="20" x2="200" y2="70" stroke="#2a2e34" strokeWidth="1.5" />
          <path d="M 185,70 L 215,70 L 205,82 L 195,82 Z" fill="#2a2e34" />
          {/* Golden lamp glowing cone */}
          <polygon 
            points="200,82 140,240 260,240" 
            fill="#ffb300" 
            fillOpacity={smoothProgress > 0.44 && smoothProgress < 0.60 ? 0.08 : 0.02} 
            style={{ transition: "fill-opacity 0.5s" }}
          />

          {/* Tool shelf lines */}
          <line x1="40" y1="90" x2="110" y2="90" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />
          <rect x="50" y="70" width="12" height="20" fill="none" stroke="#2a2e34" opacity="0.4" />
          <rect x="75" y="65" width="18" height="25" fill="none" stroke="#2a2e34" opacity="0.4" />

          {/* Rohit starting his bike (vibrates when engine starts) */}
          <g 
            className={smoothProgress > 0.48 && smoothProgress < 0.60 ? "bike-vibrate" : ""}
            transform="translate(160, 130)"
            style={{ transformOrigin: "center" }}
          >
            {/* 1. Rear Wheel Assembly */}
            <circle cx="30" cy="70" r="22" fill="none" stroke="#2a2e34" strokeWidth="4.5" />
            <circle cx="30" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <circle cx="30" cy="70" r="7" fill="#2a2e34" />
            {/* Alloy Spokes (Sporty 5-spoke layout) */}
            <path d="M 30,70 L 15,58 M 30,70 L 45,58 M 30,70 L 30,92 M 30,70 L 13,78 M 30,70 L 47,78" stroke="#2a2e34" strokeWidth="1.8" />

            {/* 2. Front Wheel Assembly */}
            <circle cx="130" cy="70" r="22" fill="none" stroke="#2a2e34" strokeWidth="4.5" />
            <circle cx="130" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <circle cx="130" cy="70" r="8" fill="none" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M 130,70 L 115,58 M 130,70 L 145,58 M 130,70 L 130,92 M 130,70 L 113,78 M 130,70 L 147,78" stroke="#2a2e34" strokeWidth="1.8" />
            {/* Front Mudguard */}
            <path d="M 112,60 Q 130,44 148,60" fill="none" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />

            {/* 3. Front Telescopic Fork */}
            <line x1="130" y1="70" x2="114" y2="18" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
            {/* Fork Reflector */}
            <circle cx="125" cy="52" r="2" fill="#ffb300" />

            {/* 4. Rear Coil Spring Suspension (working suspension motif with #ffb300 spring) */}
            <path d="M 42,48 L 42,68" stroke="#2a2e34" strokeWidth="5" strokeLinecap="round" />
            <path d="M 39,50 Q 45,50 42,53 Q 39,56 42,59 Q 45,62 42,65 Q 39,68 42,68" fill="none" stroke="#ffb300" strokeWidth="2.2" />

            {/* 5. Engine and Gearbox Block */}
            <rect x="58" y="58" width="28" height="20" rx="6" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
            {/* Cylinder Fins */}
            <line x1="68" y1="58" x2="82" y2="58" stroke="#2a2e34" strokeWidth="2" />
            <line x1="70" y1="52" x2="80" y2="52" stroke="#2a2e34" strokeWidth="2" />

            {/* 6. Commuter Exhaust Silencer with Chrome Guard */}
            <path d="M 76,58 C 76,75 40,76 36,76" fill="none" stroke="#2a2e34" strokeWidth="2" />
            <rect x="15" y="72" width="45" height="9" rx="3" fill="#2a2e34" stroke="#e9eaec" strokeWidth="1" />
            <rect x="25" y="73" width="28" height="4" rx="1.5" fill="#e9eaec" />

            {/* 7. Retractable Side Stand */}
            {smoothProgress < 0.48 ? (
              /* Down: Supporting the bike in garage */
              <line x1="68" y1="76" x2="52" y2="94" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
            ) : (
              /* Up: Retracted for departure */
              <line x1="68" y1="76" x2="90" y2="74" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
            )}

            {/* 8. Matte Charcoal Executive Fuel Tank & yellow stripe decal */}
            <path d="M 64,32 Q 82,14 108,30 C 114,35 114,40 108,44 Q 85,46 64,32 Z" fill="#2a2e34" stroke="#2a2e34" strokeWidth="1" />
            <path d="M 70,28 Q 85,22 102,32" fill="none" stroke="#ffb300" strokeWidth="2" />

            {/* 9. DualComfort Commuter Seat */}
            <path d="M 42,34 Q 55,30 68,31 Q 84,33 92,38 L 92,42 Q 68,42 42,34 Z" fill="#2a2e34" opacity="0.9" />

            {/* 10. Handlebars and Rear Mirror */}
            <line x1="114" y1="18" x2="100" y2="15" stroke="#2a2e34" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 104,16 L 96,6 Q 94,4 98,4 Z" fill="#2a2e34" stroke="#2a2e34" strokeWidth="1" />

            {/* 11. Brake Light & Tail Cowl Indicator */}
            {smoothProgress < 0.48 ? (
              /* Brake light is BRIGHT red on ignition prep */
              <circle cx="36" cy="33" r="3.5" fill="#ff4444" filter="url(#glow-yellow)" />
            ) : (
              /* Dimmer driving light */
              <circle cx="36" cy="33" r="2.5" fill="#ff4444" opacity="0.8" />
            )}

            {/* 12. Exhaust Startup Smoke Puffs */}
            {smoothProgress >= 0.48 && smoothProgress < 0.60 && (
              <g transform="translate(10, 76)">
                <circle cx="0" cy="0" r="4" fill="#2a2e34" opacity="0.3" className="exhaust-puff-1" />
                <circle cx="-3" cy="2" r="3" fill="#2a2e34" opacity="0.2" className="exhaust-puff-2" />
              </g>
            )}

            {/* Rohit putting on helmet */}
            <circle cx="85" cy="5" r="9" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
            {/* Arms holding handlebars */}
            <path d="M 85,15 L 100,28 L 114,18" stroke="#2a2e34" strokeWidth="2" fill="none" />

            {/* The Helmet Animation (Rotates and slides onto head) */}
            <g 
              transform={smoothProgress < 0.46 ? "translate(40, -40) rotate(-45)" : "translate(85, -2) rotate(0)"} 
              style={{ transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
            >
              <path d="M -11,0 C -11,-10 11,-10 11,0 C 11,4 5,8 0,8 C -5,8 -11,4 -11,0 Z" fill="#ffb300" stroke="#2a2e34" strokeWidth="2" />
              <rect x="-7" y="-2" width="14" height="4" fill="#2a2e34" rx="1.5" /> {/* Visor */}
              {/* ISI / DOT Safety Sticker mark */}
              <rect x="-2" y="-7" width="4" height="2" fill="#2a2e34" opacity="0.4" />
            </g>

            {/* Vibrant yellow headlight beam sweeping forward */}
            <polygon 
              points="128,26 240,40 240,90" 
              fill="#ffb300" 
              fillOpacity={smoothProgress > 0.48 ? 0.35 : 0} 
              filter="url(#glow-yellow)"
              style={{ transition: "fill-opacity 0.4s ease-out" }}
            />
            <circle cx="126" cy="26" r="4.5" fill="#ffb300" opacity={smoothProgress > 0.48 ? 1 : 0} />
          </g>

          {/* Floating MoveBuddy route match notification card */}
          <g 
            transform="translate(45, 120)" 
            opacity={smoothProgress > 0.44 && smoothProgress < 0.58 ? 1 : 0}
            style={{ transition: "opacity 0.4s ease-out" }}
          >
            {/* Notification container */}
            <rect width="135" height="65" fill="#e9eaec" fillOpacity="0.95" stroke="#2a2e34" strokeWidth="2" rx="12" filter="url(#shadow)" />
            
            <circle cx="20" cy="22" r="8" fill="#ffb300" />
            <circle cx="20" cy="22" r="4" fill="#2a2e34" />
            
            <text x="35" y="18" fill="#2a2e34" className="font-display font-black text-[8px] tracking-tight">MOVEBUDDY MATCH</text>
            <text x="35" y="27" fill="#2a2e34" opacity="0.6" className="font-sans text-[7px]">Aman travels your route</text>

            {/* Pulsing button */}
            <g transform="translate(15, 38)">
              <rect width="105" height="18" fill="#ffb300" rx="6" stroke="#2a2e34" strokeWidth="1" />
              <text x="52.5" y="11.5" textAnchor="middle" fill="#2a2e34" className="font-mono text-[7px] font-bold">ACCEPT MATCHING PASS</text>
              {/* Pulse circle */}
              <circle cx="95" cy="9" r="3" fill="#2a2e34" className="animate-ping" />
            </g>
          </g>
        </g>


        {/* ==========================================
            SEQUENCE 4: STREET LEVEL MEETING POINT
            ========================================== */}
        <g id="street-meeting" transform="translate(600, 600)">
          {/* Ground pavement */}
          <line x1="0" y1="280" x2="700" y2="280" stroke="#2a2e34" strokeWidth="3.5" />
          <path d="M 0,280 L 700,280 L 700,320 L 0,320 Z" fill="#2a2e34" opacity="0.05" />

          {/* Gate architecture */}
          <rect x="80" y="100" width="16" height="180" fill="none" stroke="#2a2e34" strokeWidth="2.5" />
          <rect x="83" y="105" width="10" height="170" fill="#2a2e34" opacity="0.1" />
          <circle cx="88" cy="90" r="6" fill="#2a2e34" />
          
          {/* Residential fence lines */}
          <line x1="0" y1="160" x2="80" y2="160" stroke="#2a2e34" strokeWidth="1.5" />
          <line x1="0" y1="200" x2="80" y2="200" stroke="#2a2e34" strokeWidth="1.5" />
          <line x1="0" y1="240" x2="80" y2="240" stroke="#2a2e34" strokeWidth="1.5" />

          {/* Aman waiting (smiles) */}
          <g transform="translate(130, 195)">
            <circle cx="15" cy="15" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
            {/* Smile outline */}
            <path d="M 12,18 Q 15,21 18,18" stroke="#2a2e34" strokeWidth="1.2" fill="none" />
            
            {/* Torso */}
            <path d="M 15,23 L 15,65" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="35" x2="32" y2="50" stroke="#2a2e34" strokeWidth="1.8" strokeLinecap="round" /> {/* waving hand */}

            {/* Helmet flies onto Aman's head when they meet */}
            <g 
              transform={smoothProgress < 0.65 ? "translate(-30, -50) rotate(30)" : "translate(15, 8) rotate(0)"}
              style={{ transition: "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.2)" }}
            >
              <circle cx="0" cy="0" r="8.5" fill="#2a2e34" stroke="#ffb300" strokeWidth="1.5" />
              <path d="M -4,3 L 6,3 Q 8,6 6,9 L -1,9 Z" fill="#ffb300" opacity="0.9" /> {/* Amber Visor */}
              <rect x="-2" y="-7" width="4" height="2" fill="#ffb300" opacity="0.4" /> {/* DOT decal */}
            </g>
          </g>

          {/* Rohit arriving on bike */}
          <g 
            transform={`translate(${smoothProgress < 0.64 ? 480 : 200}, 190)`}
            style={{ transition: "transform 1.2s cubic-bezier(0.1, 0.8, 0.2, 1)" }}
          >
            {/* 1. Rear Wheel */}
            <circle cx="-35" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="4" />
            <circle cx="-35" cy="70" r="14" fill="none" stroke="#2a2e34" strokeWidth="1" />
            {/* Alloy Spokes */}
            <path d="M -35,70 L -48,60 M -35,70 L -22,60 M -35,70 L -35,88 M -35,70 L -49,76 M -35,70 L -21,76" stroke="#2a2e34" strokeWidth="1.5" />

            {/* 2. Front Wheel */}
            <circle cx="35" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="4" />
            <circle cx="35" cy="70" r="14" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <path d="M 35,70 L 22,60 M 35,70 L 48,60 M 35,70 L 35,88 M 35,70 L 21,76 M 35,70 L 49,76" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M 20,62 Q 35,48 50,62" fill="none" stroke="#2a2e34" strokeWidth="2.5" strokeLinecap="round" />

            {/* 3. Front Telescopic Forks */}
            <line x1="35" y1="70" x2="22" y2="28" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />

            {/* 4. Rear Coil Spring Suspension */}
            <path d="M -25,51 L -25,68" stroke="#2a2e34" strokeWidth="4" strokeLinecap="round" />
            <path d="M -27,53 Q -23,53 -25,55 Q -27,57 -25,59 Q -23,61 -25,63 Q -27,65 -25,67" fill="none" stroke="#ffb300" strokeWidth="1.8" />

            {/* 5. Engine and Gearbox */}
            <rect x="-12" y="58" width="24" height="16" rx="4" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.8" />

            {/* 6. Exhaust silencer with Chrome Guard */}
            <rect x="-48" y="70" width="36" height="8" rx="2" fill="#2a2e34" stroke="#e9eaec" strokeWidth="0.8" />
            <rect x="-40" y="71" width="22" height="3" rx="1" fill="#e9eaec" />

            {/* 7. Retracted Side Stand */}
            <line x1="-5" y1="74" x2="15" y2="72" stroke="#2a2e34" strokeWidth="2.5" opacity="0.3" />

            {/* 8. Matte Charcoal Fuel Tank & golden decal */}
            <path d="M -18,36 Q -2,18 20,34 C 25,38 25,42 20,45 Q 1,47 -18,36 Z" fill="#2a2e34" stroke="#2a2e34" strokeWidth="1" />
            <path d="M -12,32 Q 0,26 15,34" fill="none" stroke="#ffb300" strokeWidth="1.8" />

            {/* 9. Dual comfort seat */}
            <path d="M -34,37 Q -22,33 -12,34 Q 1,36 8,41 L 8,44 Q -12,44 -34,37 Z" fill="#2a2e34" opacity="0.9" />

            {/* 10. Handlebars */}
            <line x1="22" y1="28" x2="10" y2="25" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />
            <path d="M 14,26 L 8,17" stroke="#2a2e34" strokeWidth="1.5" />

            {/* 11. Headlight beam glowing */}
            <polygon points="32,28 100,15 100,65" fill="#ffb300" fillOpacity="0.25" filter="url(#glow-yellow)" />
            <circle cx="24" cy="28" r="3.5" fill="#ffb300" />

            {/* 12. Brake Light glowing */}
            <circle cx="-38" cy="37" r="2.5" fill="#ff4444" opacity="0.9" />

            {/* Rohit rider */}
            <circle cx="0" cy="14" r="8.5" fill="#ffb300" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M -4,11 L 6,11 Q 8,14 6,17 L -1,17 Z" fill="#2a2e34" /> {/* Visor */}
            <path d="M 0,22 L 0,55" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
            {/* Arms */}
            <path d="M 0,30 L 16,27" stroke="#2a2e34" strokeWidth="2" />
          </g>

          {/* Double KYC verification glowing badges */}
          <g 
            transform="translate(320, 80)"
            opacity={smoothProgress > 0.65 && smoothProgress < 0.77 ? 1 : 0}
            style={{ transition: "opacity 0.4s ease-in-out" }}
          >
            {/* Badge: Verified Host */}
            <g transform="translate(0, 0)">
              <rect width="110" height="26" fill="#2a2e34" rx="6" filter="url(#shadow)" />
              <circle cx="15" cy="13" r="6" fill="#ffb300" />
              <path d="M 12,13 L 14,15 L 18,11" stroke="#2a2e34" strokeWidth="1.5" fill="none" />
              <text x="28" y="16" fill="#e9eaec" className="font-mono text-[7px] font-black tracking-wider">VERIFIED HOST</text>
            </g>
            {/* Badge: Verified Guest */}
            <g transform="translate(0, 34)">
              <rect width="110" height="26" fill="#2a2e34" rx="6" filter="url(#shadow)" />
              <circle cx="15" cy="13" r="6" fill="#ffb300" />
              <path d="M 12,13 L 14,15 L 18,11" stroke="#2a2e34" strokeWidth="1.5" fill="none" />
              <text x="28" y="16" fill="#e9eaec" className="font-mono text-[7px] font-black tracking-wider">VERIFIED GUEST</text>
            </g>
            {/* Badge: Trusted Route Matched */}
            <g transform="translate(0, 68)">
              <rect width="110" height="26" fill="#ffb300" rx="6" filter="url(#shadow)" />
              <circle cx="15" cy="13" r="6" fill="#2a2e34" />
              <path d="M 12,13 L 18,13" stroke="#ffb300" strokeWidth="1.5" fill="none" />
              <text x="28" y="16" fill="#2a2e34" className="font-mono text-[7px] font-black tracking-wider">ROUTE MATCHED</text>
            </g>
          </g>
        </g>


        {/* ==========================================
            SEQUENCE 5: CINEMATIC ACTIVE HIGHWAY RIDE
            ========================================== */}
        <g id="highway-ride" transform="translate(500, 1050)">
          {/* Parallax scrolling highway lines */}
          <rect x="0" y="100" width="800" height="180" fill="#2a2e34" fillOpacity="0.05" />
          <line x1="0" y1="190" x2="800" y2="190" stroke="#2a2e34" strokeWidth={isMobile ? "6.5" : "4"} />
          <line x1="0" y1="280" x2="800" y2="280" stroke="#2a2e34" strokeWidth={isMobile ? "4.5" : "2.5"} />
          <line x1="0" y1="100" x2="800" y2="100" stroke="#2a2e34" strokeWidth={isMobile ? "4.5" : "2.5"} />

          {/* Moving road dash segments based on progress for infinite scrolling feeling */}
          <g stroke="#ffb300" strokeWidth={isMobile ? "5.5" : "3"} strokeDasharray="30,25" strokeDashoffset={smoothProgress * -1200}>
            <line x1="0" y1="145" x2="800" y2="145" />
            <line x1="0" y1="235" x2="800" y2="235" />
          </g>

          {/* Distant background trees & streetlamps sliding backward */}
          <g transform={`translate(${-(smoothProgress * 700) % 300}, 0)`}>
            {/* Tree 1 */}
            <line x1="100" y1="100" x2="100" y2="70" stroke="#2a2e34" strokeWidth="2.5" />
            <circle cx="100" cy="65" r="12" fill="#2a2e34" opacity="0.3" />
            {/* Tree 2 */}
            <line x1="350" y1="100" x2="350" y2="70" stroke="#2a2e34" strokeWidth="2.5" />
            <circle cx="350" cy="65" r="14" fill="#2a2e34" opacity="0.3" />
            {/* Tree 3 */}
            <line x1="600" y1="100" x2="600" y2="70" stroke="#2a2e34" strokeWidth="2.5" />
            <circle cx="600" cy="65" r="11" fill="#2a2e34" opacity="0.3" />
          </g>

          {/* Active Rider Bike Group locked in center */}
          <g 
            transform={`translate(280, 110) translate(0, ${Math.sin(smoothProgress * 60) * 1.5}) rotate(${(smoothProgress > 0.70 && smoothProgress < 0.88) ? -3.5 + Math.sin(smoothProgress * 100) * 2.0 : 0})`}
            style={{ transformOrigin: "5px 85px" }}
          >
            {/* 1. Rear Wheel - spinning spokes with enhanced thickness */}
            <circle cx="-40" cy="65" r="20" fill="#121518" stroke="#2a2e34" strokeWidth="5.5" />
            <circle cx="-40" cy="65" r="15" fill="none" stroke="#e9eaec" strokeWidth="1.5" opacity="0.8" />
            <g className="bike-wheel-spin" style={{ transformOrigin: "-40px 65px" }}>
              <line x1="-40" y1="45" x2="-40" y2="85" stroke="#e9eaec" strokeWidth="1.8" opacity="0.9" />
              <line x1="-60" y1="65" x2="-20" y2="65" stroke="#e9eaec" strokeWidth="1.8" opacity="0.9" />
              <line x1="-54" y1="51" x2="-26" y2="79" stroke="#e9eaec" strokeWidth="1.8" opacity="0.6" />
              <line x1="-26" y1="51" x2="-54" y2="79" stroke="#e9eaec" strokeWidth="1.8" opacity="0.6" />
            </g>

            {/* 2. Front Wheel - spinning spokes with enhanced thickness */}
            <circle cx="50" cy="65" r="20" fill="#121518" stroke="#2a2e34" strokeWidth="5.5" />
            <circle cx="50" cy="65" r="15" fill="none" stroke="#e9eaec" strokeWidth="1.5" opacity="0.8" />
            <g className="bike-wheel-spin" style={{ transformOrigin: "50px 65px" }}>
              <line x1="50" y1="45" x2="50" y2="85" stroke="#e9eaec" strokeWidth="1.8" opacity="0.9" />
              <line x1="30" y1="65" x2="70" y2="65" stroke="#e9eaec" strokeWidth="1.8" opacity="0.9" />
              <line x1="36" y1="51" x2="64" y2="79" stroke="#e9eaec" strokeWidth="1.8" opacity="0.6" />
              <line x1="64" y1="51" x2="36" y2="79" stroke="#e9eaec" strokeWidth="1.8" opacity="0.6" />
            </g>
            {/* Front Mudguard */}
            <path d="M 31,54 Q 50,38 69,54" fill="#2a2e34" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" />

            {/* 3. Front Telescopic Fork */}
            <line x1="50" y1="65" x2="33" y2="15" stroke="#2a2e34" strokeWidth="4" strokeLinecap="round" />

            {/* 4. Rear Coil Spring Suspension */}
            <path d="M -26,45 L -26,62" stroke="#2a2e34" strokeWidth="5" strokeLinecap="round" />
            <path d="M -29,47 Q -23,47 -26,49 Q -29,51 -26,53 Q -23,55 -26,57 Q -29,59 -26,61" fill="none" stroke="#ffb300" strokeWidth="2.5" />

            {/* 5. Engine and Gearbox Block */}
            <rect x="-10" y="52" width="30" height="20" rx="5" fill="#2a2e34" stroke="#ffb300" strokeWidth="1.5" />

            {/* 6. Exhaust silencer muffler & shield */}
            <rect x="-56" y="66" width="42" height="9" rx="2.5" fill="#121518" stroke="#ffb300" strokeWidth="1.2" />
            <rect x="-46" y="67" width="26" height="3" rx="1.5" fill="#ffb300" opacity="0.8" />

            {/* 7. Matte Charcoal Fuel Tank with Bold Golden Accents */}
            <path d="M -12,26 Q 8,4 34,22 C 40,26 40,30 34,34 Q 11,36 -12,26 Z" fill="#2a2e34" stroke="#ffb300" strokeWidth="2" />
            <path d="M -6,22 Q 8,13 26,24" fill="none" stroke="#ffb300" strokeWidth="3.5" />

            {/* 8. Handlebars and Mirrors */}
            <line x1="33" y1="15" x2="16" y2="12" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
            <path d="M 23,13 L 15,3" stroke="#2a2e34" strokeWidth="2" />
            <circle cx="15" cy="3" r="3.5" fill="#2a2e34" stroke="#ffb300" strokeWidth="1" />

            {/* 9. Extended comfort seat */}
            <path d="M -32,27 Q -16,21 -4,22 Q 12,23 20,29 L 20,33 Q -4,34 -32,27 Z" fill="#121518" stroke="#2a2e34" strokeWidth="1.5" />

            {/* 10. Glowing yellow tail exhaust heat wave & Startup Smoke Puffs */}
            <g transform="translate(-60, 70)">
              <circle cx="0" cy="0" r="3" fill="#2a2e34" opacity="0.2" className="exhaust-puff-1" />
            </g>

            {/* 11. Soft Dust Particles and Road Motion */}
            <g transform="translate(-65, 65)">
              <circle cx="0" cy="0" r="3" fill="#2a2e34" opacity="0.25" className="road-dust-1" />
              <circle cx="-10" cy="5" r="4" fill="#2a2e34" opacity="0.15" className="road-dust-2" />
            </g>

            {/* 12. Headlight and forward beam glow */}
            <circle cx="39" cy="22" r="5" fill="#ffb300" filter="url(#glow-yellow)" />
            <polygon points="41,22 160,-20 160,80" fill="#ffb300" fillOpacity="0.2" filter="url(#glow-yellow)" />

            {/* 13. Brake light glowing softly */}
            <circle cx="-35" cy="25" r="3" fill="#ff4444" opacity="0.95" filter="url(#glow-yellow)" />

            {/* Rohit (Host) - Fully detailed solid premium body shape */}
            <g id="rohit-highway-rider">
              {/* Torso: Solid windbreaker jacket */}
              <path d="M 0,18 C -3,21 -4,25 -4,42 L 18,42 C 18,25 17,21 14,18 Z" fill="#ffb300" stroke="#2a2e34" strokeWidth="2" strokeLinejoin="round" />
              {/* Commuter crossbelt harness detail */}
              <path d="M 0,18 L 11,42 M 14,18 L 3,42" stroke="#2a2e34" strokeWidth="1.5" opacity="0.25" />
              {/* Highlight collar */}
              <path d="M 0,18 Q 7,20 14,18" fill="none" stroke="#2a2e34" strokeWidth="1.8" />
              {/* Solid detailed arm holding handlebars */}
              <path d="M 7,25 Q 18,23 27,25" fill="none" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
              {/* Head / Helmet */}
              <circle cx="7" cy="8" r="9" fill="#ffb300" stroke="#2a2e34" strokeWidth="2" />
              <path d="M 3,5 L 13,5 Q 15,8 13,11 L 6,11 Z" fill="#2a2e34" /> {/* Visor */}
              <rect x="5" y="0" width="3" height="2" fill="#e9eaec" /> {/* DOT top strip */}
            </g>

            {/* Aman (Guest) - Fully detailed solid premium body shape */}
            <g id="aman-highway-rider">
              {/* Torso: Solid office blazer jacket with contrasting highlights */}
              <path d="M -24,22 C -27,25 -28,29 -28,45 L -8,45 C -8,29 -9,25 -13,22 Z" fill="#2a2e34" stroke="#ffb300" strokeWidth="2" strokeLinejoin="round" />
              {/* Corporate ID lanyard/badge detail */}
              <rect x="-19" y="27" width="4" height="6" fill="#ffb300" rx="0.5" />
              <line x1="-17" y1="22" x2="-17" y2="27" stroke="#e9eaec" strokeWidth="1" />
              {/* Solid detailed arms wrapping around Rohit's waist */}
              <path d="M -18,28 Q -8,27 -1,28" fill="none" stroke="#ffb300" strokeWidth="3.5" strokeLinecap="round" />
              {/* Head / Helmet */}
              <circle cx="-18" cy="12" r="9" fill="#2a2e34" stroke="#ffb300" strokeWidth="2" />
              <path d="M -14,9 L -4,9 Q -2,12 -4,15 L -11,15 Z" fill="#ffb300" opacity="0.95" /> {/* Amber Visor */}
              <rect x="-19" y="4" width="3" height="2" fill="#ffb300" />
            </g>
          </g>

          {/* Active GPS Route line drawn directly beneath the bike */}
          <path 
            d="M 0,210 L 280,210" 
            stroke="#ffb300" 
            strokeWidth="5" 
            filter="url(#glow-yellow)" 
            strokeLinecap="round" 
            opacity={smoothProgress > 0.70 && smoothProgress < (isMobile ? 0.89 : 0.91) ? 1 : 0} 
            style={{ transition: "opacity 0.4s" }}
          />

          {/* Integrated real-time product feature HUD floating tags */}
          <g 
            transform={isMobile ? "translate(300, 75)" : "translate(320, 110)"}
            opacity={smoothProgress > 0.72 && smoothProgress < (isMobile ? 0.87 : 0.89) ? 1 : 0}
            style={{ transition: "opacity 0.4s" }}
          >
            {/* GPS HUD */}
            <g transform="translate(0, 0)" filter="url(#shadow)">
              <rect width="130" height="42" fill="#2a2e34" rx="8" />
              <circle cx="18" cy="21" r="5" fill="#ffb300" className="animate-pulse" />
              <text x="32" y="18" fill="#e9eaec" className="font-mono text-[7px] font-black tracking-wider">REAL-TIME LOCATION</text>
              <text x="32" y="28" fill="#e9eaec" opacity="0.6" className="font-sans text-[7px]">Verified commute route</text>
            </g>

            {/* SOS Safety Shield */}
            <g transform={isMobile ? "translate(0, 48)" : "translate(140, 0)"} filter="url(#shadow)">
              <rect width="130" height="42" fill="#ffb300" rx="8" />
              <path d="M 12,21 L 18,27 L 26,15" stroke="#2a2e34" strokeWidth="2" fill="none" />
              <text x="36" y="18" fill="#2a2e34" className="font-mono text-[7px] font-black tracking-wider">SECURE SHIELD ACTIVE</text>
              <text x="36" y="28" fill="#2a2e34" opacity="0.75" className="font-sans text-[7px]">24/7 Ride SOS protection</text>
            </g>
          </g>
        </g>


        {/* ==========================================
            SEQUENCE 6: OFFICE DESTINATION PARK
            ========================================== */}
        <g id="office-destination" transform="translate(100, 1050)">
          {/* Ground pavement */}
          <line x1="0" y1="280" x2="400" y2="280" stroke="#2a2e34" strokeWidth="3.5" />

          {/* Futuristic clean architecture tall building facade */}
          <path d="M 40,280 L 40,60 L 150,30 L 150,280 Z" fill="none" stroke="#2a2e34" strokeWidth="2.5" />
          {/* Elegant geometric glass window segments */}
          <line x1="40" y1="100" x2="150" y2="80" stroke="#2a2e34" strokeWidth="1" opacity="0.2" />
          <line x1="40" y1="150" x2="150" y2="130" stroke="#2a2e34" strokeWidth="1" opacity="0.2" />
          <line x1="40" y1="200" x2="150" y2="180" stroke="#2a2e34" strokeWidth="1" opacity="0.2" />
          <line x1="95" y1="45" x2="95" y2="280" stroke="#2a2e34" strokeWidth="1" opacity="0.2" />

          {/* Secondary building facade */}
          <path d="M 170,280 L 170,100 L 260,100 L 260,280 Z" fill="none" stroke="#2a2e34" strokeWidth="2" />
          <line x1="170" y1="140" x2="260" y2="140" stroke="#2a2e34" strokeWidth="1" opacity="0.2" />
          <line x1="170" y1="190" x2="260" y2="190" stroke="#2a2e34" strokeWidth="1" opacity="0.2" />

          {/* Stopped bike - Guest waves goodbye */}
          <g transform="translate(240, 190)">
            {/* 1. Wheels */}
            <circle cx="-30" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="4" />
            <circle cx="-30" cy="70" r="14" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <path d="M -30,70 L -43,60 M -30,70 L -17,60 M -30,70 L -30,88 M -30,70 L -44,76 M -30,70 L -16,76" stroke="#2a2e34" strokeWidth="1.5" />

            <circle cx="30" cy="70" r="18" fill="none" stroke="#2a2e34" strokeWidth="4" />
            <circle cx="30" cy="70" r="14" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <path d="M 30,70 L 17,60 M 30,70 L 43,60 M 30,70 L 30,88 M 30,70 L 16,76 M 30,70 L 44,76" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M 15,62 Q 30,48 45,62" fill="none" stroke="#2a2e34" strokeWidth="2.5" strokeLinecap="round" />

            {/* 2. Forks and suspension */}
            <line x1="30" y1="70" x2="18" y2="28" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
            <path d="M -22,51 L -22,68" stroke="#2a2e34" strokeWidth="4" strokeLinecap="round" />
            <path d="M -24,53 Q -20,53 -22,55 Q -24,57 -22,59" fill="none" stroke="#ffb300" strokeWidth="1.8" />

            {/* 3. Engine and Exhaust muffler shield */}
            <rect x="-10" y="58" width="22" height="15" rx="3" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.8" />
            <rect x="-42" y="70" width="32" height="7" rx="2" fill="#2a2e34" stroke="#e9eaec" strokeWidth="0.8" />

            {/* 4. Side Stand Down supporting parked bike */}
            <line x1="-2" y1="74" x2="-14" y2="92" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />

            {/* 5. Matte Charcoal Tank with Accent stripe */}
            <path d="M -16,36 Q -2,18 16,34 C 20,38 20,42 16,45 Q 1,47 -16,36 Z" fill="#2a2e34" stroke="#2a2e34" strokeWidth="1" />
            <path d="M -10,32 Q 0,26 12,34" fill="none" stroke="#ffb300" strokeWidth="1.8" />

            {/* 6. Dualcomfort seat */}
            <path d="M -29,37 Q -19,33 -10,34 Q 1,36 7,41 L 7,44 Q -10,44 -29,37 Z" fill="#2a2e34" opacity="0.9" />

            {/* 7. Handlebars */}
            <line x1="18" y1="28" x2="8" y2="25" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />

            {/* Rohit host on bike */}
            <circle cx="0" cy="14" r="8.5" fill="#ffb300" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M -4,11 L 6,11 Q 8,14 6,17 L -1,17 Z" fill="#2a2e34" /> {/* Visor */}
            <path d="M 0,22 L 0,55" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
            {/* Arms on handle */}
            <path d="M 0,30 L 14,27" stroke="#2a2e34" strokeWidth="2" />
          </g>

          {/* Aman waving */}
          <g transform="translate(180, 202)">
            <circle cx="15" cy="15" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
            <path d="M 15,23 L 15,65" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />
            <line x1="15" y1="35" x2="0" y2="20" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" /> {/* waving hand */}
          </g>

          {/* Floating wallet payout details - enlarged and positioned perfectly to prevent overlaps and clipping */}
          {(() => {
            const cardWidth = isMobile ? 190 : 215;
            const innerWidth = cardWidth - 24;
            return (
              <g 
                transform={isMobile ? "translate(175, 70) scale(0.82)" : "translate(170, 115)"}
                opacity={smoothProgress > (isMobile ? 0.88 : 0.90) && smoothProgress < 0.96 ? 1 : 0}
                style={{ transition: "opacity 0.4s" }}
              >
                {/* Wallet glassmorphic outline */}
                <rect width={cardWidth} height="100" fill="#e9eaec" fillOpacity="0.95" stroke="#2a2e34" strokeWidth="2" rx="12" filter="url(#shadow)" />
                
                {/* Header with clean top-rounded path */}
                <path d={`M 1,11 A 10,10 0 0,1 11,1 L ${cardWidth - 11},1 A 10,10 0 0,1 ${cardWidth - 1},11 L ${cardWidth - 1},22 L 1,22 Z`} fill="#ffb300" />
                <text x={cardWidth / 2} y="14" textAnchor="middle" fill="#2a2e34" className="font-mono text-[8px] font-black tracking-wider">COMMUTING PAYOUT</text>

                <g transform="translate(12, 0)">
                  {/* Row 1 */}
                  <text y="38" fill="#2a2e34" opacity="0.5" className="font-sans text-[8px] font-bold uppercase tracking-wider">
                    {isMobile ? "Aman (Saved)" : "Aman (Saved 40%)"}
                  </text>
                  <text x={innerWidth} y="38" textAnchor="end" fill="#2a2e34" className="font-mono text-[8.5px] font-black">₹340 SAVED</text>
                  <line x1="0" y1="46" x2={innerWidth} y2="46" stroke="#2a2e34" strokeWidth="0.75" opacity="0.1" />

                  {/* Row 2 */}
                  <text y="58" fill="#2a2e34" opacity="0.5" className="font-sans text-[8px] font-bold uppercase tracking-wider">
                    {isMobile ? "Rohit (Earned)" : "Rohit (Fuel Covered)"}
                  </text>
                  <text x={innerWidth} y="58" textAnchor="end" fill="#ffb300" className="font-mono text-[8.5px] font-black" filter="url(#glow-yellow)">₹180 EARNED</text>
                  <line x1="0" y1="66" x2={innerWidth} y2="66" stroke="#2a2e34" strokeWidth="0.75" opacity="0.1" />
                  
                  {/* Row 3 */}
                  <text y="82" fill="#2a2e34" opacity="0.6" className="font-sans text-[7.5px] font-extrabold uppercase tracking-wide">Split Completed</text>
                  <text x={innerWidth} y="82" textAnchor="end" fill="#2a2e34" className="font-mono text-[8px] font-black fill-green-600">✓ SUCCESS</text>
                </g>
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}
