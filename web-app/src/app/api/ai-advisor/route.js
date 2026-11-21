import { NextResponse } from 'next/server';

// Allow up to 60s on Vercel so fallback attempts don't trigger a 504 timeout
export const maxDuration = 60;

// Helper function to handle the Gemini API request with a strict timeout
async function fetchFromGemini(modelName, apiKey, prompt, timeoutMs = 6000) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal: AbortSignal.timeout(timeoutMs)
    }
  );

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

    // --- FETCH LIVE WEATHER FROM OPEN-METEO (3s timeout) ---
    let weatherContext = "Clear conditions.";
    try {
      if (end_lat && end_lon) {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${end_lat}&longitude=${end_lon}&current=temperature_2m,wind_speed_10m,precipitation`,
          { signal: AbortSignal.timeout(3000) }
        );

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          if (weatherData?.current) {
            const temp = weatherData.current.temperature_2m;
            const wind = weatherData.current.wind_speed_10m;
            const rain = weatherData.current.precipitation;

            weatherContext = `${temp}°C, Wind Speed: ${wind} km/h, Precipitation: ${rain}mm.`;
            console.log(`Live Weather at ${destination}:`, weatherContext);
          }
        }
      }
    } catch (weatherError) {
      console.warn("⚠️ Could not fetch live weather, falling back to default:", weatherError.message);
    }

    // --- AI PROMPT WITH WEATHER INJECTION ---
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
      // 1. PRIMARY ATTEMPT: Stable model first (5s timeout)
      aiInsight = await fetchFromGemini('gemini-3.5-flash', apiKey, prompt, 5000);
    } catch (error35) {
      console.warn("⚠️ Gemini 3.5 failed. Falling back to 3.8:", error35.message);
      try {
        // 2. FALLBACK ATTEMPT: Secondary model (8s timeout)
        aiInsight = await fetchFromGemini('gemini-3.8-flash', apiKey, prompt, 8000);
      } catch (error38) {
        console.error("❌ Both Gemini models failed:", error38.message);
        return NextResponse.json({ success: false, error: "AI temporarily unavailable." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, insight: aiInsight });

  } catch (error) {
    console.error("❌ SERVER FETCH ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI insight." }, { status: 500 });
  }
}