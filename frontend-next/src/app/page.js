"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Auth from '../components/Auth';

// ✨ THIS IS THE MAGIC NEXT.JS TRICK ✨
// It tells Next.js: "Do not load this map on the server, only in the browser."
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [points, setPoints] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [ecoPoints, setEcoPoints] = useState(0); 

  // ... Copy all your state (isDashboardOpen, activeTab, etc) 
  // ... Copy all your functions (fetchDashboardData, handleSaveRoute, etc)
  // EXACTLY as they were in your old App.jsx

  if (!currentUser) {
    return <Auth onLogin={(user) => {
      setCurrentUser(user);
      setEcoPoints(user.ecoPoints); 
    }} />;
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
      
      {/* ... Paste your exact Dashboard UI and Control Panel divs here ... */}
      
      {/* Render the dynamically imported map! */}
      <Map points={points} setPoints={setPoints} routes={routes} setRoutes={setRoutes} />
    </div>
  );
}