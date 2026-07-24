import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Resolve paths
const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "analytics_sessions.json");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist_signups.json");

// Middleware
app.use(express.json({ limit: "50mb" })); // Support large mouse move event payloads

// Ensure database files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(WAITLIST_FILE)) {
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2));
}

// In-Memory Database Store to prevent concurrent file race conditions & speed up reads/writes to <1ms
let memSessions: any[] = [];
let memWaitlist: any[] = [];
let isStoreInitialized = false;

async function initInMemoryStore() {
  if (isStoreInitialized) return;
  try {
    const dataSess = await fs.promises.readFile(SESSIONS_FILE, "utf-8");
    memSessions = JSON.parse(dataSess);
  } catch (err) {
    memSessions = [];
  }
  try {
    const dataWait = await fs.promises.readFile(WAITLIST_FILE, "utf-8");
    memWaitlist = JSON.parse(dataWait);
  } catch (err) {
    memWaitlist = [];
  }
  isStoreInitialized = true;
  console.log(`[Telemetry] Initialized in-memory store. sessions=${memSessions.length}, waitlist=${memWaitlist.length}`);
}

// Persist in-memory database to disk safely and non-blockingly with an optimized write buffer
let saveSessionsTimeout: NodeJS.Timeout | null = null;
function queueSessionsPersist() {
  if (saveSessionsTimeout) return;
  saveSessionsTimeout = setTimeout(async () => {
    saveSessionsTimeout = null;
    try {
      // Keep last 1000 sessions to prevent storage limit issues in sandbox
      let safeSessions = memSessions;
      if (memSessions.length > 1000) {
        safeSessions = [...memSessions].sort((a, b) => b.startTime - a.startTime).slice(0, 1000);
      }
      await fs.promises.writeFile(SESSIONS_FILE, JSON.stringify(safeSessions, null, 2), "utf-8");
    } catch (err) {
      console.error("[Telemetry] Failed to persist sessions to disk:", err);
    }
  }, 3000); // Debounce disk I/O to every 3 seconds under heavy loads
}

async function forceSaveWaitlist() {
  try {
    await fs.promises.writeFile(WAITLIST_FILE, JSON.stringify(memWaitlist, null, 2), "utf-8");
  } catch (err) {
    console.error("[Telemetry] Failed to persist waitlist:", err);
  }
}

// Admin passcode security middleware to protect private subscriber telemetry & waitlist contact details
function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passcode = req.headers["x-admin-passcode"] || req.query.passcode;
  const validCodes = ["admin123", "movebuddy", "movebuddy2026"];
  if (validCodes.includes(passcode as string)) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Valid admin passcode required." });
  }
}

// API Routes

