"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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
    fetch('/api/routes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        startCoords: [points[0].lat, points[0].lng],
        endCoords: [points[1].lat, points[1].lng],
        distanceKm: routes.stats.eco_distance_km
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

  const handleLogout = () => {
    setCurrentUser(null);
    setPoints([]);
    setRoutes(null);
    setIsDashboardOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", display: "flex", flexDirection: "column" }}>
      
      {/* Top Navbar with Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">🌱</span>
          <h1 className="m-0 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Green Route AI
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.span 
            key={ecoPoints}
            initial={{ scale: 1.2, color: "#10b981" }}
            animate={{ scale: 1, color: "#059669" }}
            className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-inner border border-emerald-100"
          >
            {ecoPoints} Pts
          </motion.span>
          
          <button onClick={toggleDashboard} className="bg-amber-500 hover:bg-amber-400 text-white border-none px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold transition-colors shadow-sm">
            🏆 Rank
          </button>
          <button onClick={() => setShowTutorial(true)} className="bg-violet-500 hover:bg-violet-400 text-white border-none px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold transition-colors shadow-sm">
            Guide
          </button>
          <button onClick={() => setShowFeedback(true)} className="bg-sky-500 hover:bg-sky-400 text-white border-none px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold transition-colors shadow-sm">
            Contact
          </button>
          <button onClick={handleLogout} className="bg-rose-500 hover:bg-rose-400 text-white border-none px-4 py-1.5 rounded-lg cursor-pointer text-sm font-semibold transition-colors shadow-sm">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
        
        {/* Planner Component Above Map */}
        <SearchControls onCalculate={handleCalculateRoute} isCalculating={isCalculating} />

        {/* Route Stats Card (Shows when a route is computed) */}
        {routes && (
          <div style={{
            backgroundColor: "#ffffff",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px" }}>
              <div>🔵 <b>Standard:</b> {routes.stats.standard_distance_km} km</div>
              <div style={{ color: "#059669" }}>🟢 <b>Eco Route:</b> {routes.stats.eco_distance_km} km</div>
              <div style={{ color: "#0d9488", fontWeight: "700" }}>💨 CO₂ Saved: {routes.stats.co2_saved_grams}g</div>
            </div>
            <button
              onClick={handleSaveRoute}
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Choose Eco Route & Earn
            </button>
          </div>
        )}

        {/* Medium-Sized / Expandable Map View */}
        <Map
          points={points}
          setPoints={setPoints}
          routes={routes}
          setRoutes={setRoutes}
          isExpanded={isMapExpanded}
          setIsExpanded={setIsMapExpanded}
        />
      </main>

      {/* Slide-out Dashboard Drawer */}
      <div style={{
        position: "fixed",
        top: 0,
        left: isDashboardOpen ? 0 : "-100%",
        width: "100%",
        maxWidth: "360px",
        height: "100vh",
        backgroundColor: "#ffffff",
        zIndex: 10000,
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        transition: "left 0.3s ease",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "18px 20px", backgroundColor: "#10b981", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Green Dashboard</h2>
          <button onClick={toggleDashboard} style={{ background: "transparent", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}>✖</button>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <button onClick={() => setActiveTab('leaderboard')} style={{ flex: 1, padding: "12px", border: "none", background: activeTab === 'leaderboard' ? "#f1f5f9" : "white", fontWeight: activeTab === 'leaderboard' ? "700" : "normal", cursor: "pointer" }}>
            Leaderboard
          </button>
          <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: "12px", border: "none", background: activeTab === 'history' ? "#f1f5f9" : "white", fontWeight: activeTab === 'history' ? "700" : "normal", cursor: "pointer" }}>
            My History
          </button>
        </div>

        <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
          {activeTab === 'leaderboard' ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {leaderboard.map((user, idx) => (
                <li key={idx} style={{ padding: "10px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", backgroundColor: user.username === currentUser.username ? "#ecfdf5" : "transparent" }}>
                  <span><b>#{idx + 1}</b> {user.username} {user.username === currentUser.username && "(You)"}</span>
                  <span style={{ color: "#059669", fontWeight: "700" }}>{user.ecoPoints} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {history.length === 0 ? <p style={{ color: "#64748b" }}>No routes saved yet.</p> : history.map((route, idx) => (
                <li key={idx} style={{ padding: "10px", backgroundColor: "#f8fafc", marginBottom: "8px", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <b>Route {history.length - idx}</b>
                    <span style={{ color: "#059669", fontWeight: "700" }}>+{route.pointsEarned} pts</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Distance: {route.distanceKm} km</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>Saved: {new Date(route.savedAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showFeedback && <Feedback currentUser={currentUser} onClose={() => setShowFeedback(false)} />}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}