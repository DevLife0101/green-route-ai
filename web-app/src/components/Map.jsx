"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
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
      <button
        onClick={toggleTracking}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: isTracking ? "#ef4444" : "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: "30px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "13px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
        }}
      >
        {isTracking ? "🛑 Stop Tracking" : "📍 Start Drive Mode"}
      </button>

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
    <div style={{
      position: isExpanded ? "fixed" : "relative",
      top: isExpanded ? 0 : "auto",
      left: isExpanded ? 0 : "auto",
      width: isExpanded ? "100vw" : "100%",
      height: isExpanded ? "100vh" : "480px",
      zIndex: isExpanded ? 9999 : 1,
      borderRadius: isExpanded ? "0" : "12px",
      overflow: "hidden",
      border: isExpanded ? "none" : "1px solid #e2e8f0",
      boxShadow: isExpanded ? "none" : "0 4px 12px rgba(0,0,0,0.06)",
      transition: "height 0.2s ease, width 0.2s ease"
    }}>
      {/* Expand / Minimize Map Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}
      >
        {isExpanded ? "🗗 Minimize View" : "⛶ Expand Map"}
      </button>

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