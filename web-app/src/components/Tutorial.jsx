"use client";
import { motion } from 'framer-motion';

export default function Tutorial({ onClose }) {
  const steps = [
    { emoji: "📍", title: "Select Route", text: "Click anywhere on the map to set your Start Point, then click again to set your Destination." },
    { emoji: "⚖️", title: "Compare Impact", text: "We will calculate the Standard Route (blue) and the Eco Route (green) which saves CO₂." },
    { emoji: "🌱", title: "Earn Points", text: "Choose the Eco Route to save it to your history and earn Eco Points based on the distance." },
    { emoji: "🏆", title: "Climb the Ranks", text: "Check the Green Dashboard to see your history and compete on the Global Leaderboard!" }
  ];

  // Framer Motion variants for the staggered list animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 font-sans">
      
      {/* Animated Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 sm:p-8 selection:bg-emerald-500/30 overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          ✖
        </button>

        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight mb-2 mt-1">
            How to use Green Route 🌍
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Follow these steps to reduce emissions and earn points.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 mb-8"
        >
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={itemVariants} className="flex gap-4 items-start group">
              <div className="flex-shrink-0 text-2xl w-12 h-12 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-inner">
                {step.emoji}
              </div>
              <div className="pt-1">
                <h4 className="m-0 text-white font-bold text-base mb-1 tracking-wide">{step.title}</h4>
                <p className="m-0 text-slate-400 text-sm leading-relaxed font-light">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose} 
          className="group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer mt-2"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <span className="relative z-10 text-lg">Let's Go!</span>
        </motion.button>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}