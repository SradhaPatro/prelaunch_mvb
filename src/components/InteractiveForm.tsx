import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowRight, Instagram, CheckCircle2, Phone } from "lucide-react";
import { audio } from "../utils/audio";

export default function InteractiveForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playTap();

    if (!name.trim()) {
      setError("Please introduce yourself by sharing your name.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate database write
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      audio.playPaymentDing(); // Play the chime to celebrate joining!

      // Store in localStorage
      try {
        const list = JSON.parse(localStorage.getItem("movebuddy_waitlist") || "[]");
        list.push({ name, email, joinedAt: new Date().toISOString() });
        localStorage.setItem("movebuddy_waitlist", JSON.stringify(list));
      } catch (e) {
        // Silently catch in sandboxed envs
      }

      // Open the Google Forms in a new tab after a tiny delay
      setTimeout(() => {
        window.open("https://forms.gle/yNu2wQKQiTUi5fn17", "_blank");
      }, 1000);
    }, 1200);
  };

  return (
    <div id="interactive-waitlist-card" className="w-full max-w-lg bg-[#2a2e34] rounded-2xl p-8 border border-white/10 shadow-2xl relative overflow-hidden text-white">
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
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#ffb300] text-[10px] font-bold text-[#2a2e34] tracking-wider uppercase">
                  EARLY ACCESS PROGRAM
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold tracking-wider text-white uppercase border border-white/10">
                  INDIA CO-COMMUTE
                </span>
              </div>
              <h3 className="text-3xl font-display font-bold tracking-tighter uppercase leading-[0.95] text-white">
                Be part of India's safest and smartest recurring commute
              </h3>
              <p className="text-sm text-gray-300">
                Register directly below to secure your placement, and we will open our official onboarding questionnaire.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffb300] focus:ring-1 focus:ring-[#ffb300]/30 transition-all placeholder:text-gray-500"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Work/Personal Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#ffb300] focus:ring-1 focus:ring-[#ffb300]/30 transition-all placeholder:text-gray-500"
                  />
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              id="waitlist-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ffb300] hover:bg-[#ffb300]/95 text-[#2a2e34] font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-[#ffb300]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-[#2a2e34] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Join the Early Access Program
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
            className="text-center py-10 space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-[#ffb300]/10 rounded-full flex items-center justify-center text-[#ffb300]">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">You are on the list, {name}!</h3>
              <p className="text-sm text-gray-300">
                We've secured your early priority access. Opening the comprehensive MoveBuddy Commute Planner Form to customize your route details.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <p className="text-xs text-gray-400">Didn't open automatically?</p>
              <a
                href="https://forms.gle/yNu2wQKQiTUi5fn17"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#ffb300] hover:underline font-mono"
              >
                Access Google Form directly
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span>Questions?</span>
            <a href="mailto:Subratpradhan.mb@gmail.com" className="text-white hover:text-[#ffb300] transition-colors">
              Subratpradhan.mb@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-gray-500" />
            <a href="tel:+917682092722" className="text-white hover:text-[#ffb300] transition-colors font-mono">
              +91 76820 92722
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span>Follow Us</span>
          <a
            href="https://www.instagram.com/movebuddy.io?igsh=MWJmZmozajUxM3J0OA=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white hover:text-[#ffb300] transition-colors"
          >
            <Instagram className="h-3.5 w-3.5" />
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
