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
  { p: 0.12, x: 150,  y: 150,  w: 500,  h: 375 },  // 1. Zoom into Aman's apartment window
  { p: 0.28, x: 150,  y: 150,  w: 500,  h: 375 },  // 1. Waking up / Cab surges
  { p: 0.42, x: 1150, y: 150,  w: 500,  h: 375 },  // 2. Fly across city skyline to Rohit's garage
  { p: 0.58, x: 1150, y: 150,  w: 500,  h: 375 },  // 2. Rohit's bike starting / headlight glows
  { p: 0.68, x: 650,  y: 650,  w: 600,  h: 450 },  // 3. Pan down to street level meeting
  { p: 0.74, x: 650,  y: 650,  w: 600,  h: 450 },  // 3. Helmet match / pin verification
  { p: 0.85, x: 650,  y: 1100, w: 500,  h: 375 },  // 4. Highway cinematic active commute
  { p: 0.90, x: 650,  y: 1100, w: 500,  h: 375 },  // 4. Floating HUD product features
  { p: 0.94, x: 150,  y: 1100, w: 500,  h: 375 },  // 5. Office destination park arrival
  { p: 0.97, x: 400,  y: 300,  w: 1200, h: 900 },  // 6. Seamless zoom back out to India Network
  { p: 1.00, x: 400,  y: -400, w: 1200, h: 900 }   // 7. Pan up into final sky call-to-action
];

