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
  private currentSession: UserSession | null = null;
  private timer: any = null;
  private isTracking = false;

  constructor() {
    this.initTracker();
  }

  public initTracker() {
    if (typeof window === 'undefined' || this.isTracking) return;
    this.isTracking = true;

    // Retrieve or create sessionId
    let sessionId = sessionStorage.getItem("movebuddy_session_id");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem("movebuddy_session_id", sessionId);
    }

    // Initialize the current session structure
    const startTime = Date.now();
    this.currentSession = {
      id: sessionId,
      startTime,
      endTime: startTime,
      activeDuration: 0,
      pageViews: 1,
      maxScrollDepth: 0,
      device: getDevice(),
      browser: getBrowser(),
      country: getCountryByTimezone(),
      referrer: document.referrer || "Direct / Bookmark",
      events: [],
      formStarted: false,
      formSubmitted: false,
      bounced: true
    };

    // Load existing sessions from localStorage to merge/append
    this.loadHistory();

    // Start active duration interval (tracks real active window usage)
    let lastActiveTime = Date.now();
    this.timer = setInterval(() => {
      if (document.visibilityState === 'visible' && this.currentSession) {
        this.currentSession.activeDuration += 1;
        this.currentSession.endTime = Date.now();
        
        // Bounce determination: if they stay active > 15s or interact, they did not bounce
        if (this.currentSession.activeDuration > 15 || this.currentSession.events.length > 3) {
          this.currentSession.bounced = false;
        }

        this.saveCurrentSessionState();
      }
    }, 1000);

    // Track user clicks
    window.addEventListener("click", (e: MouseEvent) => {
      if (!this.currentSession) return;
      
      const target = e.target as HTMLElement;
      // Get readable label of clicked element
      let label = target.tagName.toLowerCase();
      if (target.id) label += `#${target.id}`;
      if (target.className && typeof target.className === 'string') {
        const classes = target.className.split(' ').filter(c => c && !c.includes(':')).slice(0, 2).join('.');
        if (classes) label += `.${classes}`;
      }
      
      // Add text snippet if short
      const textSnippet = target.innerText?.trim().substring(0, 30);
      if (textSnippet) {
        label += ` ("${textSnippet}")`;
      }

      // X, Y coordinates as percentages of window width/height
      const xPct = Math.round((e.pageX / document.documentElement.scrollWidth) * 100);
      const yPct = Math.round((e.pageY / document.documentElement.scrollHeight) * 100);

      // Scroll percentage at time of click
      const scrollY = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0;

      this.logEvent({
        timestamp: Date.now(),
        type: 'click',
        target: label,
        x: xPct,
        y: yPct,
        scrollY
      });

      this.currentSession.bounced = false;
    });

    // Track scroll depth (throttled)
    const handleScroll = throttle(() => {
      if (!this.currentSession) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.round((window.scrollY / scrollHeight) * 100);
      
      if (pct > this.currentSession.maxScrollDepth) {
        this.currentSession.maxScrollDepth = pct;
        
        // Log milestone scroll depths
        const currentMilestone = Math.floor(pct / 25) * 25;
        const loggedMilestones = this.currentSession.events
          .filter(e => e.type === 'scroll')
          .map(e => e.value as number);

        if (currentMilestone > 0 && !loggedMilestones.includes(currentMilestone)) {
          this.logEvent({
            timestamp: Date.now(),
            type: 'scroll',
            value: currentMilestone
          });
        }
      }
    }, 500);
    window.addEventListener("scroll", handleScroll);

    // Track mouse movements periodically for session recordings (throttled)
    const handleMouseMove = throttle((e: MouseEvent) => {
      if (!this.currentSession) return;
      const xPct = Math.round((e.pageX / document.documentElement.scrollWidth) * 100);
      const yPct = Math.round((e.pageY / document.documentElement.scrollHeight) * 100);
      const scrollY = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100) || 0;

      this.logEvent({
        timestamp: Date.now(),
        type: 'mouse_move',
        x: xPct,
        y: yPct,
        scrollY
      });
    }, 1500); // Record mouse positions every 1.5 seconds for super lightweight replay
    window.addEventListener("mousemove", handleMouseMove);

    // Save before page exit
    window.addEventListener("beforeunload", () => {
      this.finalizeCurrentSession();
    });
  }

  public logEvent(event: Omit<TrackedEvent, 'timestamp'> & { timestamp?: number }) {
    if (!this.currentSession) return;
    const fullEvent: TrackedEvent = {
      timestamp: Date.now(),
      ...event
    };
    
    // Cap event storage in current session to avoid memory overflow (e.g. max 300 events)
    if (this.currentSession.events.length < 300) {
      this.currentSession.events.push(fullEvent);
    }
    
    // Check if form actions are occurring
    if (event.type === 'form_focus') {
      this.currentSession.formStarted = true;
      this.currentSession.bounced = false;
    }
    if (event.type === 'form_submit') {
      this.currentSession.formSubmitted = true;
      this.currentSession.bounced = false;
    }

    this.saveCurrentSessionState();
  }

  private saveCurrentSessionState() {
    if (!this.currentSession) return;
    try {
      localStorage.setItem("movebuddy_analytics_current_session", JSON.stringify(this.currentSession));
    } catch (e) {
      console.warn("Storage cap reached:", e);
    }
  }

  private finalizeCurrentSession() {
    if (!this.currentSession) return;
    try {
      this.currentSession.endTime = Date.now();
      const rawHist = localStorage.getItem("movebuddy_analytics_sessions");
      const history: UserSession[] = rawHist ? JSON.parse(rawHist) : [];
      
      // Avoid duplicated session additions
      const filteredHistory = history.filter(s => s.id !== this.currentSession!.id);
      filteredHistory.push(this.currentSession);
      
      // Limit saved sessions history in storage to max 100 items to keep things incredibly lightweight
      if (filteredHistory.length > 100) {
        filteredHistory.shift();
      }
      
      localStorage.setItem("movebuddy_analytics_sessions", JSON.stringify(filteredHistory));
    } catch (e) {
      console.error("Failed to finalize session:", e);
    }
  }

  private loadHistory() {
    try {
      const rawHist = localStorage.getItem("movebuddy_analytics_sessions");
      if (rawHist) {
        const history: UserSession[] = JSON.parse(rawHist);
        // Automatically filter out any previous mock/dummy sessions to keep only genuine live records
        const realSessions = history.filter(s => !s.id.includes("mock"));
        localStorage.setItem("movebuddy_analytics_sessions", JSON.stringify(realSessions));
      } else {
        localStorage.setItem("movebuddy_analytics_sessions", JSON.stringify([]));
      }
    } catch (e) {
      // ignore
    }
  }

  public getSessions(): UserSession[] {
    try {
      this.saveCurrentSessionState();
      const rawHist = localStorage.getItem("movebuddy_analytics_sessions");
      const history: UserSession[] = rawHist ? JSON.parse(rawHist) : [];
      
      // Filter out mock data just in case
      const realHistory = history.filter(s => !s.id.includes("mock"));
      
      // Inject current active session for real-time monitoring
      if (this.currentSession) {
        const foundIndex = realHistory.findIndex(s => s.id === this.currentSession!.id);
        if (foundIndex >= 0) {
          realHistory[foundIndex] = this.currentSession;
        } else {
          realHistory.push(this.currentSession);
        }
      }
      return realHistory.sort((a, b) => b.startTime - a.startTime);
    } catch (e) {
      return this.currentSession ? [this.currentSession] : [];
    }
  }

  public clearAllData() {
    try {
      localStorage.removeItem("movebuddy_analytics_sessions");
      if (this.currentSession) {
        this.currentSession.events = [];
        this.currentSession.activeDuration = 0;
        this.currentSession.startTime = Date.now();
        this.currentSession.bounced = true;
        this.currentSession.formStarted = false;
        this.currentSession.formSubmitted = false;
        this.currentSession.maxScrollDepth = 0;
        this.saveCurrentSessionState();
      }
    } catch (e) {
      console.error(e);
    }
  }

  private seedMockHistory() {
    const devices: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Desktop', 'Mobile', 'Tablet'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
    const countries = ['India', 'United States', 'United Kingdom', 'Germany', 'Singapore', 'Canada', 'Australia'];
    const referrers = [
      'Direct / Bookmark', 
      'https://www.linkedin.com/', 
      'https://www.google.com/', 
      'https://www.instagram.com/', 
      'https://news.ycombinator.com/', 
      'https://t.co/' // Twitter
    ];

    const mockSessions: UserSession[] = [];
    const now = Date.now();

    // Generate 45 realistic user sessions spread over the last 10 days
    for (let i = 45; i >= 1; i--) {
      const id = "sess_mock_" + Math.random().toString(36).substring(2, 11);
      const timeOffset = i * 5 * 60 * 60 * 1000 + Math.random() * 3 * 60 * 60 * 1000; // spread over 10 days
      const startTime = now - timeOffset;
      const device = devices[Math.floor(Math.random() * devices.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const referrer = referrers[Math.floor(Math.random() * referrers.length)];

      const bounced = Math.random() < 0.35; // 35% bounce rate
      const activeDuration = bounced 
        ? Math.floor(2 + Math.random() * 10) 
        : Math.floor(40 + Math.random() * 280);

      const maxScrollDepth = bounced 
        ? Math.floor(5 + Math.random() * 15) 
        : Math.floor(45 + Math.random() * 55); // waitlist form is at 100%

      const formStarted = !bounced && Math.random() < 0.55;
      const formSubmitted = formStarted && Math.random() < 0.60;

      const events: TrackedEvent[] = [];

      // Reconstruct timeline events for session replay & logs!
      events.push({ timestamp: startTime, type: 'scroll', value: 0 });

      if (bounced) {
        // Simple click & quick bounce
        if (Math.random() < 0.3) {
          events.push({
            timestamp: startTime + 1500,
            type: 'click',
            target: 'body',
            x: Math.floor(30 + Math.random() * 40),
            y: Math.floor(20 + Math.random() * 20),
            scrollY: 0
          });
        }
      } else {
        // Deep scroll user
        let eventTime = startTime;
        
        // Simulating scrolling events
        const scrolls = [25, 50, 75];
        scrolls.forEach((sc, idx) => {
          if (maxScrollDepth >= sc) {
            eventTime += Math.floor(3000 + Math.random() * 6000);
            events.push({
              timestamp: eventTime,
              type: 'scroll',
              value: sc
            });

            // Simulate mouse moves
            events.push({
              timestamp: eventTime - 1000,
              type: 'mouse_move',
              x: Math.floor(20 + Math.random() * 60),
              y: Math.floor(sc - 10 + Math.random() * 15),
              scrollY: sc
            });

            // Random interaction click (e.g. audio button or navigation item)
            if (Math.random() < 0.4) {
              const clickTarget = Math.random() < 0.5 
                ? 'button.flex.items-center ("Mute Sound")' 
                : 'div.flex.items-center ("MOVEBUDDY.IO")';
              events.push({
                timestamp: eventTime + 1200,
                type: 'click',
                target: clickTarget,
                x: Math.floor(10 + Math.random() * 80),
                y: Math.floor(sc - 5 + Math.random() * 10),
                scrollY: sc
              });
            }
          }
        });

        // Form fields tracking if started
        if (formStarted) {
          eventTime += Math.floor(4000 + Math.random() * 8000);
          events.push({
            timestamp: eventTime,
            type: 'form_focus',
            target: 'input#email ("Enter your company email...")',
            scrollY: 100
          });

          eventTime += Math.floor(2000 + Math.random() * 4000);
          events.push({
            timestamp: eventTime,
            type: 'form_input',
            target: 'input#email',
            value: 'email_typed',
            scrollY: 100
          });

          if (formSubmitted) {
            eventTime += Math.floor(3000 + Math.random() * 5000);
            events.push({
              timestamp: eventTime,
              type: 'form_submit',
              target: 'button ("Join Waitlist")',
              scrollY: 100
            });
          } else {
            // Dropoff
            events.push({
              timestamp: eventTime + 5000,
              type: 'exit',
              target: 'input#email_dropoff',
              scrollY: 100
            });
          }
        }
      }

      mockSessions.push({
        id,
        startTime,
        endTime: startTime + (activeDuration * 1000),
        activeDuration,
        pageViews: Math.random() < 0.15 ? 2 : 1,
        maxScrollDepth: maxScrollDepth > 100 ? 100 : maxScrollDepth,
        device,
        browser,
        country,
        referrer,
        events,
        formStarted,
        formSubmitted,
        bounced
      });
    }

    try {
      localStorage.setItem("movebuddy_analytics_sessions", JSON.stringify(mockSessions));
    } catch (e) {
      console.error(e);
    }
  }
}

export const tracker = new AnalyticsTracker();
