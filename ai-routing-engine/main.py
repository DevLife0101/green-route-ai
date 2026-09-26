from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import osmnx as ox
import networkx as nx

app = FastAPI(title="Green Route AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🧠 Loading 3D mountain map...")
try:
    G = ox.load_graphml("shimla_large_elevation.graphml")
except FileNotFoundError:
    print("⚠️ 3D Map not found. Falling back to flat map.")
    G = ox.load_graphml("shimla_drive.graphml")

ROAD_EFFICIENCY = {
    'primary': 1.0, 'secondary': 1.1, 'tertiary': 1.25, 
    'residential': 1.5, 'unclassified': 1.6, 'living_street': 2.0
}

# Pre-calculate 3D eco_cost on every road segment
for u, v, k, data in G.edges(keys=True, data=True):
    length = data.get('length', 10.0)
    highway_type = data.get('highway', 'residential')
    if isinstance(highway_type, list): highway_type = highway_type[0]
    
    base_penalty = ROAD_EFFICIENCY.get(highway_type, 1.4)
    base_cost = length * base_penalty
    
    # Apply mountain physics
    grade = data.get('grade', 0.0) 
    
    if grade > 0.03:
        # Steep Uphill: Massive fuel penalty (up to 3x cost)
        elevation_multiplier = 1.0 + (grade * 15)
    elif grade < -0.03:
        # Steep Downhill: EV regenerative braking / coasting saves fuel
        elevation_multiplier = 0.6
    else:
        # Flat road
        elevation_multiplier = 1.0
        
    data['eco_cost'] = base_cost * elevation_multiplier

print("✅ Map ready with 3D Eco-Routing weights!")

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    engine_type: str = "GASOLINE" # Captures the frontend dropdown selection

@app.post("/calculate-route")
def calculate_routes(req: RouteRequest):
    try:
        start_node = ox.nearest_nodes(G, req.start_lon, req.start_lat)
        end_node = ox.nearest_nodes(G, req.end_lon, req.end_lat)

        # 1. Calculate Standard Route (Shortest distance)
        standard_nodes = nx.shortest_path(G, start_node, end_node, weight='length')
        standard_path = [[G.nodes[n]['y'], G.nodes[n]['x']] for n in standard_nodes]
        standard_dist = sum(G[u][v][0].get('length', 0) for u, v in zip(standard_nodes[:-1], standard_nodes[1:]))

        # 2. Calculate Green Route (Lowest fuel/emission cost)
        eco_nodes = nx.shortest_path(G, start_node, end_node, weight='eco_cost')
        eco_path = [[G.nodes[n]['y'], G.nodes[n]['x']] for n in eco_nodes]
        eco_dist = sum(G[u][v][0].get('length', 0) for u, v in zip(eco_nodes[:-1], eco_nodes[1:]))

        # 3. Calculate Engine Effort (The missing link)
        # Sum the exact 3D work required for both paths
        std_effort = sum(G[u][v][0].get('eco_cost', G[u][v][0].get('length', 0)) for u, v in zip(standard_nodes[:-1], standard_nodes[1:]))
        eco_effort = sum(G[u][v][0].get('eco_cost', G[u][v][0].get('length', 0)) for u, v in zip(eco_nodes[:-1], eco_nodes[1:]))

        # 4. Apply Dynamic Vehicle Type Emissions
        # Grams of CO2 per unit of engine effort
        emission_factors = {
            "GASOLINE": 0.15,
            "DIESEL": 0.14,
            "HYBRID": 0.09,
            "ELECTRIC": 0.03 # Accounts for power grid emissions
        }
        multiplier = emission_factors.get(req.engine_type.upper(), 0.15)

        std_co2 = round(std_effort * multiplier, 1)
        eco_co2 = round(eco_effort * multiplier, 1)

        return {
            "success": True,
            "standard_route": standard_path,
            "eco_route": eco_path,
            "stats": {
                "standard_distance_km": round(standard_dist / 1000.0, 2),
                "eco_distance_km": round(eco_dist / 1000.0, 2),
                "standard_co2_grams": std_co2,
                "eco_co2_grams": eco_co2,
                "co2_saved_grams": max(0.0, round(std_co2 - eco_co2, 1))
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}