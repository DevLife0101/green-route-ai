"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        if (isLogin) {
          onLogin(data.user);
        } else {
          setIsLogin(true);
          setError('Registration successful! Please login.');
        }
      } else {
        setError(data.message || data.error);
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* Immersive Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] md:w-[40%] md:h-[50%] bg-emerald-600/20 rounded-full blur-[90px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[250px] h-[250px] md:w-[40%] md:h-[50%] bg-teal-600/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

      {/* Auth Card Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-[2rem] bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      >
        
        <div className="text-center mb-8">
          <span className="inline-block p-3 bg-white/5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.1)] text-3xl mb-4">
            🌱
          </span>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
            Green Route AI
          </h2>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mb-8">
          <button 
            onClick={() => window.location.reload()} 
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
          >
            ← Back to Home
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <motion.div layout>
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              required 
              value={formData.username} 
              onChange={handleChange} 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
          </motion.div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            />
          </motion.div>

          {/* Animated Error/Success Message */}
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-sm m-0 p-3 rounded-xl text-center border ${
                  error.includes('successful') 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button 
            layout
            type="submit" 
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className={`group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all mt-2 ${
              loading 
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] cursor-pointer'
            }`}
          >
            {!loading && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            <span className="relative z-10">
              {loading ? 'Connecting...' : (isLogin ? 'Login' : 'Create Account')}
            </span>
          </motion.button>
        </form>

        <motion.p layout className="text-center mt-6 text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-emerald-400 cursor-pointer font-bold hover:text-emerald-300 transition-colors"
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </motion.p>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}