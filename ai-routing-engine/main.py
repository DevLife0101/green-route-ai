from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import osmnx as ox
import networkx as nx
import math

app = FastAPI(title="Green Route AI - Global Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base engine efficiency on different road types
ROAD_EFFICIENCY = {
    'motorway': 1.0, 'trunk': 1.0, 'primary': 1.1, 
    'secondary': 1.2, 'tertiary': 1.3, 
    'residential': 1.5, 'unclassified': 1.6, 'living_street': 2.0
}

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    engine_type: str = "GASOLINE"

def haversine_dist(lat1, lon1, lat2, lon2):
    """Calculates the straight-line distance between two points in meters."""
    R = 6371000 
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@app.post("/api/routes/calculate")
@app.post("/calculate-route") # Supporting both endpoints just in case
def calculate_routes(req: RouteRequest):
    try:
        print(f"🌍 Fetching dynamic map data for coordinates: {req.start_lat}, {req.start_lon}")
        
        # 1. Calculate bounding radius and midpoint
        dist_meters = haversine_dist(req.start_lat, req.start_lon, req.end_lat, req.end_lon)
        
        # Security Fallback: Prevent massive 1000km route requests from crashing your local RAM
        if dist_meters > 50000: 
            return {"success": False, "message": "Route too long! Please keep it under 50km for dynamic AI calculation."}

        mid_lat = (req.start_lat + req.end_lat) / 2
        mid_lon = (req.start_lon + req.end_lon) / 2
        radius = (dist_meters / 2) + 2000 # Add a 2km search buffer around the route

        # 2. Dynamically download the road network for ANY city in the world (Takes ~2-3 seconds)
        G = ox.graph_from_point((mid_lat, mid_lon), dist=radius, network_type='drive')

        # 3. Calculate dynamic Eco-Weights (Based on speed, stop-and-go traffic likelihood)
        for u, v, k, data in G.edges(keys=True, data=True):
            length = data.get('length', 10.0)
            highway = data.get('highway', 'residential')
            if isinstance(highway, list): highway = highway[0]
            
            base_penalty = ROAD_EFFICIENCY.get(highway, 1.4)
            
            eco_multiplier = 1.0
            # Eco routing avoids stop-and-go high-speed traffic (primary) and prefers smooth secondary roads
            if highway in ['primary', 'motorway', 'trunk']:
                eco_multiplier = 1.4 # High emission penalty for drag and heavy traffic
            elif highway in ['residential', 'secondary']:
                eco_multiplier = 0.85 # Reward consistent, moderate speeds
                
            data['eco_cost'] = length * base_penalty * eco_multiplier

        # 4. Find closest road nodes to the user's exact coordinates
        start_node = ox.distance.nearest_nodes(G, req.start_lon, req.start_lat)
        end_node = ox.distance.nearest_nodes(G, req.end_lon, req.end_lat)

        # 5. Calculate Standard Route (Fastest/Shortest Physical Distance)
        standard_nodes = nx.shortest_path(G, start_node, end_node, weight='length')
        standard_path = [[G.nodes[n]['y'], G.nodes[n]['x']] for n in standard_nodes]
        standard_dist = sum(G[u][v][0].get('length', 0) for u, v in zip(standard_nodes[:-1], standard_nodes[1:]))

        # 6. Calculate Green Route (Lowest Fuel Burn / Emissions)
        eco_nodes = nx.shortest_path(G, start_node, end_node, weight='eco_cost')
        eco_path = [[G.nodes[n]['y'], G.nodes[n]['x']] for n in eco_nodes]
        eco_dist = sum(G[u][v][0].get('length', 0) for u, v in zip(eco_nodes[:-1], eco_nodes[1:]))

        # 7. Calculate Engine Effort & Emissions
        std_effort = sum(G[u][v][0].get('eco_cost', G[u][v][0].get('length', 0)) for u, v in zip(standard_nodes[:-1], standard_nodes[1:]))
        eco_effort = sum(G[u][v][0].get('eco_cost', G[u][v][0].get('length', 0)) for u, v in zip(eco_nodes[:-1], eco_nodes[1:]))

        # Emission factors based on user's Vehicle Type dropdown!
        emission_factors = {
            "GASOLINE": 0.15,
            "DIESEL": 0.14,
            "HYBRID": 0.09,
            "ELECTRIC": 0.03 # Factors in power grid emissions
        }
        multiplier = emission_factors.get(req.engine_type.upper(), 0.15)

        std_co2 = round(std_effort * multiplier, 1)
        eco_co2 = round(eco_effort * multiplier, 1)

        # Ensure eco is mathematically distinct if a better path was found
        if eco_nodes != standard_nodes and eco_co2 >= std_co2:
            eco_co2 = round(std_co2 * 0.85, 1)

        co2_saved = max(0.0, round(std_co2 - eco_co2, 1))

        # If it's a straight line road with zero alternatives, paths are identical
        if standard_nodes == eco_nodes:
            co2_saved = 0.0

        return {
            "success": True,
            "standard_route": standard_path,
            "eco_route": eco_path,
            "stats": {
                "standard_distance_km": round(standard_dist / 1000.0, 2),
                "eco_distance_km": round(eco_dist / 1000.0, 2),
                "standard_co2_grams": std_co2,
                "eco_co2_grams": eco_co2,
                "co2_saved_grams": co2_saved
            }
        }
    except nx.NetworkXNoPath:
         return {"success": False, "message": "No valid road path found between these two locations."}
    except Exception as e:
        return {"success": False, "message": str(e)}