"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const inputClass = "w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner";

  return (
    // Increased z-index stacking layer to ensure dropdown never hides behind the map
    <div className="relative flex-1 min-w-[220px] z-[9999]">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleType}
          className={inputClass}
        />
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3.5 top-[50%] -translate-y-[50%] z-10"
            >
              <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.ul 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            // Elevated z-index to 99999 so it floats cleanly over the map container
            className="absolute top-[105%] left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] list-none m-0 p-2 z-[99999] max-h-[220px] overflow-y-auto selection:bg-emerald-500/30"
          >
            {results.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 border-b border-white/5 cursor-pointer rounded-lg text-sm text-slate-200 leading-snug hover:bg-emerald-500/20 transition-colors"
              >
                {item.display_name}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
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
    // Added relative positioning and elevated z-index for the overall control panel box
    <form onSubmit={handleSubmit} className="relative z-[50] bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex flex-wrap gap-5 items-end selection:bg-emerald-500/30">
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

      <div className="min-w-[180px] flex-[0_1_180px] relative z-40">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Vehicle Type
        </label>
        <select
          value={engineType}
          onChange={(e) => setEngineType(e.target.value)}
          className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner appearance-none cursor-pointer"
        >
          <option value="GASOLINE" className="bg-slate-900 text-white">🚗 Petrol (Gasoline)</option>
          <option value="DIESEL" className="bg-slate-900 text-white">⛽ Diesel Car</option>
          <option value="ELECTRIC" className="bg-slate-900 text-white">⚡ Electric (EV)</option>
          <option value="HYBRID" className="bg-slate-900 text-white">🍃 Hybrid Car</option>
        </select>
      </div>

      <motion.button
        type="submit"
        disabled={isCalculating}
        whileHover={!isCalculating ? { scale: 1.05 } : {}}
        whileTap={!isCalculating ? { scale: 0.95 } : {}}
        className={`group relative px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all flex-[0_0_auto] ${
          isCalculating 
            ? 'bg-slate-700 text-slate-300 cursor-not-allowed shadow-none' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] cursor-pointer'
        }`}
      >
        {!isCalculating && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        )}
        <span className="relative z-10">
          {isCalculating ? "Calculating..." : "Find Green Route →"}
        </span>
      </motion.button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </form>
  );
}