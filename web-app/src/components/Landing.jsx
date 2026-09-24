"use client";
import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

export default function Landing({ onGetStarted }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex items-center justify-center">
      
      {/* Loading Skeleton while 3D scene downloads */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}

      {/* 3D Spline Canvas */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-70" : "opacity-0"}`}>
        <Spline 
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* Glassmorphism Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] shadow-2xl text-center max-w-lg mx-4"
      >
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
        >
          Green Route <span className="text-emerald-400">AI</span>
        </motion.h1>
        
        <p className="text-slate-200 text-lg mb-8 leading-relaxed">
          Experience the next generation of eco-navigation. Save fuel, cut emissions, and earn rewards with AI-powered precise routing.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-colors"
        >
          Start Navigating
        </motion.button>
      </motion.div>
    </div>
  );
}