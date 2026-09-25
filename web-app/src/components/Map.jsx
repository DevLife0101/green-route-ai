"use client";
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Forces Leaflet to recalibrate tile dimensions when toggled between medium & fullscreen
function MapResizer({ isExpanded }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [isExpanded, map]);
  return null;
}

function MapClicker({ setPoints, points, setRoutes }) {
  useMapEvents({
    click(e) {
      if (points.length >= 2) {
        setPoints([e.latlng]);
        setRoutes(null);
      } else {
        setPoints([...points, e.latlng]);
      }
    },
  });
  return null;
}

function RouteFitter({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (routes && routes.standard_route && routes.standard_route.length > 0) {
      const allPoints = [...routes.standard_route, ...(routes.eco_route || [])];
      const bounds = L.latLngBounds(allPoints);
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    }
  }, [routes, map]);
  return null;
}

function GPSLocator({ points, routes }) {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const btnRef = useRef(null);

  // FIX: Force Leaflet to ignore clicks on this button so it doesn't swallow the event
  useEffect(() => {
    if (btnRef.current) {
      L.DomEvent.disableClickPropagation(btnRef.current);
    }
  }, []);

  useEffect(() => {
    const onLocationFound = (e) => {
      setPosition(e.latlng);
      if (isTracking) {
        map.flyTo(e.latlng, 18, { animate: true, duration: 0.5 });
      }
    };

    const onLocationError = () => {
      alert("GPS connection failed. Please enable location permissions.");
      setIsTracking(false);
      map.stopLocate();
    };

    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    return () => {
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map, isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
      map.stopLocate();
      if (routes && routes.standard_route && routes.standard_route.length > 0) {
        const allPoints = [...routes.standard_route, ...(routes.eco_route || [])];
        map.flyToBounds(L.latLngBounds(allPoints), { padding: [40, 40], duration: 1.2 });
      }
    } else {
      setIsTracking(true);
      map.locate({ watch: true, enableHighAccuracy: true, maximumAge: 0 });
      if (points && points.length > 0) {
        map.flyTo(points[0], 18, { animate: true, duration: 1.2 });
      }
    }
  };

  return (
    <>
      <div ref={btnRef} className="absolute bottom-6 right-6 z-[1000]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTracking}
          className={`px-5 py-3 rounded-full font-bold text-sm shadow-[0_10px_25px_rgba(0,0,0,0.4)] border border-white/20 backdrop-blur-md transition-colors ${
            isTracking 
              ? 'bg-rose-500/90 text-white hover:bg-rose-500' 
              : 'bg-sky-500/90 text-white hover:bg-sky-500'
          }`}
        >
          {isTracking ? "🛑 Stop Tracking" : "📍 Start Drive Mode"}
        </motion.button>
      </div>

      {position && (
        <CircleMarker center={position} radius={8} pathOptions={{ fillColor: '#2563eb', color: 'white', weight: 3, fillOpacity: 1 }}>
          <CircleMarker center={position} radius={22} pathOptions={{ fillColor: '#2563eb', color: 'none', fillOpacity: 0.18 }} />
        </CircleMarker>
      )}
    </>
  );
}

export default function Map({ points, setPoints, routes, setRoutes, isExpanded, setIsExpanded }) {
  const position = [31.1048, 77.1734];

  return (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden relative ${
      isExpanded 
        ? 'fixed inset-0 z-[9999] rounded-none border-none w-screen h-screen' 
        : 'w-full h-full min-h-[500px] z-[1] rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
    }`}>
      
      {/* Expand / Minimize Map Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-5 right-5 z-[1000] bg-slate-900/80 backdrop-blur-xl text-white border border-white/20 rounded-xl px-4 py-2.5 text-sm font-bold shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:bg-slate-800 transition-colors"
      >
        {isExpanded ? "🗗 Minimize View" : "⛶ Expand Map"}
      </motion.button>

      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <MapResizer isExpanded={isExpanded} />
        <MapClicker setPoints={setPoints} points={points} setRoutes={setRoutes} />
        <GPSLocator points={points} routes={routes} />
        <RouteFitter routes={routes} />

        {points.map((p, i) => (
          <Marker key={i} position={p}>
            <Popup>{i === 0 ? "Start Point" : "Destination"}</Popup>
          </Marker>
        ))}

        {routes && routes.standard_route && (
          <Polyline positions={routes.standard_route} color="#3b82f6" weight={4} opacity={0.6} dashArray="8, 8" />
        )}
        {routes && routes.eco_route && (
          <Polyline positions={routes.eco_route} color="#10b981" weight={6} opacity={0.85} />
        )}
      </MapContainer>
    </div>
  );
}