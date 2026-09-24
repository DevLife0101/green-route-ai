"use client";

export default function Landing({ onGetStarted }) {
  return (
    <div style={{ fontFamily: "sans-serif", color: "#333", overflowY: "auto", height: "100vh", backgroundColor: "#f9fbf9" }}>
      
      {/* Hero Section */}
      <div style={{ backgroundColor: "#e8f8f5", padding: "80px 20px", textAlign: "center", borderBottom: "4px solid #2ECC71" }}>
        <h1 style={{ fontSize: "3rem", color: "#2c3e50", margin: "0 0 20px 0" }}>
          Welcome to <span style={{ color: "#2ECC71" }}>Green Route AI</span>
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#555", maxWidth: "600px", margin: "0 auto 30px auto", lineHeight: "1.6" }}>
          The world's first 3D-aware routing engine that optimizes your drive for the planet, not just for speed. 
          Reduce your carbon footprint, earn Eco Points, and climb the global leaderboard.
        </p>
        <button 
          onClick={onGetStarted}
          style={{ backgroundColor: "#2ECC71", color: "white", border: "none", padding: "15px 40px", fontSize: "1.2rem", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 15px rgba(46, 204, 113, 0.4)" }}
        >
          Get Started Now
        </button>
      </div>

      {/* Features Grid */}
      <div style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
        
        {/* AI Explanation */}
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#3498DB", marginTop: 0 }}>🧠 How the AI Works</h2>
          <p style={{ lineHeight: "1.6", color: "#666" }}>
            Standard GPS maps only look at flat distances. Our Python AI Engine analyzes <strong>3D topographic elevation</strong> and road types. It actively penalizes steep uphill climbs that burn massive fuel and avoids residential stop-and-go idling, finding the mathematically greenest path.
          </p>
        </div>

        {/* Eco Points */}
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#2ECC71", marginTop: 0 }}>🌱 What are Eco Points?</h2>
          <p style={{ lineHeight: "1.6", color: "#666" }}>
            Every time you choose the Green Route over the Standard Route, the AI calculates the exact grams of CO₂ you saved. You are awarded <strong>Eco Points</strong> for every kilometer you drive sustainably. It is a direct measurement of your positive impact on the environment.
          </p>
        </div>

        {/* Leaderboard */}
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#f39c12", marginTop: 0 }}>🏆 The Leaderboard</h2>
          <p style={{ lineHeight: "1.6", color: "#666" }}>
            Saving the planet is a team effort. The Global Leaderboard ranks all users based on their total Eco Points. Compete against drivers locally and worldwide to prove who is the ultimate EcoWarrior. 
          </p>
        </div>

        {/* History */}
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h2 style={{ color: "#9b59b6", marginTop: 0 }}>📊 Your Route History</h2>
          <p style={{ lineHeight: "1.6", color: "#666" }}>
            Building sustainable habits takes time. Your dashboard securely saves every Eco Route you complete to your personal history. Look back at your past drives and track your lifetime CO₂ reduction.
          </p>
        </div>

      </div>
      
      <div style={{ textAlign: "center", padding: "40px", color: "#aaa", fontSize: "0.9rem" }}>
        Powered by Next.js, FastAPI, Node, and PostgreSQL.
      </div>
    </div>
  );
}