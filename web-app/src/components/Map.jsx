"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
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
  const map = useMap(); // Hooks into the map instance

  useEffect(() => {
    if (routes && routes.standard_route && routes.standard_route.length > 0) {
      // Gather all points from both routes to find the outermost edges
      const allPoints = [...routes.standard_route, ...(routes.eco_route || [])];
      
      // Create a Leaflet LatLngBounds object
      const bounds = L.latLngBounds(allPoints);
      
      // Tell Leaflet to smoothly fly and fit those bounds on the screen
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [routes, map]);

  return null;
}

// Live GPS Locator Button
function GPSLocator() {
  const map = useMap(); 
  
  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 15);
    }).on("locationerror", function (e) {
      alert("Could not access your location. Please check browser permissions.");
    });
  };

  return (
    <button 
      onClick={handleLocate}
      style={{
        position: "absolute", 
        bottom: "90px", 
        right: "30px", 
        zIndex: 1000,
        backgroundColor: "#3498DB", 
        color: "white", 
        border: "none",
        padding: "12px 20px", 
        borderRadius: "30px", 
        cursor: "pointer",
        fontWeight: "bold", 
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      }}
    >
      📍 Find Me
    </button>
  );
}

export default function Map({ points, setPoints, routes, setRoutes }) {
  const position = [31.1048, 77.1734]; // Default to Shimla
  
  return (
    <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      {/* 
        We set maxZoom to 19 to allow users to zoom in extremely close to view precise 
        Google-calculated intersections. OpenStreetMap natively supports up to level 19.
      */}
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        maxZoom={19} 
      />
      
      <MapClicker setPoints={setPoints} points={points} setRoutes={setRoutes} />
      <GPSLocator />
      
      {/* Invisible component that listens for route calculations and moves the camera */}
      <RouteFitter routes={routes} />

      {points.map((p, i) => (
        <Marker key={i} position={p}>
          <Popup>{i === 0 ? "Start Point" : "Destination"}</Popup>
        </Marker>
      ))}

      {/* Render the standard route with a dashed blue line */}
      {routes && routes.standard_route && (
        <Polyline positions={routes.standard_route} color="#3498DB" weight={4} opacity={0.6} dashArray="8, 8" />
      )}
      
      {/* Render the eco route with a solid thick green line */}
      {routes && routes.eco_route && (
        <Polyline positions={routes.eco_route} color="#2ECC71" weight={6} opacity={0.8} />
      )}
    </MapContainer>
  );
}