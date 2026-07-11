import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { audio } from "../utils/audio";

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show a gentle tooltip after 3 seconds to invite the user
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    // Auto-hide tooltip after 10 seconds
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleToggle = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
    setShowTooltip(false);
    audio.playTap();
  };

  return (
    <div id="sound-control-container" className="fixed top-6 right-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            id="sound-tooltip"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-[#2a2e34] text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 flex items-center gap-2 pointer-events-none"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#ffb300] animate-pulse" />
            Enable sound for the complete experience
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="sound-toggle-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-lg border ${
          isMuted
            ? "bg-[#e9eaec] text-[#2a2e34] border-[#2a2e34]/10 hover:bg-[#e2e4e7]"
            : "bg-[#2a2e34] text-[#ffb300] border-white/10 hover:bg-[#202327]"
        }`}
        aria-label="Toggle Cinematic Soundtrack"
      >
        {isMuted ? (
          <VolumeX size={18} />
        ) : (
          <div className="flex items-end gap-[2px] h-[14px]">
            <span className="w-[3px] bg-[#ffb300] rounded-full animate-bounce [animation-duration:0.6s]" />
            <span className="w-[3px] bg-[#ffb300] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.1s]" />
            <span className="w-[3px] bg-[#ffb300] rounded-full animate-bounce [animation-duration:0.5s] [animation-delay:0.2s]" />
            <span className="w-[3px] bg-[#ffb300] rounded-full animate-bounce [animation-duration:0.7s] [animation-delay:0.3s]" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
