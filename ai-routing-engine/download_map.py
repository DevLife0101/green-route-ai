import osmnx as ox

def download_and_save_map():
    # 1. Define the target area (Matches your React map!)
    place_name = "Shimla, Himachal Pradesh, India"
    print(f"🌍 Fetching road network for: {place_name}...")
    print("⏳ This might take a minute or two depending on your internet...")

    try:
        # 2. Download the street network specifically for driving
        # This automatically filters out walking trails or train tracks
        G = ox.graph_from_place(place_name, network_type='drive')

        # 3. Save the mathematical graph to a file
        filename = "shimla_drive.graphml"
        ox.save_graphml(G, filename)

        # 4. Print the stats
        print(f"✅ Success! Map data saved to {filename}")
        print(f"📍 Total Intersections (Nodes): {len(G.nodes)}")
        print(f"🛣️  Total Road Segments (Edges): {len(G.edges)}")

    except Exception as e:
        print(f"❌ Error downloading map data: {e}")

if __name__ == "__main__":
    download_and_save_map()