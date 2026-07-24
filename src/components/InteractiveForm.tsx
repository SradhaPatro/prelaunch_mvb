import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, Instagram, CheckCircle2, Phone, Sparkles, Shield, User } from "lucide-react";
import { audio } from "../utils/audio";
import { tracker } from "../utils/analytics";

export default function InteractiveForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hyderabad");
  
  // Field touched states for immediate blur validation
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", phone: "" });

  // Email format regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const disposableDomains = ["tempmail", "temp-mail", "yopmail", "mailinator", "dispostable", "10minutemail", "getnada", "guerrillamail"];

  // Sanitize and validate inputs on the fly
  const handlePhoneChange = (val: string) => {
    // Strictly accept ONLY numeric digits, max 10 digits
    const digitsOnly = val.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(digitsOnly);
    tracker.logEvent({ type: 'form_input', target: 'input#phone', value: digitsOnly });

    if (touched.phone) {
      validatePhone(digitsOnly);
    }
  };

  const validateName = (val: string) => {
    const clean = val.trim();
    if (!clean) {
      setFieldErrors(prev => ({ ...prev, name: "Name is required *" }));
      return false;
    }
    if (clean.length < 2 || clean.length > 50) {
      setFieldErrors(prev => ({ ...prev, name: "Name must be 2 to 50 characters" }));
      return false;
    }
    setFieldErrors(prev => ({ ...prev, name: "" }));
    return true;
  };

  const validateEmail = (val: string) => {
    const clean = val.trim();
    if (!clean) {
      setFieldErrors(prev => ({ ...prev, email: "Email is required *" }));
      return false;
    }
    if (!emailRegex.test(clean)) {
      setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }
    const domain = clean.split("@")[1]?.toLowerCase() || "";
    if (disposableDomains.some(d => domain.includes(d))) {
      setFieldErrors(prev => ({ ...prev, email: "Disposable email addresses are not accepted" }));
      return false;
    }
    setFieldErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  const validatePhone = (val: string) => {
    const cleanDigits = val.replace(/[^0-9]/g, "");
    if (!cleanDigits) {
      setFieldErrors(prev => ({ ...prev, phone: "Mobile number is required *" }));
      return false;
    }
    if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
      setFieldErrors(prev => ({ ...prev, phone: "Enter a valid 10-digit mobile number (starts with 6-9)" }));
      return false;
    }
    if (/(.)\1{9}/.test(cleanDigits)) {
      setFieldErrors(prev => ({ ...prev, phone: "Repetitive fake numbers are invalid" }));
      return false;
    }
    setFieldErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  // Check if form is completely valid to enable submit button
  const isFormValid = () => {
    const isNameOk = name.trim().length >= 2 && name.trim().length <= 50;
    const isEmailOk = emailRegex.test(email.trim()) && !disposableDomains.some(d => (email.trim().split("@")[1]?.toLowerCase() || "").includes(d));
    const isPhoneOk = phone.length === 10 && /^[6-9]\d{9}$/.test(phone) && !/(.)\1{9}/.test(phone);
    return isNameOk && isEmailOk && isPhoneOk;
  };

  const handleSocialSignIn = (provider: string) => {
    audio.playTap();
    tracker.logEvent({ type: 'click', target: `Social Login: ${provider}` });
    alert(`Connecting with ${provider}... Initializing OAuth redirect for verified corporate account.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Trigger full validations
    const isNValid = validateName(name);
    const isEValid = validateEmail(email);
    const isPValid = validatePhone(phone);

    if (!isNValid || !isEValid || !isPValid) {
      setError("Please fix the highlighted errors above before proceeding.");
      return;
    }

    audio.playTap();

    // SQL Injection & XSS security checks
    const sqlPattern = /('|--|#|\/\*|\*\/|union|select|insert|delete|drop|update|where|or\s+1\s*=\s*1)/i;
    const xssPattern = /<script|javascript:|on\w+\s*=/i;

    if (sqlPattern.test(name) || sqlPattern.test(email) || sqlPattern.test(phone)) {
      setError("Security Alert: Suspicious SQL syntax detected.");
      return;
    }
    if (xssPattern.test(name) || xssPattern.test(email) || xssPattern.test(phone)) {
      setError("Security Alert: Suspicious script tags detected.");
      return;
    }

    const sanitizedName = name.trim().replace(/[<>]/g, "");
    const sanitizedEmail = email.trim();
    const sanitizedPhone = phone.trim();

    setError("");
    setIsLoading(true);

    tracker.logEvent({
      type: 'form_submit',
      target: 'InteractiveForm',
      value: `${sanitizedEmail} | ${sanitizedPhone}`
    });

    fetch("/api/waitlist/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        city,
        sessionId: tracker.getSessionId(),
        source: "InteractiveForm"
      })
    })
    .then(async (res) => {
      setIsLoading(false);
      if (res.ok) {
        setIsSubmitted(true);
        audio.playPaymentDing();

        try {
          const list = JSON.parse(localStorage.getItem("movebuddy_waitlist") || "[]");
          const exists = list.some((item: any) => item.email === sanitizedEmail || item.phone === sanitizedPhone);
          if (!exists) {
            list.push({ 
              name: sanitizedName, 
              email: sanitizedEmail, 
              phone: sanitizedPhone, 
              city,
              joinedAt: new Date().toISOString() 
            });
            localStorage.setItem("movebuddy_waitlist", JSON.stringify(list));
          }
        } catch (err) {}

        setTimeout(() => {
          window.open("https://forms.gle/yNu2wQKQiTUi5fn17", "_blank");
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    })
    .catch(() => {
      setIsLoading(false);
      setError("Network error. Please check your connection and try again.");
    });
  };

  return (
    <div id="interactive-waitlist-card" className="w-full max-w-lg bg-[#2a2e34] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden text-white">
      {/* Absolute decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb300]/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            id="waitlist-form"
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Header USP Pitch */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#ffb300] text-[9px] sm:text-[10px] font-black text-[#2a2e34] tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2a2e34]" />
                  INDIA'S 1ST CO-COMMUTE PLATFORM
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[9px] sm:text-[10px] font-bold tracking-wider text-white uppercase border border-white/10 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  VERIFIED BADGES
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tighter uppercase leading-[0.95] text-white">
                Zero Cancellations. <br />
                <span className="text-[#ffb300]">Save 60% Fuel Costs.</span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Connect directly with verified corporate colleagues traveling on your exact office route. Guaranteed rides, split fares, zero daily stress.
              </p>
            </div>

            {/* Social Media One-Click Authentication */}
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Quick Single Sign-On</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn("Google")}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 px-2 rounded-xl border border-white/10 transition-all cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-.7-1-1.6-1-2.6z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignIn("LinkedIn")}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 px-2 rounded-xl border border-white/10 transition-all cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignIn("Twitter")}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 px-2 rounded-xl border border-white/10 transition-all cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter</span>
                </button>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">or register directly</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Name Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    Your Full Name <span className="text-red-400 font-bold">*</span>
                  </label>
                  {fieldErrors.name && (
                    <span className="text-[10px] text-red-400 font-medium">{fieldErrors.name}</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name) validateName(e.target.value);
                      tracker.logEvent({ type: 'form_input', target: 'input#name', value: 'typing_name' });
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, name: true }));
                      validateName(name);
                    }}
                    onFocus={() => tracker.logEvent({ type: 'form_focus', target: 'input#name' })}
                    disabled={isLoading}
                    className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:outline-none transition-all placeholder:text-gray-500 ${
                      fieldErrors.name ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-white/15 focus:border-[#ffb300] focus:ring-1 focus:ring-[#ffb300]/30"
                    }`}
                  />
                  <User className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    Work or Personal Email <span className="text-red-400 font-bold">*</span>
                  </label>
                  {fieldErrors.email && (
                    <span className="text-[10px] text-red-400 font-medium">{fieldErrors.email}</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateEmail(e.target.value);
                      tracker.logEvent({ type: 'form_input', target: 'input#email', value: 'typing_email' });
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, email: true }));
                      validateEmail(email);
                    }}
                    onFocus={() => tracker.logEvent({ type: 'form_focus', target: 'input#email' })}
                    disabled={isLoading}
                    className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:outline-none transition-all placeholder:text-gray-500 ${
                      fieldErrors.email ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-white/15 focus:border-[#ffb300] focus:ring-1 focus:ring-[#ffb300]/30"
                    }`}
                  />
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Phone Input with strict digit-only filtering */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                    Indian Mobile Number <span className="text-red-400 font-bold">*</span>
                  </label>
                  {fieldErrors.phone && (
                    <span className="text-[10px] text-red-400 font-medium">{fieldErrors.phone}</span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-mono font-bold text-[#ffb300] bg-white/10 px-1.5 py-0.5 rounded">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, phone: true }));
                      validatePhone(phone);
                    }}
                    onFocus={() => tracker.logEvent({ type: 'form_focus', target: 'input#phone' })}
                    disabled={isLoading}
                    className={`w-full bg-white/5 border rounded-xl pl-16 pr-4 py-2.5 text-white text-sm font-mono focus:outline-none transition-all placeholder:text-gray-500 ${
                      fieldErrors.phone ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-white/15 focus:border-[#ffb300] focus:ring-1 focus:ring-[#ffb300]/30"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-400">Strictly 10 digits. Used for route matching notifications.</p>
              </div>

              {/* City Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Primary Commute Hub
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#22252a] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffb300] transition-all"
                >
                  <option value="Hyderabad">Hyderabad (HITEC City / Gachibowli)</option>
                  <option value="Bengaluru">Bengaluru (Whitefield / Electronic City)</option>
                  <option value="Pune">Pune (Hinjawadi / Kharadi)</option>
                  <option value="NCR">Delhi NCR (Gurugram / Noida)</option>
                  <option value="Mumbai">Mumbai (BKC / Lower Parel)</option>
                  <option value="Chennai">Chennai (OMR / Guindy)</option>
                </select>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            <button
              id="waitlist-submit-btn"
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full bg-[#ffb300] hover:bg-[#ffc124] text-[#2a2e34] font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-[#ffb300]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#ffb300]"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-[#2a2e34] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Early Access Program</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            id="waitlist-success-card"
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-5"
          >
            <div className="mx-auto w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Priority spot secured, {name}!</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                We've registered your mobile ({phone}) and email for {city}. Opening the official MoveBuddy Route Preference Survey to customize your exact morning schedule.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <p className="text-xs text-gray-400">Didn't open automatically?</p>
              <a
                href="https://forms.gle/yNu2wQKQiTUi5fn17"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#ffb300] hover:underline font-mono font-bold"
              >
                Access Google Form directly
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span>Direct Support:</span>
            <a href="mailto:Subratpradhan.mb@gmail.com" className="text-white hover:text-[#ffb300] transition-colors font-medium">
              Subratpradhan.mb@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-gray-400" />
            <a href="tel:+917682092722" className="text-white hover:text-[#ffb300] transition-colors font-mono">
              +91 76820 92722
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/movebuddy.io?igsh=MWJmZmozajUxM3J0OA=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white hover:text-[#ffb300] transition-colors"
          >
            <Instagram className="h-3.5 w-3.5 text-[#ffb300]" />
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}

