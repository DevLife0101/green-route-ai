"use client";
import { useState } from 'react';

export default function SearchControls({ onSearch }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!start || !end) {
      alert("Please enter both a start location and a destination.");
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Fetch coordinates for the start location
      const startRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(start)}`);
      const startData = await startRes.json();
      
      // Fetch coordinates for the destination
      const endRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(end)}`);
      const endData = await endRes.json();

      if (startData.length === 0) throw new Error(`Could not find location: ${start}`);
      if (endData.length === 0) throw new Error(`Could not find location: ${end}`);

      // Extract the most relevant result's coordinates
      const startCoords = { lat: parseFloat(startData[0].lat), lng: parseFloat(startData[0].lon) };
      const endCoords = { lat: parseFloat(endData[0].lat), lng: parseFloat(endData[0].lon) };

      // Pass the coordinates back to the main map state
      onSearch([startCoords, endCoords]);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{
      position: "absolute",
      top: "15px",
      left: "15px",
      zIndex: 2000,
      backgroundColor: "white",
      padding: "16px",
      borderRadius: "10px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
      width: "100%",
      maxWidth: "300px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#333" }}>🔍 Plan Eco Route</h3>
      
      <input 
        type="text" 
        placeholder="Start (e.g., Shimla)" 
        value={start}
        onChange={(e) => setStart(e.target.value)}
        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" }}
      />
      
      <input 
        type="text" 
        placeholder="Destination (e.g., Delhi)" 
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" }}
      />
      
      <button 
        onClick={handleSearch} 
        disabled={isSearching}
        style={{ 
          backgroundColor: isSearching ? "#95a5a6" : "#3498DB", 
          color: "white", 
          border: "none", 
          padding: "10px", 
          borderRadius: "6px", 
          cursor: isSearching ? "not-allowed" : "pointer", 
          fontWeight: "bold",
          marginTop: "5px"
        }}
      >
        {isSearching ? "Searching..." : "Find Route"}
      </button>
    </div>
  );
}