"use client";
import { useState, useRef } from 'react';

function AutocompleteInput({ label, placeholder, onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null);

  const searchLocation = (text) => {
    if (!text) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        setResults(data || []);
        setIsOpen(true);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleType = (e) => {
    const val = e.target.value;
    setQuery(val);
    onLocationSelect(null);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      searchLocation(val);
    }, 600);
  };

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setIsOpen(false);
    onLocationSelect({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name
    });
  };

  return (
    <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleType}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            boxSizing: "border-box",
            outline: "none"
          }}
        />
        {isLoading && (
          <span style={{ position: "absolute", right: "10px", top: "10px", fontSize: "12px" }}>⏳</span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          listStyle: "none",
          margin: "4px 0 0 0",
          padding: 0,
          zIndex: 5000,
          maxHeight: "180px",
          overflowY: "auto"
        }}>
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #f1f5f9",
                cursor: "pointer",
                fontSize: "13px",
                color: "#1e293b",
                lineHeight: "1.4"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SearchControls({ onCalculate, isCalculating }) {
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [engineType, setEngineType] = useState("GASOLINE");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startCoords || !endCoords) {
      alert("⚠️ Please select both a start location and destination from the dropdown.");
      return;
    }
    onCalculate({
      start: startCoords,
      end: endCoords,
      engineType
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: "#ffffff",
      padding: "18px 20px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      display: "flex",
      flexWrap: "wrap",
      gap: "14px",
      alignItems: "flex-end"
    }}>
      <AutocompleteInput 
        label="Origin" 
        placeholder="Start location..." 
        onLocationSelect={setStartCoords} 
      />

      <AutocompleteInput 
        label="Destination" 
        placeholder="Destination..." 
        onLocationSelect={setEndCoords} 
      />

      <div style={{ minWidth: "160px", flex: "0 1 180px" }}>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>
          Vehicle Type
        </label>
        <select
          value={engineType}
          onChange={(e) => setEngineType(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            outline: "none"
          }}
        >
          <option value="GASOLINE">🚗 Petrol (Gasoline)</option>
          <option value="DIESEL">⛽ Diesel Car</option>
          <option value="ELECTRIC">⚡ Electric (EV)</option>
          <option value="HYBRID">🍃 Hybrid Car</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isCalculating}
        style={{
          padding: "11px 22px",
          backgroundColor: isCalculating ? "#94a3b8" : "#10b981",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          cursor: isCalculating ? "not-allowed" : "pointer",
          flex: "0 0 auto",
          transition: "background-color 0.2s"
        }}
      >
        {isCalculating ? "Calculating..." : "Find Green Route"}
      </button>
    </form>
  );
}