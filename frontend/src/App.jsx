import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapClicker({ setPoints, points, setRoutePath }) {
  useMapEvents({
    click(e) {
      if (points.length >= 2) {
        setPoints([e.latlng]); // Reset to 1st point
        setRoutePath([]);      // Clear old route
      } else {
        setPoints([...points, e.latlng]); // Add 2nd point
      }
    },
  });
  return null;
}

function App() {
  const [points, setPoints] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const position = [31.1048, 77.1734]; 

  // Watch the 'points' array. When it hits exactly 2, call Python.
  useEffect(() => {
    if (points.length === 2) {
      console.log("Asking Python to calculate route...");
      
      fetch('http://localhost:8000/calculate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_lat: points[0].lat,
          start_lon: points[0].lng,
          end_lat: points[1].lat,
          end_lon: points[1].lng
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("Route calculated!", data.path);
          setRoutePath(data.path);
        } else {
          console.error("Python Error:", data.error);
          alert("Python Engine Error: " + data.error); // Show error on screen!
        }
      })
      .catch(err => {
        console.error("Connection Error:", err);
        alert("Could not connect to Python server.");
      });
    }
  }, [points]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        <MapClicker setPoints={setPoints} points={points} setRoutePath={setRoutePath} />

        {points.map((p, i) => (
          <Marker key={i} position={p}>
            <Popup>{i === 0 ? "Start" : "End"}</Popup>
          </Marker>
        ))}

        {routePath.length > 0 && (
          <Polyline positions={routePath} color="#2ECC71" weight={6} />
        )}
      </MapContainer>
    </div>
  );
}

export default App;