"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Auth from '../components/Auth';
import Landing from '../components/Landing'; // Import the Landing Page
import Feedback from '../components/Feedback'; // Import Feedback Component

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  // Flow State
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Map & Dashboard State
  const [points, setPoints] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [ecoPoints, setEcoPoints] = useState(0); 
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);

  // Fetch routes from Python engine (Render Cloud URL)
  useEffect(() => {
    if (points.length === 2) {
      fetch('https://green-route-python.onrender.com/calculate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: points[0].lat,
          start_lon: points[0].lng,
          end_lat: points[1].lat,
          end_lon: points[1].lng
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRoutes(data);
      });
    }
  }, [points]);

  // --- NEW FLOW LOGIC ---
  if (!currentUser && !showAuth) {
    return <Landing onGetStarted={() => setShowAuth(true)} />;
  }

  if (!currentUser && showAuth) {
    return <Auth onLogin={(user) => {
      setCurrentUser(user);
      setEcoPoints(user.ecoPoints); 
    }} />;
  }

  const fetchDashboardData = () => {
    // Node API (Render Cloud URL)
    fetch('https://green-route-node.onrender.com/api/leaderboard')
      .then(res => res.json())
      .then(data => { if (data.success) setLeaderboard(data.leaderboard); });

    // Node API (Render Cloud URL)
    fetch(`https://green-route-node.onrender.com/api/routes/history/${currentUser.username}`)
      .then(res => res.json())
      .then(data => { if (data.success) setHistory(data.history); });
  };

  const toggleDashboard = () => {
    if (!isDashboardOpen) fetchDashboardData();
    setIsDashboardOpen(!isDashboardOpen);
  };

  const handleSaveRoute = () => {
    if (!routes) return;
    // Node API (Render Cloud URL)
    fetch('https://green-route-node.onrender.com/api/routes/save', {
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
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
      
      {/* Top Right Control Panel */}
      <div style={{
        position: "absolute", top: "15px", right: "15px", zIndex: 1000,
        backgroundColor: "white", padding: "16px", borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)", width: "280px", color: "#333"
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: "0", fontSize: "1.2rem", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentUser.username}
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowFeedback(true)} style={{ background: "#3498DB", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              💡 Help
            </button>
            <button onClick={toggleDashboard} style={{ background: "#f39c12", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              🏆 Rank
            </button>
            <button onClick={handleLogout} style={{ background: "#e74c3c", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
              Logout
            </button>
          </div>
        </div>
        <p style={{ margin: "12px 0", color: "#2ECC71", fontWeight: "bold" }}>
          🌱 {ecoPoints} Total Points
        </p>

        {routes && (
          <div>
            <hr style={{ border: "0.5px solid #eee" }} />
            <p style={{ margin: "6px 0", fontSize: "14px" }}>
              🔵 <b>Standard:</b> {routes.stats.standard_distance_km} km
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#27ae60" }}>
              🟢 <b>Eco Route:</b> {routes.stats.eco_distance_km} km
            </p>
            <p style={{ margin: "8px 0", fontSize: "13px", fontWeight: "bold", color: "#16a085" }}>
              💨 CO₂ Saved: {routes.stats.co2_saved_grams}g
            </p>
            <button onClick={handleSaveRoute} style={{ backgroundColor: "#2ECC71", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", width: "100%", marginTop: "8px", fontWeight: "bold" }}>
              Choose Eco Route & Earn
            </button>
          </div>
        )}
      </div>

      {/* Slide-out Gamification Dashboard */}
      <div style={{
        position: "absolute", top: "0", left: isDashboardOpen ? "0" : "-350px", 
        width: "350px", height: "100vh", backgroundColor: "white", zIndex: 2000,
        boxShadow: "4px 0 15px rgba(0,0,0,0.2)", transition: "left 0.3s ease",
        display: "flex", flexDirection: "column", color: "#333"
      }}>
        <div style={{ padding: "20px", backgroundColor: "#2ECC71", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Green Dashboard</h2>
          <button onClick={toggleDashboard} style={{ background: "transparent", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}>✖</button>
        </div>
        
        <div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
          <button onClick={() => setActiveTab('leaderboard')} style={{ flex: 1, padding: "15px", border: "none", color: "#333", background: activeTab === 'leaderboard' ? "#f8f9fa" : "white", fontWeight: activeTab === 'leaderboard' ? "bold" : "normal", cursor: "pointer" }}>Leaderboard</button>
          <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: "15px", border: "none", color: "#333", background: activeTab === 'history' ? "#f8f9fa" : "white", fontWeight: activeTab === 'history' ? "bold" : "normal", cursor: "pointer" }}>My History</button>
        </div>

        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {activeTab === 'leaderboard' ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {leaderboard.map((user, idx) => (
                <li key={idx} style={{ padding: "12px 10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", backgroundColor: user.username === currentUser.username ? "#e8f8f5" : "transparent" }}>
                  <span><b>#{idx + 1}</b> {user.username} {user.username === currentUser.username && "(You)"}</span>
                  <span style={{ color: "#2ECC71", fontWeight: "bold" }}>{user.ecoPoints} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {history.length === 0 ? <p style={{ color: "#666" }}>No routes saved yet.</p> : history.map((route, idx) => (
                <li key={idx} style={{ padding: "12px", borderBottom: "1px solid #eee", backgroundColor: "#f8f9fa", marginBottom: "8px", borderRadius: "5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <b>Route {history.length - idx}</b>
                    <span style={{ color: "#2ECC71", fontWeight: "bold" }}>+{route.pointsEarned} pts</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Distance: {route.distanceKm} km</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Saved: {new Date(route.savedAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Map points={points} setPoints={setPoints} routes={routes} setRoutes={setRoutes} />
      
      {/* Feedback Modal Overlay */}
      {showFeedback && (
        <Feedback currentUser={currentUser} onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}