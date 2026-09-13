import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Required for the map to render correctly

function App() {
  // Coordinates for Shimla, India (Latitude, Longitude)
  const position = [31.1048, 77.1734];

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* 1. The Map Container */}
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
      >
        {/* 2. The OpenStreetMap Visual Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 3. A Pin Marker */}
        <Marker position={position}>
          <Popup>
            Green Route AI <br /> Start Location
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;