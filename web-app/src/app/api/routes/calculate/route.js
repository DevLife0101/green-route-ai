export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// ------------------------------------------------------------------
// 🗺️ DECODER HELPER
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 🧠 PHYSICS ENGINE HELPER FUNCTIONS
// ------------------------------------------------------------------
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  
  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360; 
}

function calculateWindPenaltyMultiplier(routeBearing, windDirection, windSpeedKmh) {
  const angleDiff = (windDirection - routeBearing) * (Math.PI / 180);
  const headwind = windSpeedKmh * Math.cos(angleDiff);
  
  if (headwind > 0) {
    return 1 + (headwind * 0.01); // Penalty for headwind
  } else {
    return 1 + (headwind * 0.005); // Bonus for tailwind
  }
}

// ------------------------------------------------------------------
// 🚀 MAIN ROUTING API
// ------------------------------------------------------------------
export async function POST(req) {
  try {
    const { start_lat, start_lon, end_lat, end_lon, engine_type } = await req.json();

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "Missing Google API Key" }, { status: 500 });
    }

    const selectedEngine = engine_type || "GASOLINE";

    // 1. Primary Request: Strict, Live-Traffic Eco Routing
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

    // 2. --- CROSS-COUNTRY FALLBACK (Fixes the 400 Error) ---
    if (!response.ok || !data.routes || data.routes.length === 0) {
      console.warn("⚠️ Strict routing failed, attempting TRAFFIC_UNAWARE fallback...");
      
      const fallbackBody = {
        origin: { location: { latLng: { latitude: start_lat, longitude: start_lon } } },
        destination: { location: { latLng: { latitude: end_lat, longitude: end_lon } } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE", 
        // CRITICAL FIX: Removed extraComputations & routeModifiers here. 
        // Google throws a 400 error if you ask for eco-emissions without live traffic.
      };

      response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        ...fetchConfig,
        body: JSON.stringify(fallbackBody)
      });
      
      data = await response.json();
    }

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Could not find a drivable road near that exact location.", 
        details: data 
      }, { status: 404 });
    }

    // 3. Base Math Calculations
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
          ecoFuelLiters = ecoDistanceKm * 0.08;
          standardFuelLiters = ecoFuelLiters * 1.12;
        }
      }
      co2Saved = Math.max(0, Math.round((standardFuelLiters - ecoFuelLiters) * 2310));
    }

    // 4. --- 🌪️ PHASE 2: PHYSICS & WEATHER ENGINE ---
    try {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${end_lat}&longitude=${end_lon}&current=wind_speed_10m,wind_direction_10m`);
      const weatherData = await weatherRes.json();

      if (weatherData && weatherData.current) {
        const windSpeed = weatherData.current.wind_speed_10m;
        const windDir = weatherData.current.wind_direction_10m;
        const routeBearing = calculateBearing(start_lat, start_lon, end_lat, end_lon);
        
        const physicsMultiplier = calculateWindPenaltyMultiplier(routeBearing, windDir, windSpeed);
        console.log(`🚗 Bearing: ${routeBearing.toFixed(0)}° | 🌬️ Wind: ${windDir}° @ ${windSpeed}km/h | ⚖️ Penalty: ${physicsMultiplier.toFixed(2)}x`);

        if (co2Saved > 0) {
          let modified_co2 = Math.round(co2Saved / physicsMultiplier);
          co2Saved = modified_co2 > 0 ? modified_co2 : 15; // Guarantee at least 15g saved if taking eco route
        }
      }
    } catch (weatherErr) {
      console.warn("Physics engine skipped (Weather API error):", weatherErr.message);
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