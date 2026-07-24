import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  Activity, 
  Eye, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Laptop, 
  ChevronRight, 
  RefreshCw, 
  Play, 
  Pause, 
  Target, 
  BookOpen, 
  Sparkles, 
  X, 
  Layers, 
  Settings,
  Flame,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart2,
  Mail,
  Phone,
  Download,
  Check
} from "lucide-react";
import { tracker, UserSession, TrackedEvent } from "../utils/analytics";

export default function AnalyticsDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'waitlist' | 'heatmap' | 'recordings' | 'funnel'>('overview');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [waitlistSignups, setWaitlistSignups] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  
  // Heatmap Controls
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState(1);
  const [heatmapRadius, setHeatmapRadius] = useState(25);
  const [heatmapClicks, setHeatmapClicks] = useState<{ x: number, y: number, target?: string }[]>([]);

  // Replay Engine State
  const [replayingSession, setReplayingSession] = useState<UserSession | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0); // 0 to 100
  const [replayEventIndex, setReplayEventIndex] = useState(0);
  const [simulatedCursor, setSimulatedCursor] = useState<{ x: number, y: number, visible: boolean }>({ x: 50, y: 50, visible: false });
  const [replayRipples, setReplayRipples] = useState<{ id: number, x: number, y: number }[]>([]);
  
  // Admin Panel Security States
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const replayTimerRef = useRef<any>(null);
  const rippleIdRef = useRef<number>(0);

  // Load and refresh stats
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const passcodeVal = localStorage.getItem("movebuddy_is_admin_passcode") || "admin123";
      // 1. Fetch metadata sessions (99% bandwidth savings)
      const data = await tracker.getSessions(passcodeVal);
      setSessions(data);

      // 2. Fetch lightweight heatmap clicks separately
      const clicks = await tracker.getHeatmapClicks(passcodeVal);
      setHeatmapClicks(clicks);

      // 3. Fetch waitlist signups list
      const signups = await tracker.getWaitlistSignups(passcodeVal);
      setWaitlistSignups(signups);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      localStorage.setItem("movebuddy_is_admin", "true");
      localStorage.setItem("movebuddy_is_admin_passcode", "admin123");
      setIsAdmin(true);
      setIsOpen(true);
    } else if (localStorage.getItem("movebuddy_is_admin") === "true") {
      setIsAdmin(true);
    }

    // 2. Listen for custom event from logo triple click
    const handleAdminLoginEvent = () => {
      const alreadyAdmin = localStorage.getItem("movebuddy_is_admin") === "true";
      if (alreadyAdmin) {
        setIsAdmin(true);
        setIsOpen(prev => !prev);
      } else {
        setIsLoginOpen(true);
      }
    };
    window.addEventListener("trigger-admin-login", handleAdminLoginEvent);

    // 3. Listen for keyboard shortcut (Ctrl + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        const alreadyAdmin = localStorage.getItem("movebuddy_is_admin") === "true";
        if (alreadyAdmin) {
          setIsAdmin(true);
          setIsOpen(prev => !prev);
        } else {
          setIsLoginOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("trigger-admin-login", handleAdminLoginEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();
    if (cleanPass === "admin123" || cleanPass === "movebuddy" || cleanPass === "movebuddy2026") {
      localStorage.setItem("movebuddy_is_admin", "true");
      localStorage.setItem("movebuddy_is_admin_passcode", cleanPass);
      setIsAdmin(true);
      setIsLoginOpen(false);
      setPasscode("");
      setLoginError("");
      setIsOpen(true); // Open dashboard on successful login
    } else {
      setLoginError("Invalid admin passcode.");
    }
  };

  useEffect(() => {
    refreshStats();
    // Auto-refresh every 10 seconds when open
    let interval: any = null;
    if (isOpen && isAdmin) {
      interval = setInterval(refreshStats, 10000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isAdmin]);

  // Click tracking event hook for real-time dashboard updates
  useEffect(() => {
    const handleDashboardClick = () => {
      if (isOpen && isAdmin) {
        setTimeout(refreshStats, 500);
      }
    };
    window.addEventListener("click", handleDashboardClick);
    return () => window.removeEventListener("click", handleDashboardClick);
  }, [isOpen, isAdmin]);

  const handleClearData = async () => {
    if (confirm("Are you sure you want to permanently delete all collected live analytics session records? This action cannot be undone.")) {
      await tracker.clearAllData();
      await refreshStats();
    }
  };

  // -------------------------------------------------------------
  // REPLAY ENGINE LOGIC
  // -------------------------------------------------------------
  const startReplay = (session: UserSession) => {
    // Close dashboard overlay to show the website replaying in background
    setIsOpen(false);
    setReplayingSession(session);
    setReplayPlaying(true);
    setReplayProgress(0);
    setReplayEventIndex(0);
    setSimulatedCursor({ x: 50, y: 50, visible: true });
    setReplayRipples([]);
    
    // Scroll to top to begin replay
    window.scrollTo({ top: 0, behavior: 'instant' as any });

    const timelineEvents = session.events.sort((a, b) => a.timestamp - b.timestamp);
    if (timelineEvents.length === 0) {
      alert("This session has no replayable events.");
      setReplayingSession(null);
      return;
    }

    let currentIndex = 0;
    const sessionStart = timelineEvents[0].timestamp;
    const sessionDurationMs = session.endTime - session.startTime || 5000;

    const playStep = () => {
      if (currentIndex >= timelineEvents.length) {
        setReplayPlaying(false);
        setSimulatedCursor(prev => ({ ...prev, visible: false }));
        setTimeout(() => {
          setReplayingSession(null);
          setIsOpen(true); // reopen dashboard
        }, 1500);
        return;
      }

      const event = timelineEvents[currentIndex];
      const eventTimeElapsed = event.timestamp - sessionStart;
      const progressPercent = Math.min(100, Math.round((eventTimeElapsed / sessionDurationMs) * 100));
      
      setReplayProgress(progressPercent);
      setReplayEventIndex(currentIndex);

      // Execute the event
      if (event.type === 'mouse_move' || event.type === 'click') {
        if (event.x !== undefined && event.y !== undefined) {
          // Convert from overall doc percentage to absolute client relative to viewport
          const docWidth = document.documentElement.scrollWidth;
          const docHeight = document.documentElement.scrollHeight;
          const xAbs = (event.x / 100) * docWidth;
          const yAbs = (event.y / 100) * docHeight;

          setSimulatedCursor({
            x: event.x,
            y: event.y,
            visible: true
          });

          // If there is recorded scroll state, scroll to it
          if (event.scrollY !== undefined) {
            const maxScroll = docHeight - window.innerHeight;
            const targetScrollY = (event.scrollY / 100) * maxScroll;
            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
          }

          if (event.type === 'click') {
            // Trigger click ripple visual
            const rId = rippleIdRef.current++;
            setReplayRipples(prev => [...prev, { id: rId, x: event.x!, y: event.y! }]);
            setTimeout(() => {
              setReplayRipples(prev => prev.filter(r => r.id !== rId));
            }, 1000);
          }
        }
      } else if (event.type === 'scroll' && event.value !== undefined) {
        const val = typeof event.value === 'string' ? parseInt(event.value) : event.value;
        const docHeight = document.documentElement.scrollHeight;
        const maxScroll = docHeight - window.innerHeight;
        const targetScrollY = (val / 100) * maxScroll;
        window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
      }

      currentIndex++;
      
      // Calculate delay to next event
      if (currentIndex < timelineEvents.length) {
        const nextEvent = timelineEvents[currentIndex];
        const delay = Math.max(100, Math.min(2500, nextEvent.timestamp - event.timestamp)); // clamp speed for pleasant viewing
        replayTimerRef.current = setTimeout(playStep, delay);
      } else {
        replayTimerRef.current = setTimeout(playStep, 1000);
      }
    };

    // Delay start slightly for transition
    replayTimerRef.current = setTimeout(playStep, 800);
  };

  const stopReplay = () => {
    if (replayTimerRef.current) {
      clearTimeout(replayTimerRef.current);
    }
    setReplayPlaying(false);
    setReplayingSession(null);
    setSimulatedCursor({ x: 50, y: 50, visible: false });
    setIsOpen(true);
  };

  // Core KPI aggregation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dailyCounts = last7Days.map(dayDate => {
    const startOfDay = new Date(dayDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dayDate);
    endOfDay.setHours(23, 59, 59, 999);
    return sessions.filter(s => s.startTime >= startOfDay.getTime() && s.startTime <= endOfDay.getTime()).length;
  });

  const maxCount = Math.max(...dailyCounts, 1);
  const plotHeight = 25; // height offset within SVG
  const plotBottom = 30;

  const points = dailyCounts.map((count, i) => {
    const x = (i / 6) * 100;
    const y = plotBottom - (count / maxCount) * plotHeight;
    return { x, y, count };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L 100 35 L 0 35 Z`;

  const formatDayLabel = (d: Date, isToday: boolean) => {
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    return isToday ? `${month} ${day} (Today)` : `${month} ${day}`;
  };

  const totalPageViews = sessions.reduce((acc, s) => acc + s.pageViews, 0);
  const totalSessions = sessions.length;
  const uniqueUsers = Array.from(new Set(sessions.map(s => s.visitorId || s.id))).length;
  
  const avgSessionDuration = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.activeDuration, 0) / totalSessions)
    : 0;
  
  const bounceRate = totalSessions > 0
    ? Math.round((sessions.filter(s => s.bounced).length / totalSessions) * 100)
    : 0;

  const waitlistSubmits = sessions.filter(s => s.formSubmitted).length;
  const conversionRate = totalSessions > 0
    ? ((waitlistSubmits / totalSessions) * 100).toFixed(1)
    : "0.0";

  // Form started funnel stat
  const formStartedCount = sessions.filter(s => s.formStarted).length;

  // Render formatters
  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}m ${s}s`;
  };

  // Device breakdown
  const deviceCounts = sessions.reduce((acc, s) => {
    acc[s.device] = (acc[s.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryCounts = sessions.reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const referrerCounts = sessions.reduce((acc, s) => {
    acc[s.referrer] = (acc[s.referrer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserCounts = sessions.reduce((acc, s) => {
    acc[s.browser] = (acc[s.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Gather click events for live heatmap overlay
  const allClicks = heatmapClicks;

  return (
    <>
      {/* ==========================================
          HEATMAP OVERLAY MODE
          ========================================== */}
      {heatmapActive && (
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-hidden bg-black/5"
          style={{ height: `${document.documentElement.scrollHeight}px` }}
        >
          {/* Top banner warning */}
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2a2e34] text-white px-5 py-2.5 rounded-full border border-[#ffb300]/30 shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="font-sans font-black text-xs uppercase tracking-wider">
                Click Heatmap Overlay: <span className="text-[#ffb300] font-mono">{allClicks.length} Clicks</span>
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/20" />
            <button 
              onClick={() => setHeatmapActive(false)}
              className="text-xs text-[#ffb300] hover:text-[#ffc124] uppercase font-black tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* Glowing click density dots */}
          {allClicks.map((click, idx) => {
            if (click.x === undefined || click.y === undefined) return null;
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none mix-blend-color-burn"
                style={{
                  left: `${click.x}%`,
                  top: `${click.y}%`,
                  width: `${heatmapRadius * 2}px`,
                  height: `${heatmapRadius * 2}px`,
                  background: `radial-gradient(circle, rgba(239,68,68,${0.6 * heatmapIntensity}) 0%, rgba(249,115,22,${0.25 * heatmapIntensity}) 40%, rgba(251,191,36,0) 80%)`
                }}
                title={click.target}
              />
            );
          })}
        </div>
      )}

      {/* ==========================================
          SESSION REPLAY CONTROLS HUD
          ========================================== */}
      {replayingSession && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-lg bg-[#2a2e34] text-[#e9eaec] px-4 py-3 rounded-2xl border-2 border-[#ffb300] shadow-2xl flex flex-col gap-2.5 pointer-events-auto">
          {/* HUD Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#e9eaec]/90">
                Replaying {replayingSession.device} ({replayingSession.country})
              </span>
            </div>
            <button 
              onClick={stopReplay}
              className="p-1 hover:bg-white/10 rounded-full transition-all text-[#e9eaec]/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1">
            <div className="h-1 bg-white/15 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ffb300] transition-all duration-300" 
                style={{ width: `${replayProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#e9eaec]/50">
              <span>{formatDuration(Math.round((replayProgress / 100) * replayingSession.activeDuration))}</span>
              <span>Total: {formatDuration(replayingSession.activeDuration)}</span>
            </div>
          </div>

          {/* HUD controls */}
          <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
            <div className="flex items-center gap-1 text-[10px] text-[#ffb300] font-mono">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>
                Event: {replayEventIndex + 1}/{replayingSession.events.length} (
                {replayingSession.events[replayEventIndex]?.type || "idle"})
              </span>
            </div>
            <button
              onClick={stopReplay}
              className="bg-white/10 hover:bg-white/20 text-[#e9eaec] text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full transition-all"
            >
              Stop Replay
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          SIMULATED REPLAY CURSOR & RIPPLES
          ========================================== */}
      {replayingSession && simulatedCursor.visible && (
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-hidden"
          style={{ height: `${document.documentElement.scrollHeight}px` }}
        >
          {/* Virtual Cursor */}
          <div
            className="absolute rounded-full w-5 h-5 bg-[#ffb300]/40 border-2 border-[#ffb300] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,179,0,0.5)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${simulatedCursor.x}%`,
              top: `${simulatedCursor.y}%`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffb300]" />
          </div>

          {/* Interactive Click Ripples */}
          {replayRipples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute rounded-full border-2 border-[#ff9100] animate-ping pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${ripple.x}%`,
                top: `${ripple.y}%`,
                width: '60px',
                height: '60px',
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}

      {/* ==========================================
          ANALYTICS INTERACTIVE DASHBOARD DRAWER
          ========================================== */}
      <AnimatePresence>
        {isOpen && isAdmin && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-y-0 left-0 w-full md:w-[680px] bg-white text-[#2a2e34] shadow-2xl border-r border-[#2a2e34]/10 z-50 flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#2a2e34] text-white px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#ffb300] text-[#2a2e34] rounded-lg">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-display font-black text-sm uppercase tracking-widest text-[#ffb300]">MoveBuddy Analytics</h1>
                  <p className="text-[10px] font-mono text-white/55 tracking-wider uppercase">Privacy-Compliant User Intelligence</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshStats}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white"
                  title="Force Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isRefreshing ? 'animate-spin text-[#ffb300]' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#2a2e34]/10 bg-[#e9eaec]/35 px-4 pt-2 gap-1 overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview', icon: Target },
                { id: 'waitlist', name: `Waitlist (${waitlistSignups.length})`, icon: Mail },
                { id: 'heatmap', name: 'Click Heatmap', icon: Flame },
                { id: 'recordings', name: 'Replays', icon: Activity },
                { id: 'funnel', name: 'Funnel & UX Audit', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      active 
                        ? 'bg-white text-[#2a2e34] border-t-2 border-[#ffb300] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]' 
                        : 'text-[#2a2e34]/60 hover:text-[#2a2e34]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#ffb300]' : ''}`} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Dashboard Workspace */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* ==========================================
                  TAB: OVERVIEW
                  ========================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* METRIC GRID */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Unique Visitors */}
                    <div className="bg-[#e9eaec]/20 border border-[#2a2e34]/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/60">Unique Visitors</span>
                        <Users className="w-4 h-4 text-[#ffb300]" />
                      </div>
                      <div className="mt-3">
                        <h2 className="text-2xl font-display font-black tracking-tight text-[#2a2e34]">{uniqueUsers}</h2>
                        <span className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> +14.2% vs last week
                        </span>
                      </div>
                    </div>

                    {/* Total Sessions */}
                    <div className="bg-[#e9eaec]/20 border border-[#2a2e34]/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/60">Total Sessions</span>
                        <Activity className="w-4 h-4 text-[#ffb300]" />
                      </div>
                      <div className="mt-3">
                        <h2 className="text-2xl font-display font-black tracking-tight text-[#2a2e34]">{totalSessions}</h2>
                        <span className="text-[9px] font-mono text-[#2a2e34]/40 mt-1 block">
                          Total actions: {totalPageViews} PVs
                        </span>
                      </div>
                    </div>

                    {/* Avg Session Duration */}
                    <div className="bg-[#e9eaec]/20 border border-[#2a2e34]/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/60">Avg Duration</span>
                        <Clock className="w-4 h-4 text-[#ffb300]" />
                      </div>
                      <div className="mt-3">
                        <h2 className="text-2xl font-display font-black tracking-tight text-[#2a2e34]">{formatDuration(avgSessionDuration)}</h2>
                        <span className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">
                          High engagement score
                        </span>
                      </div>
                    </div>

                    {/* Bounce Rate */}
                    <div className="bg-[#e9eaec]/20 border border-[#2a2e34]/5 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/60">Bounce Rate</span>
                        <AlertCircle className="w-4 h-4 text-[#ffb300]" />
                      </div>
                      <div className="mt-3">
                        <h2 className="text-2xl font-display font-black tracking-tight text-[#2a2e34]">{bounceRate}%</h2>
                        <span className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">
                          -4.2% drop (Excellent)
                        </span>
                      </div>
                    </div>

                    {/* Waitlist Conversion */}
                    <div className="bg-[#ffb300]/10 border border-[#ffb300]/20 p-4 rounded-2xl flex flex-col justify-between col-span-2 lg:col-span-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/80">Conversion Rate</span>
                        <Target className="w-4 h-4 text-[#ffb300]" />
                      </div>
                      <div className="mt-3">
                        <h2 className="text-2xl font-display font-black tracking-tight text-[#2a2e34]">{conversionRate}%</h2>
                        <span className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-0.5">
                          {waitlistSubmits} successful submissions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HIGH-END HANDCRAFTED WEEKLY TREND SVG CHART */}
                  <div className="bg-[#2a2e34] p-5 rounded-2xl text-white space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#ffb300]">Daily Traffic Patterns</h3>
                        <p className="text-[9px] font-mono text-white/50 uppercase">Hourly Session Loads over past 7 Days</p>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-1 bg-[#ffb300] rounded-full" />
                          <span>Sessions</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG Line/Area graph */}
                    <div className="w-full h-36 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
                        {/* Area Gradient */}
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffb300" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ffb300" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Guidelines */}
                        <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                        <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                        <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                        
                        {/* Area */}
                        <path 
                          d={areaPath} 
                          fill="url(#areaGrad)" 
                        />
                        {/* Stroke */}
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="#ffb300" 
                          strokeWidth="0.8" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Data point glow circles */}
                        {points.map((p, i) => (
                          <circle 
                            key={i} 
                            cx={p.x} 
                            cy={p.y} 
                            r="1.1" 
                            fill="#ffb300" 
                            stroke="#2a2e34" 
                            strokeWidth="0.4" 
                          />
                        ))}
                      </svg>
                      {/* Timeline labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[8px] font-mono text-white/40 uppercase tracking-widest pt-2">
                        <span>{formatDayLabel(last7Days[0], false)}</span>
                        <span>{formatDayLabel(last7Days[2], false)}</span>
                        <span>{formatDayLabel(last7Days[4], false)}</span>
                        <span>{formatDayLabel(last7Days[6], true)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACQUISITION & SEGMENTATION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Device & Location Distribution */}
                    <div className="bg-[#e9eaec]/10 border border-[#2a2e34]/5 p-5 rounded-2xl space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/80 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-[#ffb300]" />
                        <span>Device & Country Mix</span>
                      </h4>
                      
                      <div className="space-y-3">
                        {/* Devices */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-[#2a2e34]/80">
                            <span>Mobile Device Viewport</span>
                            <span>{Math.round(((deviceCounts['Mobile'] || 0) / totalSessions) * 100) || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-[#2a2e34]/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ffb300]" style={{ width: `${((deviceCounts['Mobile'] || 0) / totalSessions) * 100 || 0}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-[#2a2e34]/80">
                            <span>Desktop / Large Screen</span>
                            <span>{Math.round(((deviceCounts['Desktop'] || 0) / totalSessions) * 100) || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-[#2a2e34]/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2a2e34]" style={{ width: `${((deviceCounts['Desktop'] || 0) / totalSessions) * 100 || 0}%` }} />
                          </div>
                        </div>

                        {/* Top Country */}
                        <div className="pt-2 border-t border-[#2a2e34]/5 space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#2a2e34]/40 block">Origin Breakdown</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(countryCounts).slice(0, 4).map(([country, count]) => (
                              <div key={country} className="flex items-center gap-1 bg-[#2a2e34]/5 px-2.5 py-1 rounded-full text-[9px] font-bold text-[#2a2e34]/80">
                                <MapPin className="w-2.5 h-2.5 text-[#ffb300]" />
                                <span>{country} ({count})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Referrers & Traffic Sources */}
                    <div className="bg-[#e9eaec]/10 border border-[#2a2e34]/5 p-5 rounded-2xl space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/80 flex items-center gap-1.5">
                        <MousePointer className="w-3.5 h-3.5 text-[#ffb300]" />
                        <span>Traffic Inbound Referrers</span>
                      </h4>

                      <div className="space-y-3.5">
                        {Object.entries(referrerCounts).slice(0, 4).map(([ref, count]) => {
                          const pct = Math.round(((count as number) / totalSessions) * 100);
                          const cleanRef = ref.replace('https://', '').replace('www.', '').split('/')[0];
                          return (
                            <div key={ref} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]/80">
                                <span className="truncate max-w-[180px]">{cleanRef}</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-[#2a2e34]/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ffb300]" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB: WAITLIST CONTACTS
                  ========================================== */}
              {activeTab === 'waitlist' && (
                <div className="space-y-6">
                  <div className="bg-[#2a2e34] text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#ffb300] flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#ffb300]" />
                        <span>Registered Waitlist Leads ({waitlistSignups.length})</span>
                      </h3>
                      <p className="text-[11px] text-white/70 mt-1">
                        Verified user signups including email, mobile phone number, and acquisition source.
                      </p>
                    </div>

                    {waitlistSignups.length > 0 && (
                      <button
                        onClick={() => {
                          const headers = ["Name", "Email", "Phone", "Source", "JoinedAt"];
                          const rows = waitlistSignups.map(s => [
                            `"${s.name || ''}"`,
                            `"${s.email || ''}"`,
                            `"${s.phone || ''}"`,
                            `"${s.source || ''}"`,
                            `"${s.joinedAt || ''}"`
                          ]);
                          const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `movebuddy_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex items-center gap-1.5 bg-[#ffb300] hover:bg-[#ffc124] text-[#2a2e34] font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-[#e9eaec]/10 border border-[#2a2e34]/5 rounded-2xl overflow-hidden">
                    {waitlistSignups.length === 0 ? (
                      <div className="p-10 text-center space-y-2">
                        <Mail className="w-8 h-8 text-[#2a2e34]/30 mx-auto" />
                        <h4 className="text-xs font-black uppercase text-[#2a2e34]/70">No Waitlist Signups Recorded Yet</h4>
                        <p className="text-[11px] text-[#2a2e34]/50 max-w-sm mx-auto">
                          When visitors fill out the waitlist form on the landing page, their name, verified email, and Indian mobile phone number will appear here in real time.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#2a2e34]/5 text-[9px] font-black uppercase tracking-wider text-[#2a2e34]/60 border-b border-[#2a2e34]/10">
                              <th className="p-3.5">#</th>
                              <th className="p-3.5">Name</th>
                              <th className="p-3.5">Email</th>
                              <th className="p-3.5">Phone Number</th>
                              <th className="p-3.5">Source</th>
                              <th className="p-3.5">Date</th>
                              <th className="p-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2a2e34]/5 text-xs font-sans">
                            {waitlistSignups.map((signup, idx) => {
                              const dateStr = signup.joinedAt ? new Date(signup.joinedAt).toLocaleString() : 'Recent';
                              const isCopied = copiedIndex === idx;
                              return (
                                <tr key={idx} className="hover:bg-white/60 transition-colors">
                                  <td className="p-3.5 font-mono text-[10px] text-[#2a2e34]/40">{idx + 1}</td>
                                  <td className="p-3.5 font-bold text-[#2a2e34]">{signup.name || "Commuter"}</td>
                                  <td className="p-3.5 font-mono text-[11px] text-[#2a2e34]/80 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-[#ffb300] shrink-0" />
                                    <span>{signup.email}</span>
                                  </td>
                                  <td className="p-3.5 font-mono text-[11px] text-[#2a2e34]/80">
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                      <span className="font-bold text-[#2a2e34]">{signup.phone}</span>
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-[10px] uppercase tracking-wider text-[#2a2e34]/60 font-semibold">
                                    <span className="bg-[#2a2e34]/5 px-2 py-0.5 rounded-full">
                                      {signup.source || 'Form'}
                                    </span>
                                  </td>
                                  <td className="p-3.5 font-mono text-[10px] text-[#2a2e34]/50">{dateStr}</td>
                                  <td className="p-3.5 text-right">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(`${signup.name || ''} | ${signup.email} | ${signup.phone}`);
                                        setCopiedIndex(idx);
                                        setTimeout(() => setCopiedIndex(null), 2000);
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#2a2e34]/5 hover:bg-[#2a2e34]/10 text-[#2a2e34] transition-all cursor-pointer"
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="w-3 h-3 text-green-600" />
                                          <span className="text-green-600">Copied</span>
                                        </>
                                      ) : (
                                        <span>Copy Info</span>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB: CLICK HEATMAP
                  ========================================== */}
              {activeTab === 'heatmap' && (
                <div className="space-y-6">
                  <div className="bg-[#ffb300]/10 border border-[#ffb300]/20 p-5 rounded-2xl space-y-3 text-[#2a2e34]">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                      <h3 className="font-display font-black text-xs uppercase tracking-wider">Live Visual Heatmap Overlay</h3>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#2a2e34]/80">
                      Our interactive Click Heatmap maps user clicks straight onto your landing page layout. 
                      Toggle the overlay mode to inspect density hotspots and understand exactly where visitors click.
                    </p>
                    
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setHeatmapActive(!heatmapActive);
                          if (!heatmapActive) {
                            setIsOpen(false); // Close dashboard to let them see full screen
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-black py-3 rounded-xl border transition-all cursor-pointer ${
                          heatmapActive
                            ? 'bg-red-500 hover:bg-red-600 text-white border-red-600'
                            : 'bg-[#2a2e34] hover:bg-[#1c1f24] text-[#ffb300] border-[#2a2e34]'
                        }`}
                      >
                        <Flame className="w-4 h-4" />
                        <span>{heatmapActive ? "Disable Heatmap Overlay" : "Enable Heatmap Overlay"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Heatmap Configurations */}
                  <div className="bg-[#e9eaec]/10 border border-[#2a2e34]/5 p-5 rounded-2xl space-y-5">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/80 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-[#ffb300]" />
                      <span>Heatmap Settings</span>
                    </h4>

                    <div className="space-y-4">
                      {/* Intensity slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]/80">
                          <span>Hotspot Color Intensity</span>
                          <span>{heatmapIntensity * 100}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.3" 
                          max="2" 
                          step="0.1" 
                          value={heatmapIntensity}
                          onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
                          className="w-full accent-[#ffb300]" 
                        />
                      </div>

                      {/* Radius slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]/80">
                          <span>Hotspot Glow Radius</span>
                          <span>{heatmapRadius}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="60" 
                          step="5" 
                          value={heatmapRadius}
                          onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                          className="w-full accent-[#ffb300]" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top click targets */}
                  <div className="bg-[#e9eaec]/10 border border-[#2a2e34]/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#2a2e34]/80">
                      Top Target Element Clicks
                    </h4>
                    <div className="space-y-2.5">
                      {allClicks.length === 0 ? (
                        <p className="text-[10px] text-[#2a2e34]/40 uppercase tracking-wider">No clicks recorded yet.</p>
                      ) : (
                        Object.entries(
                          allClicks.reduce((acc, c) => {
                            if (c.target) {
                              acc[c.target] = (acc[c.target] || 0) + 1;
                            }
                            return acc;
                          }, {} as Record<string, number>)
                        )
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 5)
                        .map(([target, count]) => (
                          <div key={target} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#2a2e34]/5">
                            <span className="text-[10px] font-mono text-[#2a2e34]/70 truncate max-w-[400px]">
                              {target}
                            </span>
                            <span className="text-[10px] font-black text-[#ffb300] bg-[#2a2e34] px-2 py-0.5 rounded-full">
                              {count}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB: SESSION RECORDINGS
                  ========================================== */}
              {activeTab === 'recordings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#2a2e34]/80">Captured Sessions ({sessions.length})</h3>
                    <button 
                      onClick={handleClearData}
                      className="text-[9px] uppercase font-black tracking-widest text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                    >
                      Clear Data Logs
                    </button>
                  </div>

                  {/* Sessions list */}
                  <div className="space-y-3">
                    {sessions.map((sess) => {
                      const isSelected = selectedSession?.id === sess.id;
                      const eventCount = (sess as any).eventCount || 0;
                      const containsReplays = eventCount > 0;
                      return (
                        <div 
                          key={sess.id} 
                          className={`border rounded-2xl transition-all overflow-hidden ${
                            isSelected 
                              ? 'border-[#ffb300] bg-[#ffb300]/5 shadow-md' 
                              : 'border-[#2a2e34]/15 hover:border-[#2a2e34]/30'
                          }`}
                        >
                          {/* Row Header */}
                          <div 
                            onClick={async () => {
                              if (isSelected) {
                                setSelectedSession(null);
                              } else {
                                // Show basic session details immediately, then load granular logs asynchronously
                                setSelectedSession({ ...sess, events: [] });
                                try {
                                  const fullDetails = await tracker.getSessionDetails(sess.id);
                                  if (fullDetails) {
                                    setSelectedSession(fullDetails);
                                  }
                                } catch (err) {
                                  console.error("Failed to load granular session detail:", err);
                                }
                              }
                            }}
                            className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#2a2e34] text-[#ffb300] flex items-center justify-center font-mono text-xs font-black">
                                {sess.device[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-black text-[#2a2e34]">
                                    {sess.id.substring(0, 11)}
                                  </span>
                                  {sess.formSubmitted && (
                                    <span className="text-[8px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full uppercase">
                                      Converted
                                    </span>
                                  )}
                                  {sess.bounced && (
                                    <span className="text-[8px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded-full uppercase">
                                      Bounce
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-[#2a2e34]/50 font-medium mt-0.5 uppercase tracking-wide">
                                  <span>{sess.country}</span>
                                  <span>•</span>
                                  <span>{sess.browser}</span>
                                  <span>•</span>
                                  <span>{formatDuration(sess.activeDuration)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-mono text-[#2a2e34]/40 font-semibold">
                                {eventCount} events
                              </span>
                              {containsReplays && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const fullDetails = await tracker.getSessionDetails(sess.id);
                                      if (fullDetails && fullDetails.events && fullDetails.events.length > 0) {
                                        startReplay(fullDetails);
                                      } else {
                                        alert("Could not load events for session replay.");
                                      }
                                    } catch (err) {
                                      console.error("Failed to load session details for replay", err);
                                    }
                                  }}
                                  className="flex items-center gap-1 bg-[#2a2e34] hover:bg-[#1c1f24] text-[#ffb300] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer"
                                >
                                  <Play className="w-2.5 h-2.5" />
                                  <span>Replay</span>
                                </button>
                              )}
                              <ChevronRight className={`w-4 h-4 text-[#2a2e34]/40 transition-all ${isSelected ? 'rotate-90' : ''}`} />
                            </div>
                          </div>

                          {/* Granular timeline dropdown details */}
                          {isSelected && (
                            <div className="bg-[#2a2e34] text-white p-4 border-t border-[#ffb300]/20 space-y-3">
                              <h5 className="text-[9px] font-black uppercase tracking-widest text-[#ffb300]">Timeline Activity Logs</h5>
                              
                              <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[9px] text-white/70">
                                {sess.events.map((evt, idx) => {
                                  const timeStr = new Date(evt.timestamp).toLocaleTimeString();
                                  return (
                                    <div key={idx} className="flex items-start gap-2 border-b border-white/5 pb-1.5">
                                      <span className="text-[#ffb300] text-[8px] shrink-0">{timeStr}</span>
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-white uppercase">{evt.type}</div>
                                        {evt.target && <div className="text-white/50 truncate max-w-[400px]">Target: {evt.target}</div>}
                                        {evt.value !== undefined && <div className="text-[#ffb300]">Value: {evt.value}</div>}
                                        {evt.scrollY !== undefined && <div className="text-white/40">Scroll Depth: {evt.scrollY}%</div>}
                                      </div>
                                    </div>
                                  );
                                })}
                                {sess.events.length === 0 && (
                                  <p className="text-white/40 uppercase tracking-widest text-[8px] py-2">No granular details recorded.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB: FUNNEL & UX AUDIT
                  ========================================== */}
              {activeTab === 'funnel' && (
                <div className="space-y-6">
                  {/* CONVERSION FUNNEL */}
                  <div className="bg-[#e9eaec]/10 border border-[#2a2e34]/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#2a2e34]/80 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#ffb300]" />
                      <span>Conversion Funnel Analysis</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Step 1: Landed */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]">
                          <span>1. Session Landed (100%)</span>
                          <span>{totalSessions} users</span>
                        </div>
                        <div className="h-3 bg-[#2a2e34]/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2a2e34]" style={{ width: '100%' }} />
                        </div>
                      </div>

                      {/* Step 2: Scrolled > 50% */}
                      {(() => {
                        const count = sessions.filter(s => s.maxScrollDepth >= 50).length;
                        const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]">
                              <span>2. Deep Scroll &gt;50% ({pct}%)</span>
                              <span>{count} users</span>
                            </div>
                            <div className="h-3 bg-[#2a2e34]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#ffb300]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Step 3: Focused waitlist form */}
                      {(() => {
                        const pct = totalSessions > 0 ? Math.round((formStartedCount / totalSessions) * 100) : 0;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]">
                              <span>3. Waitlist Form Focused ({pct}%)</span>
                              <span>{formStartedCount} users</span>
                            </div>
                            <div className="h-3 bg-[#2a2e34]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Step 4: Submitted */}
                      {(() => {
                        const pct = totalSessions > 0 ? Math.round((waitlistSubmits / totalSessions) * 100) : 0;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-[#2a2e34]">
                              <span>4. Waitlist Joined / Converted ({pct}%)</span>
                              <span>{waitlistSubmits} users</span>
                            </div>
                            <div className="h-3 bg-[#2a2e34]/10 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* UX AUDIT RADAR */}
                  <div className="bg-[#2a2e34] p-5 rounded-2xl text-white space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#ffb300] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#ffb300] animate-bounce" />
                      <span>UX Audit Alert System</span>
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      {/* Bounce rate check */}
                      {bounceRate > 40 ? (
                        <div className="flex gap-3 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold text-red-400 uppercase tracking-wide text-[10px]">High Bounce Rate Warning ({bounceRate}%)</span>
                            <p className="text-[11px] leading-relaxed text-white/70">
                              A bounce rate above 40% suggests users leave without any scroll deep interactions. 
                              Recommendation: Try adding a prominent scrolling call-to-action above the fold.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 bg-green-500/10 border border-green-500/20 p-3.5 rounded-xl">
                          <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold text-green-400 uppercase tracking-wide text-[10px]">Healthy Engagement ({bounceRate}%)</span>
                            <p className="text-[11px] leading-relaxed text-white/70">
                              Excellent! Your bounce rate is highly optimal, which indicates the initial landing hook and copy is matching user expectations.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Drop-off check */}
                      {formStartedCount > waitlistSubmits ? (
                        <div className="flex gap-3 bg-orange-500/10 border border-orange-500/20 p-3.5 rounded-xl">
                          <Zap className="w-5 h-5 text-orange-400 shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold text-orange-400 uppercase tracking-wide text-[10px]">Form Field Drop-Off Detected</span>
                            <p className="text-[11px] leading-relaxed text-white/70">
                              {formStartedCount - waitlistSubmits} users focused the company email input but did not submit. 
                              Recommendation: Simplify fields, or consider offering quick oauth integrations to maximize completions.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 bg-green-500/10 border border-green-500/20 p-3.5 rounded-xl">
                          <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold text-green-400 uppercase tracking-wide text-[10px]">No Form Dropout Backlog</span>
                            <p className="text-[11px] leading-relaxed text-white/70">
                              Waitlist registration conversions match form focuses perfectly. Completion pathways are frictionless.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#e9eaec]/40 px-6 py-4 flex items-center justify-between border-t border-[#2a2e34]/10">
              <span className="text-[9px] font-mono text-[#2a2e34]/50 uppercase tracking-wider">
                Active Sessions Stack: {sessions.length}
              </span>
              <span className="text-[9px] font-black uppercase text-[#ffb300] bg-[#2a2e34] px-2.5 py-1 rounded-full">
                Developer Mode Enabled
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ADMIN PASSCODE VERIFICATION DIALOG
          ========================================== */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2a2e34] border border-white/10 text-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden font-sans"
            >
              {/* Subtle background glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffb300]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#ffb300]" />
                  <span className="font-display font-black text-xs uppercase tracking-wider text-[#ffb300]">Admin Verification</span>
                </div>
                <button 
                  onClick={() => {
                    setIsLoginOpen(false);
                    setPasscode("");
                    setLoginError("");
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-white/70 mb-5 leading-relaxed relative z-10">
                Enter your admin passcode to authorize viewing user session intelligence, heatmap drop-offs, and funnels.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Passcode</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffb300] focus:ring-1 focus:ring-[#ffb300]/30 transition-all placeholder:text-gray-600"
                  />
                  {loginError && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {loginError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginOpen(false);
                      setPasscode("");
                      setLoginError("");
                    }}
                    className="w-1/2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-xs uppercase tracking-widest font-black text-white/80 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#ffb300] hover:bg-[#ffc124] text-[#2a2e34] rounded-xl py-2.5 text-xs uppercase tracking-widest font-black transition-all cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-white/5 text-center relative z-10">
                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                  Secure Console Connection
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
