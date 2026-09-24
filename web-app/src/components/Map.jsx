"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing Leaflet marker images in Next.js/Vercel
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [routes, map]);

  return null;
}

// Live GPS Tracker with Google Maps Navigation Behavior
function GPSLocator({ points, routes }) {
  const map = useMap(); 
  const [position, setPosition] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const onLocationFound = (e) => {
      setPosition(e.latlng); 
      
      // If tracking mode is on, lock the camera to the user's movement
      if (isTracking) {
        map.flyTo(e.latlng, 18, { 
          animate: true, 
          duration: 0.5 
        });
      }
    };

    const onLocationError = (e) => {
      alert("GPS connection lost or permission denied.");
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
      // STOP NAVIGATION
      setIsTracking(false);
      map.stopLocate(); 
      
      // When tracking stops, if there is a route, smoothly zoom back out to show the full trip
      if (routes && routes.standard_route && routes.standard_route.length > 0) {
        const allPoints = [...routes.standard_route, ...(routes.eco_route || [])];
        const bounds = L.latLngBounds(allPoints);
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    } else {
      // START NAVIGATION
      setIsTracking(true);
      map.locate({ 
        watch: true,                
        enableHighAccuracy: true,   
        maximumAge: 0               
      }); 

      // Like Google Maps, snap the camera instantly to the Start Point at street level (zoom 18)
      if (points && points.length > 0) {
        map.flyTo(points[0], 18, { animate: true, duration: 1.5 });
      }
    }
  };

  return (
    <>
      <button 
        onClick={toggleTracking}
        style={{
          position: "absolute", 
          bottom: "90px", 
          right: "30px", 
          zIndex: 1000,
          backgroundColor: isTracking ? "#e74c3c" : "#3498DB", 
          color: "white", 
          border: "none",
          padding: "12px 20px", 
          borderRadius: "30px", 
          cursor: "pointer",
          fontWeight: "bold", 
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease"
        }}
      >
        {isTracking ? "🛑 Stop Tracking" : "📍 Start Drive Mode"}
      </button>

      {position && (
        <CircleMarker 
          center={position} 
          radius={8} 
          pathOptions={{ fillColor: '#3498DB', color: 'white', weight: 3, fillOpacity: 1 }}
        >
          <CircleMarker 
            center={position} 
            radius={20} 
            pathOptions={{ fillColor: '#3498DB', color: 'none', fillOpacity: 0.2 }}
          />
        </CircleMarker>
      )}
    </>
  );
}

export default function Map({ points, setPoints, routes, setRoutes }) {
  const position = [31.1048, 77.1734]; // Default to Shimla
  
  return (
    <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        maxZoom={19} 
      />
      
      <MapClicker setPoints={setPoints} points={points} setRoutes={setRoutes} />
      
      {/* 
        CRITICAL FIX: 
        We pass `points` and `routes` down to the GPSLocator so it knows 
        where the Start Point is and can zoom back out to the full Route. 
      */}
      <GPSLocator points={points} routes={routes} />
      
      <RouteFitter routes={routes} />

      {points.map((p, i) => (
        <Marker key={i} position={p}>
          <Popup>{i === 0 ? "Start Point" : "Destination"}</Popup>
        </Marker>
      ))}

      {routes && routes.standard_route && (
        <Polyline positions={routes.standard_route} color="#3498DB" weight={4} opacity={0.6} dashArray="8, 8" />
      )}
      
      {routes && routes.eco_route && (
        <Polyline positions={routes.eco_route} color="#2ECC71" weight={6} opacity={0.8} />
      )}
    </MapContainer>
  );
}