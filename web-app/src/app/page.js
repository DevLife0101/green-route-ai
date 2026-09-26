"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from '../components/Auth';
import Landing from '../components/Landing';
import Feedback from '../components/Feedback';
import Tutorial from '../components/Tutorial';
import SearchControls from '../components/SearchControls';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [points, setPoints] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);

  const [showFeedback, setShowFeedback] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  if (!currentUser && !showAuth) {
    return <Landing onGetStarted={() => setShowAuth(true)} />;
  }

  if (!currentUser && showAuth) {
    return <Auth onLogin={(user) => {
      setCurrentUser(user);
      setEcoPoints(user.ecoPoints);
    }} />;
  }

  const handleCalculateRoute = async ({ start, end, engineType }) => {
    setIsCalculating(true);
    setPoints([start, end]);
    setRoutes(null);

    try {
      const res = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: start.lat,
          start_lon: start.lng,
          end_lat: end.lat,
          end_lon: end.lng,
          engine_type: engineType
        })
      });

      const data = await res.json();
      if (data.success) {
        setRoutes(data);
      } else {
        alert(data.message || "Failed to find a route.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting the route service.");
    } finally {
      setIsCalculating(false);
    }
  };

  const fetchDashboardData = () => {
    fetch('/api/leaderboard', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { if (data.success) setLeaderboard(data.leaderboard); });

    fetch(`/api/routes/history/${currentUser.username}?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { if (data.success) setHistory(data.history); });
  };

  const toggleDashboard = () => {
    if (!isDashboardOpen) fetchDashboardData();
    setIsDashboardOpen(!isDashboardOpen);
  };

  const handleSaveRoute = () => {
    if (!routes) return;
    
    // Capture location names if they exist, otherwise fallback to "Map Location"
    const originName = points[0]?.name || "Map Location";
    const destName = points[1]?.name || "Map Location";

    fetch('/api/routes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        startCoords: [points[0].lat, (points[0].lng || points[0].lon)],
        endCoords: [points[1].lat, (points[1].lng || points[1].lon)],
        distanceKm: routes.stats.eco_distance_km,
        originName: originName,
        destName: destName
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          setEcoPoints(data.totalPoints);
          setRoutes(null);
          setPoints([]);
          fetchDashboardData();
        }
      });
  };

  // NEW: Handle Deleting a Route
  const handleDeleteRoute = async (routeId) => {
    if (!confirm("Are you sure you want to remove this route?")) return;
    
    try {
      const res = await fetch('/api/routes/delete', {
        method: 'POST', // Using POST for broader compatibility, or use DELETE if your backend prefers
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, routeId })
      });
      
      const data = await res.json();
      if (data.success) {
        setEcoPoints(data.totalPoints); // Update points if backend deducts them
        fetchDashboardData(); // Refresh list
      } else {
        alert(data.message || "Failed to delete route.");
      }
    } catch (err) {
      console.error("Error deleting route", err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPoints([]);
    setRoutes(null);
    setIsDashboardOpen(false);
  };

  const navBtnClass = "px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold text-white shadow-lg transition-all active:scale-95 border border-white/10 backdrop-blur-md";

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 overflow-x-hidden selection:bg-emerald-500/30 flex flex-col">
      
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <header className="sticky top-0 z-[5000] bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🌱</span>
          <h1 className="m-0 text-lg md:text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
            Green Route AI
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <motion.div 
            key={ecoPoints}
            initial={{ scale: 1.2, color: "#34d399" }}
            animate={{ scale: 1, color: "#10b981" }}
            className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <span>{ecoPoints}</span> <span className="opacity-80 font-semibold">Pts</span>
          </motion.div>
          
          <motion.button whileHover={{ scale: 1.05 }} onClick={toggleDashboard} className={`${navBtnClass} bg-amber-500/80 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]`}>
            🏆 Rank
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowTutorial(true)} className={`${navBtnClass} bg-violet-500/80 hover:bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]`}>
            Guide
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowFeedback(true)} className={`${navBtnClass} bg-sky-500/80 hover:bg-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]`}>
            Contact
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={handleLogout} className={`${navBtnClass} bg-rose-500/80 hover:bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]`}>
            Logout
          </motion.button>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-6 md:gap-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SearchControls onCalculate={handleCalculateRoute} isCalculating={isCalculating} />
        </motion.div>

        <AnimatePresence>
          {routes && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 p-5 md:p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-8 w-full md:w-auto">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex-1">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Standard Route</div>
                  <div className="text-white text-lg font-semibold flex items-center gap-2">🔵 {routes.stats.standard_distance_km} km</div>
                </div>
                <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20 flex-1 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Green Route</div>
                  <div className="text-emerald-300 text-lg font-semibold flex items-center gap-2">🟢 {routes.stats.eco_distance_km} km</div>
                </div>
                <div className="bg-teal-950/30 p-4 rounded-2xl border border-teal-500/20 flex-1 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                  <div className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">CO₂ Saved</div>
                  <div className="text-teal-300 text-lg font-extrabold flex items-center gap-2">💨 {routes.stats.co2_saved_grams}g</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveRoute}
                className="group relative w-full md:w-auto whitespace-nowrap px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Choose Eco Route & Earn <span>→</span>
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className={`relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isMapExpanded ? 'fixed inset-0 z-[9999] rounded-none border-none' : 'w-full h-[500px]'}`}
        >
          <Map
            points={points}
            setPoints={setPoints}
            routes={routes}
            setRoutes={setRoutes}
            isExpanded={isMapExpanded}
            setIsExpanded={setIsMapExpanded}
          />
        </motion.div>
      </main>

      <AnimatePresence>
        {isDashboardOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={toggleDashboard}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9998]"
            />
            
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-full max-w-[380px] h-full bg-slate-900/95 backdrop-blur-2xl border-r border-white/10 z-[10000] shadow-[30px_0_60px_rgba(0,0,0,0.6)] flex flex-col"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
                <h2 className="m-0 text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Green Dashboard
                </h2>
                <button onClick={toggleDashboard} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                  ✖
                </button>
              </div>

              <div className="flex p-2 gap-2 border-b border-white/5 bg-slate-950/30">
                <button 
                  onClick={() => setActiveTab('leaderboard')} 
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                >
                  Leaderboard
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                >
                  My History
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {activeTab === 'leaderboard' ? (
                  <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                    {leaderboard.map((user, idx) => (
                      <li key={idx} className={`p-4 rounded-2xl flex justify-between items-center border ${user.username === currentUser.username ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-950/50 border-white/5'}`}>
                        <span className="text-slate-200 font-medium">
                          <b className={`mr-2 ${idx < 3 ? 'text-amber-400 text-lg' : 'text-slate-500'}`}>#{idx + 1}</b> 
                          {user.username} {user.username === currentUser.username && <span className="text-emerald-400 text-xs ml-1">(You)</span>}
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">{user.ecoPoints} pts</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                    {history.length === 0 ? <p className="text-slate-500 text-center mt-10">No routes saved yet.</p> : history.map((route, idx) => (
                      // UPGRADED LIST ITEM: Shows Location Names & Delete Button on Hover
                      <li key={idx} className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col gap-3 transition-colors hover:bg-slate-900 group">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col overflow-hidden">
                            <b className="text-slate-200 text-sm truncate" title={route.originName || `Route ${history.length - idx}`}>
                              {route.originName || `Route ${history.length - idx}`}
                            </b>
                            <span className="text-slate-400 text-xs truncate" title={route.destName || "Destination"}>
                              ➔ {route.destName || "Destination"}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg text-xs">
                              +{route.pointsEarned} pts
                            </span>
                            <button 
                              onClick={() => handleDeleteRoute(route.id || route._id)} // Uses DB id
                              className="text-rose-400/70 hover:text-rose-400 text-xs font-bold transition-all sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 flex justify-between border-t border-white/5 pt-2">
                          <span>Dist: <span className="text-slate-300">{route.distanceKm} km</span></span>
                          <span>{new Date(route.savedAt).toLocaleDateString()}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showFeedback && <Feedback currentUser={currentUser} onClose={() => setShowFeedback(false)} />}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}