import osmnx as ox
import requests
import json

def process_mountain_data():
    print("🌍 Loading local map...")
    G = ox.load_graphml("shimla_large_drive.graphml")
    
    # Extract the GPS coordinates of all 126 intersections
    nodes = list(G.nodes(data=True))
    locations = [{"latitude": data['y'], "longitude": data['x']} for node, data in nodes]
    
    print(f"📡 Fetching topography for {len(locations)} points from Open-Elevation...")
    
    try:
        # Ask the API for the altitude of every point
        response = requests.post(
            "https://api.open-elevation.com/api/v1/lookup",
            json={"locations": locations},
            timeout=30
        )
        
        if response.status_code == 200:
            results = response.json()['results']
            
            # Attach the altitude (in meters) to the map nodes
            for i, (node, data) in enumerate(nodes):
                G.nodes[node]['elevation'] = results[i]['elevation']
            
            # OSMnx math: Automatically calculate the % slope of every road!
            G = ox.elevation.add_edge_grades(G)
            
            filename = "shimla_large_elevation.graphml"
            ox.save_graphml(G, filename)
            
            print(f"✅ Success! Mountain data integrated.")
            print(f"💾 Saved new map as: {filename}")
        else:
            print(f"❌ API Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Network Error: {e}")

if __name__ == "__main__":
    process_mountain_data()