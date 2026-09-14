import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [routePath, setRoutePath] = useState([]);
  const position = [31.1048, 77.1734]; // Shimla center

  // When the map loads, ask the Python AI for the route
  useEffect(() => {
    fetch('http://localhost:8000/get-demo-route')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("Route received from AI Engine!", data.path);
          setRoutePath(data.path); // Save the coordinates to draw the line
        }
      })
      .catch(err => console.error("Could not connect to AI Engine:", err));
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={position}>
          <Popup>Green Route AI Center</Popup>
        </Marker>

        {/* If we have a route from Python, draw a thick blue line on the map! */}
        {routePath.length > 0 && (
          <Polyline positions={routePath} color="blue" weight={5} />
        )}
      </MapContainer>
    </div>
  );
}

export default App;