import osmnx as ox

print("🌍 Downloading larger map (10km radius)... this will take a minute or two.")
# Downloads all drivable roads within 10,000 meters of Shimla center
G = ox.graph_from_point((31.1048, 77.1734), dist=10000, network_type='drive')

filename = "shimla_large_drive.graphml"
ox.save_graphml(G, filename)

print(f"✅ Large map downloaded and saved as: {filename}")
print(f"Total intersections mapped: {len(G.nodes)}")