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
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mb-16 md:mb-24 mt-8 md:mt-10"
        >
          <motion.div variants={heroItemVariants} className="mb-6">
            <span className="inline-flex items-center justify-center p-3 md:p-4 bg-white/5 rounded-full border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] text-4xl md:text-5xl backdrop-blur-md relative">
              🌱
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full"
              />
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
            className="text-base md:text-lg lg:text-xl text-slate-300 leading-relaxed font-light px-2"
          >
            The intelligent routing engine that optimizes your drive for the planet. Avoid heavy traffic, get real-time generative AI driving advice, and compete globally to reduce your carbon footprint.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
          
          {/* Card 1: Gemini AI Copilot */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(99, 102, 241, 0.5)", boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-indigo-950/20 backdrop-blur-xl border border-indigo-500/20 shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 md:gap-4 mb-4 relative z-10">
              <span className="text-2xl md:text-3xl bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">✨</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">Gemini AI Copilot</h2>
            </div>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light relative z-10">
              Your personal eco-driving assistant. Powered by <strong className="text-indigo-300">Google Gemini Flash</strong>, the AI analyzes your specific vehicle, distance, and topographic route to generate real-time, custom driving tips that maximize your fuel efficiency.
            </p>
          </motion.div>

          {/* Card 2: Smart Eco-Routing */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(56, 189, 248, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20">🗺️</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">Smart Eco-Routing</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Our dual-engine system uses <strong className="text-sky-400">Live Traffic Optimization</strong> for everyday city commutes, while automatically falling back to standard long-distance routing for massive cross-country road trips. You get the perfect route, every time.
            </p>
          </motion.div>

          {/* Card 3: Eco Points */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(52, 211, 153, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">🏆</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">Earn Eco Points</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Every time you choose the Green Route, we calculate the exact grams of CO₂ you prevented from entering the atmosphere. You earn <strong className="text-emerald-400">Eco Points</strong> for those savings, allowing you to climb the global leaderboard.
            </p>
          </motion.div>

          {/* Card 4: History & Tracking */}
          <motion.div 
            variants={scrollCardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ y: -8, borderColor: "rgba(167, 139, 250, 0.4)" }}
            className="p-6 md:p-8 rounded-[2rem] bg-slate-900/50 backdrop-blur-xl border border-white/5 shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <span className="text-2xl md:text-3xl bg-violet-500/10 p-3 rounded-2xl border border-violet-500/20">📊</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">Track Your Impact</h2>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">
              Your dashboard securely saves every sustainable journey using our Prisma database. Look back at your past drives, manage your saved routes with full delete capabilities, and track your lifetime carbon footprint reduction.
            </p>
          </motion.div>

        </div>

        {/* --- MOVED CALL TO ACTION (GET STARTED BUTTON) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 w-full flex justify-center"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="group relative w-full sm:w-auto px-10 md:px-14 py-4 md:py-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg md:text-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] md:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all hover:shadow-[0_0_50px_rgba(16,185,129,0.6)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              Get Started Now <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
            </span>
          </motion.button>
        </motion.div>

        {/* Minimalist Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-20 text-slate-500 text-xs md:text-sm font-medium tracking-wide uppercase border-t border-white/5 pt-8 w-full text-center"
        >
          Powered by Next.js, Prisma, PostgreSQL, and Google Gemini AI.
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