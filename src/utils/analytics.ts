export interface TrackedEvent {
  timestamp: number;
  type: 'click' | 'scroll' | 'form_focus' | 'form_input' | 'form_submit' | 'audio_toggle' | 'chapter_jump' | 'social_click' | 'exit' | 'mouse_move';
  target?: string;
  x?: number; // % of element or page
  y?: number; // % of element or page
  scrollY?: number; // 0 to 100
  value?: string | number;
}

export interface UserSession {
  id: string;
  visitorId: string;
  startTime: number;
  endTime: number;
  activeDuration: number; // in seconds
  pageViews: number;
  maxScrollDepth: number; // 0 to 100
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  country: string;
  referrer: string;
  events: TrackedEvent[];
  formStarted: boolean;
  formSubmitted: boolean;
  bounced: boolean;
}

// Simple browser & OS detection
function getBrowser(): string {
  if (typeof navigator === 'undefined') return "Chrome";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Chrome";
}

function getDevice(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return "Desktop";
  const width = window.innerWidth;
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
}

function getCountryByTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Asia/Calcutta") || tz.includes("Asia/Kolkata") || tz.includes("IST")) return "India";
    if (tz.includes("America")) return "United States";
    if (tz.includes("Europe/London")) return "United Kingdom";
    if (tz.includes("Europe/Paris") || tz.includes("Europe/Berlin")) return "Germany";
    if (tz.includes("Asia/Singapore")) return "Singapore";
    if (tz.includes("Australia")) return "Australia";
    return "India"; // Default target
  } catch (e) {
    return "India";
  }
}

// Throttle utility
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle = false;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as any;
}

class AnalyticsTracker {
  private currentSessionId: string = "";
  private visitorId: string = "";
  private isTracking = false;
  private pendingEvents: TrackedEvent[] = [];
  private unsyncedDuration = 0;
  private unsyncedPageViews = 0;
  private maxScrollDepthSent = 0;
  private formStartedSent = false;
  private formSubmittedSent = false;
  private timer: any = null;

  constructor() {
    this.initTracker();
  }

  public initTracker() {
    if (typeof window === 'undefined' || this.isTracking) return;
    this.isTracking = true;

    // Load or generate stable VisitorId for accurate unique visitor tracking across sessions
    let visitorId = localStorage.getItem("movebuddy_visitor_id");
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("movebuddy_visitor_id", visitorId);
    }
    this.visitorId = visitorId;

