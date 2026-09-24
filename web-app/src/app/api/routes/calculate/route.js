export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

function decodePolyline(encoded) {
  if (!encoded) return [];
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
}

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
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      requestedReferenceRoutes: ["FUEL_EFFICIENT"],
      extraComputations: ["FUEL_CONSUMPTION"],
      routeModifiers: {
        vehicleInfo: {
          emissionType: "GASOLINE"
        }
      }
    };

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.routeLabels,routes.travelAdvisory.fuelConsumptionMicroliters'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.log("GOOGLE API ERROR:", JSON.stringify(data, null, 2));
      return NextResponse.json({ success: false, message: "No route found", details: data }, { status: 404 });
    }

    const standardRoute = data.routes.find(r => r.routeLabels?.includes('DEFAULT_ROUTE')) || data.routes[0];
    const ecoRoute = data.routes.find(r => r.routeLabels?.includes('FUEL_EFFICIENT')) || standardRoute;

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
      standard_route: decodePolyline(standardRoute.polyline?.encodedPolyline),
      eco_route: decodePolyline(ecoRoute.polyline?.encodedPolyline)
    });

  } catch (error) {
    console.error("Calculate Route Error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}