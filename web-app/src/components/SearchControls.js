"use client";
import { useState, useRef } from 'react';

// A reusable autocomplete input component
function AutocompleteInput({ placeholder, onLocationSelect }) {
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
    
    // Fetch real locations from OpenStreetMap
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setIsOpen(true);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handleType = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    // Clear the validated location state the moment they modify the text
    onLocationSelect(null); 

    // Debounce: Wait 800ms after they stop typing before hitting the API 
    // to prevent getting blocked for making too many requests
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      searchLocation(val);
    }, 800);
  };

  const handleSelect = (item) => {
    setQuery(item.display_name); // Fill the input with the full, correct address
    setIsOpen(false);
    
    // Pass the exact, verified GPS coordinates back up
    onLocationSelect({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    });
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleType}
        style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box", fontSize: "14px" }}
      />
      {isLoading && (
        <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '14px' }}>⏳</span>
      )}

      {isOpen && results.length > 0 && (
        <ul style={{
          position: "absolute", top: "100%", left: 0, width: "100%", backgroundColor: "white",
          border: "1px solid #ddd", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          listStyle: "none", margin: "5px 0 0 0", padding: 0, zIndex: 5000, maxHeight: "200px", overflowY: "auto"
        }}>
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "12px", color: "#333", lineHeight: "1.4" }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
      
      {/* Show a warning if they typed something but nothing was found */}
      {isOpen && query && results.length === 0 && !isLoading && (
        <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", backgroundColor: "#fff3f3", padding: "10px", border: "1px solid #ffcaca", borderRadius: "6px", fontSize: "12px", color: "#c0392b", marginTop: "5px", zIndex: 5000, boxSizing: "border-box" }}>
          No location found. Try typing a broader area (e.g., "City, State").
        </div>
      )}
    </div>
  );
}

export default function SearchControls({ onSearch }) {
  // We now strictly store coordinates, not just text strings
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  const handleSearch = () => {
    // Strictly prevent the search if both locations haven't been validated via the dropdown
    if (!startCoords || !endCoords) {
      alert("⚠️ You must select a valid start and destination from the dropdown list.");
      return;
    }
    
    // Pass the perfectly validated coordinates directly to your map
    onSearch([startCoords, endCoords]);
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
      maxWidth: "320px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      <h3 style={{ margin: "0 0 2px 0", fontSize: "16px", color: "#333" }}>🔍 Plan Eco Route</h3>
      
      <AutocompleteInput 
        placeholder="Start (e.g., Shimla)" 
        onLocationSelect={setStartCoords} 
      />
      
      <AutocompleteInput 
        placeholder="Destination (e.g., Delhi)" 
        onLocationSelect={setEndCoords} 
      />
      
      <button 
        onClick={handleSearch} 
        style={{ 
          backgroundColor: "#3498DB", 
          color: "white", 
          border: "none", 
          padding: "12px", 
          borderRadius: "6px", 
          cursor: "pointer", 
          fontWeight: "bold",
          marginTop: "4px",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#2980B9'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#3498DB'}
      >
        Find Route
      </button>
    </div>
  );
}