    // Retrieve or create sessionId
    let sessionId = sessionStorage.getItem("movebuddy_session_id");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem("movebuddy_session_id", sessionId);
      this.unsyncedPageViews = 1;
    }
    this.currentSessionId = sessionId;

    // Register session with first sync
    this.syncWithBackend();

    // Batch clock and sync ticks
    let ticks = 0;
    this.timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.unsyncedDuration += 1;
      }
      ticks++;
      if (ticks >= 3) {
        ticks = 0;
        this.syncWithBackend();
      }
    }, 1000);

    // Track user clicks
    window.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let label = target.tagName.toLowerCase();
      if (target.id) label += `#${target.id}`;
      if (target.className && typeof target.className === 'string') {
        const classes = target.className.split(' ').filter(c => c && !c.includes(':')).slice(0, 2).join('.');
        if (classes) label += `.${classes}`;
      }
      
      const textSnippet = target.innerText?.trim().substring(0, 30);
      if (textSnippet) {
        label += ` ("${textSnippet}")`;
      }

      const xPct = Math.round((e.pageX / document.documentElement.scrollWidth) * 100);
      const yPct = Math.round((e.pageY / document.documentElement.scrollHeight) * 100);
      const scrollY = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0;

      this.logEvent({
        type: 'click',
        target: label,
        x: xPct,
        y: yPct,
        scrollY
      });
    });

    // Track scroll depth (throttled)
    const handleScroll = throttle(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.round((window.scrollY / scrollHeight) * 100);
      
      if (pct > this.maxScrollDepthSent) {
        this.maxScrollDepthSent = pct;
        const currentMilestone = Math.floor(pct / 25) * 25;
        if (currentMilestone > 0) {
          this.logEvent({
            type: 'scroll',
            value: currentMilestone
          });
        }
      }
    }, 500);
    window.addEventListener("scroll", handleScroll);

    // Track mouse movements (throttled for lightweight replay support)
    const handleMouseMove = throttle((e: MouseEvent) => {
      const xPct = Math.round((e.pageX / document.documentElement.scrollWidth) * 100);
      const yPct = Math.round((e.pageY / document.documentElement.scrollHeight) * 100);
      const scrollY = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0;

      this.logEvent({
        type: 'mouse_move',
        x: xPct,
        y: yPct,
        scrollY
      });
    }, 2000);
    window.addEventListener("mousemove", handleMouseMove);

    // Flush analytics safely on tab/session close or focus shift
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === 'hidden') {
        this.flushBeacon();
      }
    });
    window.addEventListener("beforeunload", () => {
      this.flushBeacon();
    });
  }

  public logEvent(event: Omit<TrackedEvent, 'timestamp'>) {
    const fullEvent: TrackedEvent = {
      timestamp: Date.now(),
      ...event
    };
    
    // Priority Queuing: Prevent non-critical mouse_move events from choking the queue and dropping critical clicks or form actions
    if (event.type === 'mouse_move') {
      const mouseMoveCount = this.pendingEvents.filter(e => e.type === 'mouse_move').length;
      if (mouseMoveCount < 50) {
        this.pendingEvents.push(fullEvent);
      }
    } else {
      // Critical user actions (clicks, scroll milestones, forms) always get queued safely
      if (this.pendingEvents.length < 1000) {
        this.pendingEvents.push(fullEvent);
      }
    }
    
    if (event.type === 'form_focus') {
      this.formStartedSent = true;
    }
    if (event.type === 'form_submit') {
      this.formSubmittedSent = true;
      // Flush immediately on form submit!
      this.syncWithBackend();
    }
  }

  private isSyncing = false;
  private async syncWithBackend() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const eventsToSync = [...this.pendingEvents];
    const durationIncrement = this.unsyncedDuration;
    const pageViewsIncrement = this.unsyncedPageViews;

    const payload = {
      id: this.currentSessionId,
      visitorId: this.visitorId,
      device: getDevice(),
      browser: getBrowser(),
      country: getCountryByTimezone(),
      referrer: document.referrer || "Direct / Bookmark",
      events: eventsToSync,
      activeDurationIncrement: durationIncrement,
      pageViewsIncrement: pageViewsIncrement,
      maxScrollDepth: this.maxScrollDepthSent,
      formStarted: this.formStartedSent,
      formSubmitted: this.formSubmittedSent
    };

    try {
      const res = await fetch("/api/analytics/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Clear synced items from queue
        this.pendingEvents = this.pendingEvents.slice(eventsToSync.length);
        this.unsyncedDuration -= durationIncrement;
        this.unsyncedPageViews -= pageViewsIncrement;
      }
    } catch (err) {
      console.warn("Telemetry backend sync failed. Will retry next tick.", err);
    } finally {
      this.isSyncing = false;
    }
  }

  private flushBeacon() {
    const payload = {
      id: this.currentSessionId,
      visitorId: this.visitorId,
      device: getDevice(),
      browser: getBrowser(),
      country: getCountryByTimezone(),
      referrer: document.referrer || "Direct / Bookmark",
      events: this.pendingEvents,
      activeDurationIncrement: this.unsyncedDuration,
      pageViewsIncrement: this.unsyncedPageViews,
      maxScrollDepth: this.maxScrollDepthSent,
      formStarted: this.formStartedSent,
      formSubmitted: this.formSubmittedSent
    };

    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
    } catch (err) {
      // fallback to sync if beacon fails
    }

    this.pendingEvents = [];
    this.unsyncedDuration = 0;
    this.unsyncedPageViews = 0;
  }

  public async getSessions(passcode?: string): Promise<UserSession[]> {
    try {
      const actualCode = passcode || localStorage.getItem("movebuddy_is_admin_passcode") || "admin123";
      const res = await fetch("/api/analytics/sessions", {
        headers: {
          "x-admin-passcode": actualCode
        }
      });
      if (res.ok) {
        const data = await res.json();
        return data.sort((a: any, b: any) => b.startTime - a.startTime);
      }
    } catch (err) {
      console.error("Telemetry failed to query sessions:", err);
    }
    return [];
  }

  public async getSessionDetails(id: string, passcode?: string): Promise<UserSession | null> {
    try {
      const actualCode = passcode || localStorage.getItem("movebuddy_is_admin_passcode") || "admin123";
      const res = await fetch(`/api/analytics/sessions/${id}`, {
        headers: {
          "x-admin-passcode": actualCode
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Telemetry failed to query session detail:", err);
    }
    return null;
  }

  public async getHeatmapClicks(passcode?: string): Promise<{ x: number, y: number, target?: string }[]> {
    try {
      const actualCode = passcode || localStorage.getItem("movebuddy_is_admin_passcode") || "admin123";
      const res = await fetch("/api/analytics/heatmap", {
        headers: {
          "x-admin-passcode": actualCode
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Telemetry failed to query heatmap clicks:", err);
    }
    return [];
  }

  public async getWaitlistSignups(passcode?: string): Promise<any[]> {
    try {
      const actualCode = passcode || localStorage.getItem("movebuddy_is_admin_passcode") || "admin123";
      const res = await fetch("/api/waitlist/signups", {
        headers: {
          "x-admin-passcode": actualCode
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Failed to query waitlist signups:", err);
    }
    return [];
  }

  public async clearAllData(passcode?: string) {
    try {
      const actualCode = passcode || localStorage.getItem("movebuddy_is_admin_passcode") || "admin123";
      await fetch("/api/analytics/clear", { 
        method: "POST",
        headers: {
          "x-admin-passcode": actualCode
        }
      });
    } catch (err) {
      console.error("Failed to clear telemetry database:", err);
    }
  }

  public getSessionId(): string {
    return this.currentSessionId;
  }
}

export const tracker = new AnalyticsTracker();
