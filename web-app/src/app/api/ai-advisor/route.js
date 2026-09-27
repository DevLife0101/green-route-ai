import { NextResponse } from 'next/server';

// Helper function to handle the Gemini API request
async function fetchFromGemini(modelName, apiKey, prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `API Error: ${response.status}`);
  }

  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("No text returned from Gemini");
  }
}

export async function POST(req) {
  try {
    const { origin, destination, engineType, co2Saved, distance, end_lat, end_lon } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "AI API Key missing." }, { status: 500 });
    }

    // --- NEW: FETCH LIVE WEATHER FROM OPEN-METEO ---
    let weatherContext = "Clear conditions.";
    try {
      if (end_lat && end_lon) {
        // Fetch temperature, wind speed, and precipitation. No API key needed!
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${end_lat}&longitude=${end_lon}&current=temperature_2m,wind_speed_10m,precipitation`);
        const weatherData = await weatherRes.json();
        
        if (weatherData && weatherData.current) {
          const temp = weatherData.current.temperature_2m;
          const wind = weatherData.current.wind_speed_10m;
          const rain = weatherData.current.precipitation;
          
          weatherContext = `${temp}°C, Wind Speed: ${wind} km/h, Precipitation: ${rain}mm.`;
          console.log(`Live Weather at ${destination}:`, weatherContext);
        }
      }
    } catch (weatherError) {
      console.warn("⚠️ Could not fetch live weather, falling back to default.", weatherError.message);
    }

    // --- UPDATED AI PROMPT WITH WEATHER INJECTION ---
    const prompt = `
      You are the 'Green Route AI Copilot', an expert in eco-friendly driving and physics. 
      The user is driving a ${engineType} vehicle from ${origin} to ${destination} (${distance} km).
      They are saving ${co2Saved} grams of CO2 by taking the eco-route.
      
      LIVE WEATHER DATA AT DESTINATION: ${weatherContext}

      Provide a highly specific, 2-sentence driving tip. 
      CRITICAL INSTRUCTION: You MUST factor the live weather into your advice. 
      (e.g., If it's cold, mention EV battery drain. If wind speed is high, mention aerodynamic drag and keeping speeds lower. If raining, mention smooth braking).
      Also briefly contextualize their CO2 savings. Keep the tone encouraging, modern, and concise. No hashtags.
    `;

    let aiInsight;

    try {
      // 1. PRIMARY ATTEMPT: Try the newest model
      aiInsight = await fetchFromGemini('gemini-3.8-flash', apiKey, prompt);
    } catch (error38) {
      console.warn("⚠️ Gemini 3.8 failed. Falling back to 3.5:", error38.message);
      try {
        // 2. FALLBACK ATTEMPT: Try the stable model
        aiInsight = await fetchFromGemini('gemini-3.5-flash', apiKey, prompt);
      } catch (error35) {
        return NextResponse.json({ success: false, error: "AI temporarily unavailable." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, insight: aiInsight });

  } catch (error) {
    console.error("❌ SERVER FETCH ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI insight." }, { status: 500 });
  }
}