"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Feedback({ currentUser, onClose }) {
  const [name, setName] = useState(currentUser?.username || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          name,
          email,
          phone,
          rating,
          text
        })
      });

      if (res.ok) setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 font-sans">
      
      {/* Animated Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 sm:p-8 max-h-[95vh] overflow-y-auto selection:bg-sky-500/30"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          ✖
        </button>

        <AnimatePresence mode="wait">
          {submitted ? (
            // Success View
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-10"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="text-6xl mb-6 inline-block drop-shadow-[0_0_20px_rgba(46,204,113,0.4)]"
              >
                🌱
              </motion.div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-4">
                Thank You!
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                We have received your message and will get back to you if needed.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose} 
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-colors"
              >
                Close
              </motion.button>
            </motion.div>
          ) : (
            // Form View
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="flex flex-col gap-5"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  Contact Us ✉️
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Let us know how we can help or improve.
                </p>
              </div>
              
              {/* Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input 
                    required 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your Name" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone (Optional)</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Your Phone" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rate your experience</label>
                <div className="flex gap-2 sm:gap-4 mt-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <motion.span 
                      key={num} 
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(num)} 
                      className={`text-3xl cursor-pointer transition-opacity duration-200 ${rating >= num ? 'opacity-100 drop-shadow-[0_0_10px_rgba(46,204,113,0.5)]' : 'opacity-25 grayscale'}`}
                    >
                      🌱
                    </motion.span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  required
                  placeholder="What can we do better? Found any bugs? Need help?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-inner min-h-[100px] resize-y"
                />
              </div>

              <motion.button 
                type="submit" 
                disabled={loading} 
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={`group relative w-full py-4 mt-2 rounded-xl font-bold text-white overflow-hidden transition-all ${
                  loading 
                    ? 'bg-slate-700 text-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] cursor-pointer'
                }`}
              >
                {!loading && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                )}
                <span className="relative z-10 text-base sm:text-lg">
                  {loading ? 'Sending...' : 'Send Message'}
                </span>
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}