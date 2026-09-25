"use client";
import { motion } from "framer-motion";

export default function Landing({ onGetStarted }) {
  // Premium smooth spring animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 20 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 70, damping: 15 },
    },
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Immersive Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-teal-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mb-24 mt-10"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-5xl backdrop-blur-md">
              🌱
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">Green Route AI</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants} 
            className="text-lg md:text-xl text-slate-300 leading-relaxed mb-12 font-light"
          >
            The world's first 3D-aware routing engine that optimizes your drive for the planet, not just for speed. Reduce your carbon footprint, earn Eco Points, and climb the global leaderboard.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group relative px-10 py-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]"
            >
              {/* Button Hover Shine Effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid - Premium Glassmorphism Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
        >
          
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, borderColor: "rgba(56, 189, 248, 0.4)" }}
            className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20">🧠</span>
              <h2 className="text-2xl font-bold text-white tracking-wide">How the AI Works</h2>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Standard GPS maps only look at flat distances. Our Python AI Engine analyzes <strong className="text-slate-200">3D topographic elevation</strong> and road types. It actively penalizes steep uphill climbs that burn massive fuel and avoids residential stop-and-go idling, finding the mathematically greenest path.
            </p>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, borderColor: "rgba(52, 211, 153, 0.4)" }}
            className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">🌱</span>
              <h2 className="text-2xl font-bold text-white tracking-wide">What are Eco Points?</h2>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Every time you choose the Green Route over the Standard Route, the AI calculates the exact grams of CO₂ you saved. You are awarded <strong className="text-emerald-400">Eco Points</strong> for every kilometer you drive sustainably. It is a direct measurement of your positive impact on the environment.
            </p>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, borderColor: "rgba(251, 191, 36, 0.4)" }}
            className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">🏆</span>
              <h2 className="text-2xl font-bold text-white tracking-wide">The Leaderboard</h2>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Saving the planet is a team effort. The Global Leaderboard ranks all users based on their total Eco Points. Compete against drivers locally and worldwide to prove who is the ultimate EcoWarrior.
            </p>
          </motion.div>

          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, borderColor: "rgba(167, 139, 250, 0.4)" }}
            className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl bg-violet-500/10 p-3 rounded-2xl border border-violet-500/20">📊</span>
              <h2 className="text-2xl font-bold text-white tracking-wide">Your Route History</h2>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              Building sustainable habits takes time. Your dashboard securely saves every Eco Route you complete to your personal history. Look back at your past drives and track your lifetime CO₂ reduction.
            </p>
          </motion.div>

        </motion.div>

        {/* Minimalist Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-slate-500 text-sm font-medium tracking-wide uppercase border-t border-white/5 pt-8 w-full text-center"
        >
          Powered by Next.js, FastAPI, Node, and PostgreSQL.
        </motion.div>

      </div>

      {/* Tailwind Custom Keyframes for Button Shimmer */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}