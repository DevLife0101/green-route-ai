import osmnx as ox

def process_local_map():
    print("🌍 Reading local map.osm file offline...")
    print("⏳ Processing nodes and edges...")
    
    try:
        # 1. Load the graph directly from your downloaded file
        G = ox.graph_from_xml("map.osm")
        
        # 2. Save it mathematically for the AI engine
        filename = "shimla_drive.graphml"
        ox.save_graphml(G, filename)
        
        print(f"✅ Success! Map data processed offline without the internet.")
        print(f"💾 Saved locally as: {filename}")
        print(f"📊 Total Nodes (Intersections): {len(G.nodes)}")
        print(f"🛣️ Total Edges (Roads): {len(G.edges)}")
        
    except FileNotFoundError:
        print("❌ Error: Could not find 'map.osm'. Make sure you moved it into the ai-routing-engine folder!")
    except Exception as e:
        print(f"❌ Processing failed. Error: {e}")

if __name__ == "__main__":
    process_local_map()