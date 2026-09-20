"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

// NEW: Live GPS Locator Button
function GPSLocator() {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 15); // Zoom level 15
    }).on("locationerror", function (e) {
      alert("Could not access your location. Please check browser permissions.");
    });
  };

  return (
    <button 
      onClick={handleLocate}
      style={{
        position: "absolute", bottom: "30px", right: "20px", zIndex: 1000,
        backgroundColor: "#3498DB", color: "white", border: "none",
        padding: "12px 20px", borderRadius: "8px", cursor: "pointer",
        fontWeight: "bold", boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
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
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClicker setPoints={setPoints} points={points} setRoutes={setRoutes} />
      
      <GPSLocator /> {/* Injecting the new button */}

      {points.map((p, i) => (
        <Marker key={i} position={p}>
          <Popup>{i === 0 ? "Start Point" : "Destination"}</Popup>
        </Marker>
      ))}
      {routes && (
        <Polyline positions={routes.standard_route} color="#3498DB" weight={4} opacity={0.6} dashArray="8, 8" />
      )}
      {routes && (
        <Polyline positions={routes.eco_route} color="#2ECC71" weight={6} opacity={0.7} />
      )}
    </MapContainer>
  );
}