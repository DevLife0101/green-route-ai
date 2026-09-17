import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
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

function App() {
  const [points, setPoints] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [ecoPoints, setEcoPoints] = useState(9);
  const position = [31.1048, 77.1734];

  useEffect(() => {
    if (points.length === 2) {
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
          setRoutes(data);
        } else {
          alert("Routing error: " + data.error);
        }
      })
      .catch(err => alert("Could not reach Python routing engine: " + err));
    }
  }, [points]);

  const handleSaveRoute = () => {
    if (!routes) return;
    fetch('http://localhost:5000/api/routes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "EcoWarrior4",
        startCoords: [points[0].lat, points[0].lng],
        endCoords: [points[1].lat, points[1].lng],
        distanceKm: routes.stats.eco_distance_km
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        setEcoPoints(data.totalPoints);
      }
    });
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      {/* Control Panel */}
      <div style={{
        position: "absolute", top: "15px", right: "15px", zIndex: 1000,
        backgroundColor: "white", padding: "16px", borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)", width: "260px"
      }}>
        <h3 style={{ margin: "0 0 5px 0" }}>EcoWarrior4</h3>
        <p style={{ margin: "0 0 12px 0", color: "#2ECC71", fontWeight: "bold" }}>
          🌱 {ecoPoints} Total Points
        </p>

        {routes && (
          <div>
            <hr style={{ border: "0.5px solid #eee" }} />
            <p style={{ margin: "6px 0", fontSize: "14px" }}>
              🔵 <b>Standard:</b> {routes.stats.standard_distance_km} km ({routes.stats.standard_co2_grams}g CO₂)
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", color: "#27ae60" }}>
              🟢 <b>Eco Route:</b> {routes.stats.eco_distance_km} km ({routes.stats.eco_co2_grams}g CO₂)
            </p>
            <p style={{ margin: "8px 0", fontSize: "13px", fontWeight: "bold", color: "#16a085" }}>
              💨 CO₂ Saved: {routes.stats.co2_saved_grams}g
            </p>

            <button
              onClick={handleSaveRoute}
              style={{
                backgroundColor: "#2ECC71", color: "white", border: "none",
                padding: "10px", borderRadius: "6px", cursor: "pointer",
                width: "100%", marginTop: "8px", fontWeight: "bold"
              }}
            >
              Choose Eco Route & Earn
            </button>
          </div>
        )}
      </div>

      <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClicker setPoints={setPoints} points={points} setRoutes={setRoutes} />

        {points.map((p, i) => (
          <Marker key={i} position={p}>
            <Popup>{i === 0 ? "Start Point" : "Destination"}</Popup>
          </Marker>
        ))}

        {/* Standard Route (Blue) */}
        {routes && (
          <Polyline positions={routes.standard_route} color="#3498DB" weight={4} opacity={0.6} dashArray="8, 8" />
        )}

        {/* Green Route (Green) */}
        {routes && (
          <Polyline positions={routes.eco_route} color="#2ECC71" weight={6} opacity={0.7} />
        )}
      </MapContainer>
    </div>
  );
}

export default App;