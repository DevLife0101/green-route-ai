"use client";
import { motion } from "framer-motion";

export default function Landing({ onGetStarted }) {
  // Hero section staggering (loads immediately on page load)
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 20 },
    },
  };

  // Individual Card Scroll Animation (Triggers dynamically as user scrolls on mobile)
  const scrollCardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 60, damping: 15 },
    },
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Mobile-Optimized Immersive Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] md:w-[50%] md:h-[50%] bg-emerald-600/20 rounded-full blur-[90px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[250px] h-[250px] md:w-[40%] md:h-[50%] bg-teal-600/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mb-16 md:mb-24 mt-8 md:mt-10"
        >
          <motion.div variants={heroItemVariants} className="mb-6">
            <span className="inline-flex items-center justify-center p-3 md:p-4 bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-4xl md:text-5xl backdrop-blur-md">
              🌱
            </span>
          </motion.div>
          
          <motion.h1 
            variants={heroItemVariants} 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)] block sm:inline">Green Route AI</span>
          </motion.h1>
          
          <motion.p 
            variants={heroItemVariants} 
            className="text-base md:text-lg lg:text-xl text-slate-300 leading-relaxed mb-10 md:mb-12 font-light px-2"
          >
            The world's first 3D-aware routing engine that optimizes your drive for the planet, not just for speed. Reduce your carbon footprint, earn Eco Points, and climb the global leaderboard.
          </motion.p>
          
          <motion.div variants={heroItemVariants}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base md:text-lg overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] md:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started Now <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid - Individual Scroll Animations for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
          
          {/* Card 1 */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Triggers when 20% of the card is visible on screen
            whileHover={{ y: -8, borderColor: "rgba(56, 189, 248, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20">🧠</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">How the AI Works</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Standard GPS maps only look at flat distances. Our Python AI Engine analyzes <strong className="text-slate-200">3D topographic elevation</strong> and road types. It actively penalizes steep uphill climbs that burn massive fuel and avoids residential stop-and-go idling, finding the mathematically greenest path.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(52, 211, 153, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">🌱</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">What are Eco Points?</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Every time you choose the Green Route over the Standard Route, the AI calculates the exact grams of CO₂ you saved. You are awarded <strong className="text-emerald-400">Eco Points</strong> for every kilometer you drive sustainably. It is a direct measurement of your positive impact on the environment.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(251, 191, 36, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">🏆</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">The Leaderboard</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Saving the planet is a team effort. The Global Leaderboard ranks all users based on their total Eco Points. Compete against drivers locally and worldwide to prove who is the ultimate EcoWarrior.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(167, 139, 250, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-colors duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-violet-500/10 p-3 rounded-2xl border border-violet-500/20">📊</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">Your Route History</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Building sustainable habits takes time. Your dashboard securely saves every Eco Route you complete to your personal history. Look back at your past drives and track your lifetime CO₂ reduction.
            </p>
          </motion.div>

        </div>

        {/* Minimalist Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-20 text-slate-500 text-xs md:text-sm font-medium tracking-wide uppercase border-t border-white/5 pt-8 w-full text-center"
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