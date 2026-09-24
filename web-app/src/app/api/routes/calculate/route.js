export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { start_lat, start_lon, end_lat, end_lon } = await req.json();

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "Missing Google API Key" }, { status: 500 });
    }

    const requestBody = {
      origin: { location: { latLng: { latitude: start_lat, longitude: start_lon } } },
      destination: { location: { latLng: { latitude: end_lat, longitude: end_lon } } },
      travelMode: "DRIVE",
      // TRAFFIC_AWARE_OPTIMAL is strictly required by Google to use eco-routing
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      requestedReferenceRoutes: ["FUEL_EFFICIENT"],
      extraComputations: ["FUEL_CONSUMPTION"],
      emissionType: "GASOLINE" 
    };

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // We strictly limit the requested fields so Google processes it blazing fast
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.routeLabels,routes.travelAdvisory.fuelConsumptionMicroliters'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ success: false, message: "No route found" }, { status: 404 });
    }

    // Google labels the routes so we know which is standard vs eco
    let standardRoute = data.routes.find(r => r.routeLabels && r.routeLabels.includes('DEFAULT_ROUTE')) || data.routes[0];
    let ecoRoute = data.routes.find(r => r.routeLabels && r.routeLabels.includes('FUEL_EFFICIENT')) || standardRoute;

    // Convert microliters to grams of CO2 (1 liter of gas = ~2310g CO2)
    const standardFuelLiters = (standardRoute.travelAdvisory?.fuelConsumptionMicroliters || 0) / 1000000;
    const ecoFuelLiters = (ecoRoute.travelAdvisory?.fuelConsumptionMicroliters || 0) / 1000000;
    const co2Saved = Math.max(0, Math.round((standardFuelLiters - ecoFuelLiters) * 2310));

    return NextResponse.json({
      success: true,
      stats: {
        standard_distance_km: (standardRoute.distanceMeters / 1000).toFixed(2),
        eco_distance_km: (ecoRoute.distanceMeters / 1000).toFixed(2),
        co2_saved_grams: co2Saved
      },
      standard_polyline: standardRoute.polyline.encodedPolyline,
      eco_polyline: ecoRoute.polyline.encodedPolyline
    });

  } catch (error) {
    console.error("Calculate Route Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}