export default function StoryVisualizer({ progress, activeSceneOverride }: StoryVisualizerProps) {
  const [smoothProgress, setSmoothProgress] = useState(0);
  const lastTriggeredScene = useRef<number | null>(null);

  // Buttery-smooth inertial scroll interpolation (120FPS glide feeling)
  useEffect(() => {
    let rAF: number;
    const update = () => {
      setSmoothProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.0001) return progress;
        return prev + diff * 0.08; // Inertia factor
      });
      rAF = requestAnimationFrame(update);
    };
    rAF = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rAF);
  }, [progress]);

  // Interpolated Viewbox Camera Calculation
  const getInterpolatedViewBox = () => {
    const p = smoothProgress;
    
    // Find enclosing keyframes
    let left = keyframes[0];
    let right = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (p >= keyframes[i].p && p <= keyframes[i + 1].p) {
        left = keyframes[i];
        right = keyframes[i + 1];
        break;
      }
    }
    
    const range = right.p - left.p;
    const factor = range > 0 ? (p - left.p) / range : 0;
    
    // Smooth easing interpolation for camera movement
    const t = factor * factor * (3 - 2 * factor); // smoothstep
    
    const x = left.x + (right.x - left.x) * t;
    const y = left.y + (right.y - left.y) * t;
    const w = left.w + (right.w - left.w) * t;
    const h = left.h + (right.h - left.h) * t;
    
    return `${x} ${y} ${w} ${h}`;
  };

  // Synchronize browser sound synthesis based on camera progress
  useEffect(() => {
    let currentSceneIdx = 0;
    const p = smoothProgress;
    if (p < 0.12) currentSceneIdx = 0; // Opening India Map
    else if (p < 0.35) currentSceneIdx = 1; // Alarm room
    else if (p < 0.55) currentSceneIdx = 2; // Bike starting
    else if (p < 0.70) currentSceneIdx = 3; // Meeting
    else if (p < 0.88) currentSceneIdx = 4; // active commute
    else if (p < 0.95) currentSceneIdx = 5; // Arrival
    else currentSceneIdx = 6; // Sky Network

    if (currentSceneIdx === lastTriggeredScene.current) return;
    lastTriggeredScene.current = currentSceneIdx;

    try {
      if (currentSceneIdx === 0) {
        audio.stopAlarm();
        audio.stopEngine();
      } else if (currentSceneIdx === 1) {
        // Commuter sleeping, alarm triggers
        audio.startAlarm();
        audio.stopEngine();
      } else if (currentSceneIdx === 2) {
        // Starts his bike
        audio.stopAlarm();
        audio.startEngine();
        audio.updateEngineRPM(0.3);
      } else if (currentSceneIdx === 3) {
        // Met up
        audio.stopAlarm();
        audio.updateEngineRPM(0.1);
      } else if (currentSceneIdx === 4) {
        // Commuting! Pitch revs high
        audio.stopAlarm();
        audio.startEngine();
        audio.updateEngineRPM(0.7);
      } else if (currentSceneIdx === 5) {
        // Arrives and pays
        audio.stopAlarm();
        audio.stopEngine();
        audio.playPaymentDing();
      } else {
        audio.stopAlarm();
        audio.stopEngine();
      }
    } catch (err) {
      console.warn("Audio trigger error:", err);
    }
  }, [smoothProgress]);

  // Define some constant route coordinates across India outline
  const indiaCities = [
    { name: "Bengaluru", x: 490, y: 580, id: "bglr" },
    { name: "Mumbai", x: 420, y: 480, id: "mumb" },
    { name: "Delhi NCR", x: 470, y: 280, id: "delh" },
    { name: "Hyderabad", x: 500, y: 500, id: "hydb" },
    { name: "Pune", x: 430, y: 510, id: "pune" },
    { name: "Kolkata", x: 620, y: 390, id: "kolk" },
    { name: "Chennai", x: 520, y: 600, id: "chen" }
  ];

  // Map route lines connecting cities
  const routeLines = [
    { from: "delh", to: "mumb" },
    { from: "mumb", to: "pune" },
    { from: "pune", to: "bglr" },
    { from: "bglr", to: "chen" },
    { from: "hydb", to: "bglr" },
    { from: "kolk", to: "hydb" },
    { from: "delh", to: "kolk" }
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
            .bike-wheel-spin {
              animation: bike-spin 0.35s linear infinite;
              transform-origin: center;
            }
            .exhaust-puff-1 {
              animation: exhaust-puff-1 1s ease-out infinite;
              transform-origin: center;
            }
            .exhaust-puff-2 {
              animation: exhaust-puff-2 1.4s ease-out infinite;
              animation-delay: 0.5s;
              transform-origin: center;
            }
            .road-dust-1 {
              animation: road-dust-1 0.7s ease-out infinite;
              transform-origin: center;
            }
            .road-dust-2 {
              animation: road-dust-2 1s ease-out infinite;
              animation-delay: 0.35s;
              transform-origin: center;
            }
          `}</style>
        </defs>

        {/* Ambient background grids */}
        <g opacity="0.15">
          <path d="M 0,0 L 2000,0 M 0,200 L 2000,200 M 0,400 L 2000,400 M 0,600 L 2000,600 M 0,800 L 2000,800 M 0,1000 L 2000,1000 M 0,1200 L 2000,1200 M 0,1400 L 2000,1400" stroke="#2a2e34" strokeWidth="0.5" strokeDasharray="5,5" />
          <path d="M 0,0 L 0,1600 M 200,0 L 200,1600 M 400,0 L 400,1600 M 600,0 L 600,1600 M 800,0 L 800,1600 M 1000,0 L 1000,1600 M 1200,0 L 1200,1600 M 1400,0 L 1400,1600 M 1600,0 L 1600,1600 M 1800,0 L 1800,1600" stroke="#2a2e34" strokeWidth="0.5" strokeDasharray="5,5" />
        </g>

        {/* ==========================================
            STAGE BACKGROUND SKYLINE (Charcoal silhouettes)
            ========================================== */}
        <g id="city-skyline" opacity="0.25">
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
        <g id="india-network-scene" opacity={smoothProgress < 0.15 || smoothProgress > 0.90 ? 1 : 0.05} style={{ transition: "opacity 0.6s" }}>
          {/* Stylized geometric vector path of India coastline map */}
          <path 
            d="M 450,150 L 510,160 L 520,200 L 560,210 L 560,260 L 590,280 L 610,260 L 630,310 L 650,330 L 690,320 L 710,340 L 730,390 L 670,410 L 630,420 L 620,450 L 580,480 L 590,540 L 560,620 L 530,690 L 520,700 L 515,670 L 490,590 L 470,570 L 440,540 L 415,500 L 390,460 L 370,420 L 360,370 L 380,320 L 400,280 L 420,260 L 430,220 Z" 
            fill="none" 
            stroke="#2a2e34" 
            strokeWidth="3" 
            strokeLinejoin="round" 
            strokeDasharray={smoothProgress < 0.03 ? "1000" : "none"}
            style={{ transition: "stroke-dashoffset 2s ease-out" }}
          />

          {/* Dynamic route lines between city nodes */}
          {routeLines.map((line, idx) => {
            const start = indiaCities.find(c => c.id === line.from);
            const end = indiaCities.find(c => c.id === line.to);
            if (!start || !end) return null;
            return (
              <g key={`route-${idx}`}>
                {/* Backing structural path */}
                <line 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="#2a2e34" 
                  strokeWidth="1.5" 
                  opacity="0.2" 
                />
                {/* Active glowing yellow route line overlay */}
                <line 
                  x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
                  stroke="#ffb300" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  filter="url(#glow-yellow)"
                  strokeDasharray="12,12"
                  opacity={smoothProgress < 0.10 || smoothProgress > 0.93 ? 0.9 : 0}
                  className="animate-route-pulse"
                  style={{ 
                    strokeDashoffset: (smoothProgress * -400) % 200,
                    transition: "opacity 0.5s" 
                  }}
                />
              </g>
            );
          })}

          {/* Glowing City Nodes */}
          {indiaCities.map((city) => (
            <g key={`city-${city.id}`} transform={`translate(${city.x}, ${city.y})`}>
              <circle r="12" fill="#ffb300" opacity="0.12" className="animate-ping" />
              <circle r="6" fill="#ffb300" filter="url(#glow-yellow)" />
              <circle r="3" fill="#2a2e34" />
              
              {/* City names labeled elegantly in display font */}
              <text 
                y="-12" 
                textAnchor="middle" 
                fill="#2a2e34" 
                className="font-mono text-[9px] font-bold"
                letterSpacing="1"
              >
                {city.name.toUpperCase()}
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
          
          {/* Vibrating Alarm Clock */}
          <g 
            transform={`translate(320, 130) ${smoothProgress > 0.12 && smoothProgress < 0.28 ? `translate(${Math.sin(Date.now() * 0.15) * 2.5}, ${Math.cos(Date.now() * 0.15) * 1.5})` : ""}`}
            style={{ transformOrigin: "center" }}
          >
            <circle r="10" fill="#e9eaec" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M -8,-8 L -4,-12 M 8,-8 L 4,-12" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" /> {/* bells */}
            <circle cx="-6" cy="-10" r="2.5" fill="#2a2e34" />
            <circle cx="6" cy="-10" r="2.5" fill="#2a2e34" />
            
            {/* Clock hands showing 08:10 */}
            <line x1="0" y1="0" x2="0" y2="-6" stroke="#2a2e34" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="5" y2="2" stroke="#ffb300" strokeWidth="1.5" />
            {/* Pulsing alarm soundwaves */}
            {smoothProgress > 0.12 && smoothProgress < 0.28 && (
              <g opacity="0.75" stroke="#ffb300" strokeWidth="1" fill="none">
                <path d="M -15,-5 Q -20,0 -15,5" />
                <path d="M 15,-5 Q 20,0 15,5" />
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

            {/* Sleeping Aman figures (reacts to scroll progress to wake up) */}
            {smoothProgress < 0.22 ? (
              // Sleeping position
              <g id="sleeping-figure">
                <circle cx="27" cy="12" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
                <path d="M 35,28 L 130,28" stroke="#2a2e34" strokeWidth="5" strokeLinecap="round" /> {/* body under blanket */}
                <path d="M 25,28 Q 75,22 135,28" fill="#2a2e34" opacity="0.15" /> {/* blanket shadows */}
                <text x="35" y="-5" className="font-mono text-[10px] font-bold fill-[#2a2e34]/50 animate-pulse">Zzz...</text>
              </g>
            ) : (
              // Awaken / Anxious sitting position
              <g id="awoken-figure" className="transition-all duration-500">
                <circle cx="45" cy="-2" r="8" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />
                {/* Sitting up torso */}
                <path d="M 45,6 L 45,30 L 130,30" stroke="#2a2e34" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 45,15 L 75,20" stroke="#2a2e34" strokeWidth="2" /> {/* arm stretching */}
                {/* Sigh breath ripple */}
                <circle cx="58" cy="-2" r="3" fill="none" stroke="#2a2e34" opacity="0.25" strokeWidth="0.5" />
              </g>
            )}
          </g>

          {/* Floating glowing Phone Surges panel */}
          <g 
            transform="translate(190, 45)" 
            opacity={smoothProgress > 0.14 && smoothProgress < 0.32 ? 1 : 0}
            style={{ transition: "opacity 0.4s ease-out" }}
          >
            {/* Glassmorphic card frame */}
            <rect width="130" height="90" fill="#e9eaec" fillOpacity="0.92" stroke="#2a2e34" strokeWidth="2" rx="12" filter="url(#shadow)" />
            <rect width="130" height="18" fill="#2a2e34" rx="12" />
            <text x="65" y="12" textAnchor="middle" fill="#e9eaec" className="font-mono text-[7px] font-black tracking-wider">08:12 AM • OUTBOX</text>

            {/* Uber / Ola pricing rows */}
            <g transform="translate(10, 28)">
              {/* Row 1: Cab Fare */}
              <text y="8" fill="#2a2e34" className="font-sans text-[8px] font-bold">Cab Fare</text>
              <text x="110" y="8" textAnchor="end" fill="#ffb300" className="font-mono text-[8px] font-black" filter="url(#glow-yellow)">₹520</text>
              <line x1="0" y1="12" x2="110" y2="12" stroke="#2a2e34" strokeWidth="0.5" opacity="0.1" />

              {/* Row 2: Ride Status */}
              <text y="24" fill="#2a2e34" className="font-sans text-[8px] font-bold">Ride Status</text>
              <text x="110" y="24" textAnchor="end" fill="#ff4444" className="font-mono text-[8px] font-bold">Cancelled</text>
              <line x1="0" y1="28" x2="110" y2="28" stroke="#2a2e34" strokeWidth="0.5" opacity="0.1" />

              {/* Row 3: Bike Available */}
              <text y="40" fill="#2a2e34" className="font-sans text-[8px] font-bold">Bike Available</text>
              <text x="110" y="40" textAnchor="end" fill="#ff4444" className="font-mono text-[8px] font-bold">None</text>
            </g>

            {/* Red phone notification indicator */}
            <circle cx="118" cy="9" r="3" fill="#ff4444" />
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
            transform={`translate(160, 130) ${smoothProgress > 0.48 && smoothProgress < 0.60 ? `translate(0, ${Math.sin(Date.now() * 0.25) * 1.5})` : ""}`}
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
          <line x1="0" y1="190" x2="800" y2="190" stroke="#2a2e34" strokeWidth="4" />
          <line x1="0" y1="280" x2="800" y2="280" stroke="#2a2e34" strokeWidth="2.5" />
          <line x1="0" y1="100" x2="800" y2="100" stroke="#2a2e34" strokeWidth="2.5" />

          {/* Moving road dash segments based on progress for infinite scrolling feeling */}
          <g stroke="#ffb300" strokeWidth="3" strokeDasharray="30,25" strokeDashoffset={smoothProgress * -1200}>
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
            {/* 1. Rear Wheel - spinning spokes */}
            <circle cx="-40" cy="65" r="20" fill="none" stroke="#2a2e34" strokeWidth="4.5" />
            <circle cx="-40" cy="65" r="16" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <g className="bike-wheel-spin" style={{ transformOrigin: "-40px 65px" }}>
              <line x1="-40" y1="45" x2="-40" y2="85" stroke="#2a2e34" strokeWidth="1.8" />
              <line x1="-60" y1="65" x2="-20" y2="65" stroke="#2a2e34" strokeWidth="1.8" />
              <line x1="-54" y1="51" x2="-26" y2="79" stroke="#2a2e34" strokeWidth="1.8" />
              <line x1="-26" y1="51" x2="-54" y2="79" stroke="#2a2e34" strokeWidth="1.8" />
            </g>

            {/* 2. Front Wheel - spinning spokes */}
            <circle cx="50" cy="65" r="20" fill="none" stroke="#2a2e34" strokeWidth="4.5" />
            <circle cx="50" cy="65" r="16" fill="none" stroke="#2a2e34" strokeWidth="1" />
            <g className="bike-wheel-spin" style={{ transformOrigin: "50px 65px" }}>
              <line x1="50" y1="45" x2="50" y2="85" stroke="#2a2e34" strokeWidth="1.8" />
              <line x1="30" y1="65" x2="70" y2="65" stroke="#2a2e34" strokeWidth="1.8" />
              <line x1="36" y1="51" x2="64" y2="79" stroke="#2a2e34" strokeWidth="1.8" />
              <line x1="64" y1="51" x2="36" y2="79" stroke="#2a2e34" strokeWidth="1.8" />
            </g>
            {/* Front Mudguard */}
            <path d="M 33,56 Q 50,40 67,56" fill="none" stroke="#2a2e34" strokeWidth="3" strokeLinecap="round" />

            {/* 3. Front Telescopic Fork */}
            <line x1="50" y1="65" x2="33" y2="15" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />

            {/* 4. Rear Coil Spring Suspension */}
            <path d="M -26,45 L -26,62" stroke="#2a2e34" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M -29,47 Q -23,47 -26,49 Q -29,51 -26,53 Q -23,55 -26,57 Q -29,59 -26,61" fill="none" stroke="#ffb300" strokeWidth="2" />

            {/* 5. Engine and Gearbox Block */}
            <rect x="-10" y="52" width="30" height="20" rx="5" fill="#e9eaec" stroke="#2a2e34" strokeWidth="2" />

            {/* 6. Exhaust silencer muffler & shield */}
            <rect x="-56" y="66" width="42" height="9" rx="2.5" fill="#2a2e34" stroke="#e9eaec" strokeWidth="1" />
            <rect x="-46" y="67" width="26" height="3" rx="1.5" fill="#e9eaec" />

            {/* 7. Matte Charcoal Fuel Tank & golden decal */}
            <path d="M -12,26 Q 8,5 34,22 C 40,26 40,30 34,34 Q 11,36 -12,26 Z" fill="#2a2e34" stroke="#2a2e34" strokeWidth="1" />
            <path d="M -6,22 Q 8,14 26,24" fill="none" stroke="#ffb300" strokeWidth="2" />

            {/* 8. Handlebars and Mirrors */}
            <line x1="33" y1="15" x2="18" y2="12" stroke="#2a2e34" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 23,13 L 15,3" stroke="#2a2e34" strokeWidth="1.5" />

            {/* 9. Extended comfort seat */}
            <path d="M -32,27 Q -16,22 -4,23 Q 12,24 20,29 L 20,33 Q -4,34 -32,27 Z" fill="#2a2e34" opacity="0.9" />

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
            <circle cx="39" cy="22" r="4.5" fill="#ffb300" />
            <polygon points="41,22 160,-20 160,80" fill="#ffb300" fillOpacity="0.15" filter="url(#glow-yellow)" />

            {/* 13. Brake light glowing softly */}
            <circle cx="-35" cy="25" r="2.5" fill="#ff4444" opacity="0.8" />

            {/* Rohit (Host) */}
            <circle cx="10" cy="10" r="8.5" fill="#ffb300" stroke="#2a2e34" strokeWidth="1.5" />
            <path d="M 6,7 L 16,7 Q 18,10 16,13 L 9,13 Z" fill="#2a2e34" /> {/* Visor */}
            <path d="M 10,18 L 10,42" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
            {/* Arms holding handlebars */}
            <path d="M 10,24 L 28,26" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />

            {/* Aman (Guest) */}
            <circle cx="-16" cy="14" r="8.5" fill="#2a2e34" stroke="#ffb300" strokeWidth="1.5" />
            <path d="M -12,11 L -2,11 Q 0,14 -2,17 L -9,17 Z" fill="#ffb300" opacity="0.9" /> {/* Amber Visor */}
            <path d="M -16,22 L -18,46" stroke="#2a2e34" strokeWidth="3.5" strokeLinecap="round" />
            {/* Arms holding host */}
            <path d="M -18,28 L -2,26" stroke="#2a2e34" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Active GPS Route line drawn directly beneath the bike */}
          <path 
            d="M 0,210 L 280,210" 
            stroke="#ffb300" 
            strokeWidth="5" 
            filter="url(#glow-yellow)" 
            strokeLinecap="round" 
            opacity={smoothProgress > 0.70 && smoothProgress < 0.93 ? 1 : 0} 
            style={{ transition: "opacity 0.4s" }}
          />

          {/* Integrated real-time product feature HUD floating tags */}
          <g 
            transform="translate(340, 20)"
            opacity={smoothProgress > 0.72 && smoothProgress < 0.90 ? 1 : 0}
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
            <g transform="translate(140, 0)" filter="url(#shadow)">
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

          {/* Floating wallet payout details */}
          <g 
            transform="translate(280, 50)"
            opacity={smoothProgress > 0.88 && smoothProgress < 0.95 ? 1 : 0}
            style={{ transition: "opacity 0.4s" }}
          >
            {/* Wallet glassmorphic outline */}
            <rect width="130" height="75" fill="#e9eaec" fillOpacity="0.95" stroke="#2a2e34" strokeWidth="2" rx="12" filter="url(#shadow)" />
            <rect width="130" height="18" fill="#ffb300" rx="12" />
            <text x="65" y="12" textAnchor="middle" fill="#2a2e34" className="font-mono text-[7px] font-black tracking-wider">COMMUTING PAYOUT</text>

            <g transform="translate(12, 28)">
              <text y="10" fill="#2a2e34" className="font-sans text-[8px] font-bold">Aman (Saved 75%)</text>
              <text x="105" y="10" textAnchor="end" fill="#2a2e34" className="font-mono text-[8px] font-black">₹340 SAVED</text>
              <line x1="0" y1="16" x2="105" y2="16" stroke="#2a2e34" strokeWidth="0.5" opacity="0.1" />

              <text y="28" fill="#2a2e34" className="font-sans text-[8px] font-bold">Rohit (Fuel Covered)</text>
              <text x="105" y="28" textAnchor="end" fill="#ffb300" className="font-mono text-[8px] font-black" filter="url(#glow-yellow)">₹180 EARNED</text>
              <line x1="0" y1="34" x2="105" y2="34" stroke="#2a2e34" strokeWidth="0.5" opacity="0.1" />
              
              <text y="44" fill="#2a2e34" opacity="0.5" className="font-sans text-[7px]">Auto-split matching completed</text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