// GET /api/analytics/sessions - Returns metadata only (no events list) for 99% bandwidth savings
app.get("/api/analytics/sessions", verifyAdmin, async (req, res) => {
  try {
    await initInMemoryStore();
    const metadataSessions = memSessions.map(({ events, ...meta }) => ({
      ...meta,
      eventCount: (events || []).length
    }));
    res.json(metadataSessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

// GET /api/analytics/sessions/:id - Lazy-loads granular events for a single replay
app.get("/api/analytics/sessions/:id", verifyAdmin, async (req, res) => {
  try {
    await initInMemoryStore();
    const session = memSessions.find((s: any) => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to load session details" });
  }
});

// GET /api/analytics/heatmap - Returns lightweight coordinate map for all clicks
app.get("/api/analytics/heatmap", verifyAdmin, async (req, res) => {
  try {
    await initInMemoryStore();
    const clicks: any[] = [];
    memSessions.forEach((s: any) => {
      if (s.events && Array.isArray(s.events)) {
        s.events.forEach((e: any) => {
          if (e.type === "click" && e.x !== undefined && e.y !== undefined) {
            clicks.push({
              x: e.x,
              y: e.y,
              target: e.target
            });
          }
        });
      }
    });
    res.json(clicks);
  } catch (err) {
    res.status(500).json({ error: "Failed to load heatmap data" });
  }
});

// POST /api/analytics/event - batch update or single update of a session and events
app.post("/api/analytics/event", async (req, res) => {
  try {
    const { 
      id, 
      visitorId, 
      device, 
      browser, 
      country, 
      referrer, 
      events = [], 
      activeDurationIncrement = 0,
      pageViewsIncrement = 0,
      maxScrollDepth = 0,
      formStarted = false,
      formSubmitted = false
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "id (sessionId) is required" });
    }

    await initInMemoryStore();
    let session = memSessions.find((s: any) => s.id === id);

    if (!session) {
      const startTime = Date.now();
      session = {
        id,
        visitorId: visitorId || "vis_" + Math.random().toString(36).substring(2, 11),
        startTime,
        endTime: startTime,
        activeDuration: 0,
        pageViews: pageViewsIncrement || 1,
        maxScrollDepth: maxScrollDepth || 0,
        device: device || "Desktop",
        browser: browser || "Chrome",
        country: country || "India",
        referrer: referrer || "Direct / Bookmark",
        events: [],
        formStarted: formStarted || false,
        formSubmitted: formSubmitted || false,
        bounced: true
      };
      memSessions.push(session);
    }

    // Accumulate active duration and page views increments
    if (activeDurationIncrement > 0) {
      session.activeDuration += activeDurationIncrement;
    }
    if (pageViewsIncrement > 0) {
      session.pageViews += pageViewsIncrement;
    }
    if (maxScrollDepth > session.maxScrollDepth) {
      session.maxScrollDepth = maxScrollDepth;
    }
    if (formStarted) session.formStarted = true;
    if (formSubmitted) session.formSubmitted = true;

    // Append and deduplicate new events
    if (events && events.length > 0) {
      const existingEvents = session.events || [];
      const incomingEvents = Array.isArray(events) ? events : [events];
      
      incomingEvents.forEach((evt: any) => {
        // Prevent exact duplicates at the same timestamp and event type
        const isDuplicate = existingEvents.some(
          (e: any) => e.timestamp === evt.timestamp && e.type === evt.type && e.target === evt.target
        );
        if (!isDuplicate && existingEvents.length < 500) { // Limit to 500 events per session to prevent memory blowout
          existingEvents.push(evt);
        }
      });
      session.events = existingEvents;
    }

    // Determine bounce rate status: stay > 15s or has interactions or scrolled deeply => not bounced
    if (session.activeDuration > 15 || session.events.length > 3 || session.maxScrollDepth > 30) {
      session.bounced = false;
    }

    // If there are events, update endTime to the latest event timestamp or current time
    if (session.events.length > 0) {
      const latestEvt = session.events.reduce((max: any, current: any) => 
        (current.timestamp > max.timestamp ? current : max), session.events[0]
      );
      session.endTime = Math.max(session.endTime, latestEvt.timestamp);
    } else {
      session.endTime = Date.now();
    }

    queueSessionsPersist();
    res.json({ success: true, sessionId: id, visitorId: session.visitorId });
  } catch (err) {
    console.error("Error processing analytics event:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/waitlist/join
app.post("/api/waitlist/join", async (req, res) => {
  try {
    const { name, email, phone, sessionId, source } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: "Email and Phone are required" });
    }

    await initInMemoryStore();
    
    // Check if duplicate waitlist submission exists globally
    const exists = memWaitlist.some((item: any) => item.email === email || item.phone === phone);
    if (!exists) {
      memWaitlist.push({
        name: name || "Anonymous Commuter",
        email,
        phone,
        joinedAt: new Date().toISOString(),
        source: source || "InteractiveForm"
      });
      await forceSaveWaitlist();
    }

    // If sessionId is passed, also update the server session's formSubmitted state!
    if (sessionId) {
      const session = memSessions.find((s: any) => s.id === sessionId);
      if (session) {
        session.formSubmitted = true;
        session.bounced = false;
        
        // Log form submit event if not already present
        const hasSubmitEvt = (session.events || []).some((e: any) => e.type === "form_submit");
        if (!hasSubmitEvt) {
          if (!session.events) session.events = [];
          session.events.push({
            timestamp: Date.now(),
            type: "form_submit",
            target: "InteractiveForm",
            value: `${email} | ${phone}`
          });
        }
        queueSessionsPersist();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in waitlist registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/waitlist/signups - Requires admin authorization
app.get("/api/waitlist/signups", verifyAdmin, async (req, res) => {
  try {
    await initInMemoryStore();
    res.json(memWaitlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to load waitlist" });
  }
});

// POST /api/analytics/clear - Requires admin authorization
app.post("/api/analytics/clear", verifyAdmin, async (req, res) => {
  try {
    memSessions = [];
    if (saveSessionsTimeout) {
      clearTimeout(saveSessionsTimeout);
      saveSessionsTimeout = null;
    }
    await fs.promises.writeFile(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
    res.json({ success: true, message: "All live telemetry wiped successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear data" });
  }
});

// Integration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express v5 uses *all instead of * for wildcard routing
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
