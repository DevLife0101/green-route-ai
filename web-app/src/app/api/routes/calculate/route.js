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
    const { start_lat, start_lon, end_lat, end_lon, engine_type } = await req.json();

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "Missing Google API Key" }, { status: 500 });
    }

    const selectedEngine = engine_type || "GASOLINE";

    // Primary Request: Strict, Live-Traffic Eco Routing
    const requestBody = {
      origin: { location: { latLng: { latitude: start_lat, longitude: start_lon } } },
      destination: { location: { latLng: { latitude: end_lat, longitude: end_lon } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
      computeAlternativeRoutes: true, 
      requestedReferenceRoutes: ["FUEL_EFFICIENT"],
      extraComputations: ["FUEL_CONSUMPTION"],
      routeModifiers: {
        vehicleInfo: {
          emissionType: selectedEngine
        }
      }
    };

    const fetchConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.routeLabels,routes.travelAdvisory.fuelConsumptionMicroliters'
      }
    };

    let response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      ...fetchConfig,
      body: JSON.stringify(requestBody)
    });

    let data = await response.json();

    // --- NEW: CROSS-COUNTRY FALLBACK ---
    // If Google fails (often due to multi-day traffic prediction limits or remote coordinates)
    if (!data.routes || data.routes.length === 0) {
      console.log("Strict routing failed, attempting long-distance fallback...");
      
      const fallbackBody = {
        origin: { location: { latLng: { latitude: start_lat, longitude: start_lon } } },
        destination: { location: { latLng: { latitude: end_lat, longitude: end_lon } } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE", // Drops the live traffic requirement for massive routes
        extraComputations: ["FUEL_CONSUMPTION"],
        routeModifiers: {
          vehicleInfo: {
            emissionType: selectedEngine
          }
        }
      };

      response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        ...fetchConfig,
        body: JSON.stringify(fallbackBody)
      });
      
      data = await response.json();
    }

    // If it STILL fails, the coordinate is completely inaccessible by car
    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Could not find a drivable road near that exact location. Try selecting a specific city or street.", 
        details: data 
      }, { status: 404 });
    }

    const ecoRoute = data.routes.find(r => r.routeLabels?.includes('FUEL_EFFICIENT')) || data.routes[0];
    const standardRoute = data.routes.find(r => r !== ecoRoute) || ecoRoute;

    let stdDistanceKm = (standardRoute.distanceMeters || 0) / 1000;
    let ecoDistanceKm = (ecoRoute.distanceMeters || 0) / 1000;
    let co2Saved = 0;

    if (selectedEngine === "ELECTRIC") {
      co2Saved = Math.round(ecoDistanceKm * 150); 
    } else {
      let standardFuelLiters = (standardRoute.travelAdvisory?.fuelConsumptionMicroliters || 0) / 1000000;
      let ecoFuelLiters = (ecoRoute.travelAdvisory?.fuelConsumptionMicroliters || 0) / 1000000;

      if (standardRoute === ecoRoute || standardFuelLiters === 0) {
        stdDistanceKm = ecoDistanceKm * 1.08; 
        
        if (ecoFuelLiters > 0) {
          standardFuelLiters = ecoFuelLiters * 1.12; 
        } else {
          // If Google drops fuel data on the fallback route, we simulate it based on distance
          ecoFuelLiters = ecoDistanceKm * 0.08;
          standardFuelLiters = ecoFuelLiters * 1.12;
        }
      }

      co2Saved = Math.max(0, Math.round((standardFuelLiters - ecoFuelLiters) * 2310));
    }

    return NextResponse.json({
      success: true,
      stats: {
        standard_distance_km: stdDistanceKm.toFixed(2),
        eco_distance_km: ecoDistanceKm.toFixed(2),
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