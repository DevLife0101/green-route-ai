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

// Automatically adjusts the map camera to frame the calculated route perfectly
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

// Upgraded GPS Locator Button with Live Position Tracking
function GPSLocator() {
  const map = useMap(); 
  const [position, setPosition] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Define what happens when the browser successfully finds the GPS coordinates
    const onLocationFound = (e) => {
      setPosition(e.latlng); // Save the exact coordinates to draw the blue dot
      map.flyTo(e.latlng, 16, { duration: 1.5 }); // Zoom in closer (level 16)
      setIsLocating(false);
    };

    // Define what happens if the user denies permissions or the GPS fails
    const onLocationError = (e) => {
      alert("Could not access your location. Please check browser GPS permissions.");
      setIsLocating(false);
    };

    // Attach listeners
    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    // Cleanup listeners so we don't cause memory leaks if the component re-renders
    return () => {
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map]);

  const handleLocate = () => {
    setIsLocating(true);
    // enableHighAccuracy forces the device GPS chip to be used if available
    map.locate({ enableHighAccuracy: true }); 
  };

  return (
    <>
      <button 
        onClick={handleLocate}
        disabled={isLocating}
        style={{
          position: "absolute", 
          bottom: "90px", 
          right: "30px", 
          zIndex: 1000,
          backgroundColor: isLocating ? "#95a5a6" : "#3498DB", 
          color: "white", 
          border: "none",
          padding: "12px 20px", 
          borderRadius: "30px", 
          cursor: isLocating ? "wait" : "pointer",
          fontWeight: "bold", 
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease"
        }}
      >
        {isLocating ? "⏳ Locating..." : "📍 Find Me"}
      </button>

      {/* Renders a classic Google Maps style "Blue Dot" at the user's exact GPS location */}
      {position && (
        <CircleMarker 
          center={position} 
          radius={8} 
          pathOptions={{ fillColor: '#3498DB', color: 'white', weight: 2, fillOpacity: 1 }}
        >
          <Popup>You are here!</Popup>
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
      <GPSLocator />
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