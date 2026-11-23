import { NextResponse } from 'next/server';

// Helper function with a strict timeout
async function fetchFromGemini(modelName, apiKey, prompt, timeoutMs = 10000) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(timeoutMs), // Prevents 300s hangs
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
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

    // --- FETCH LIVE WEATHER (with 4s timeout) ---
    let weatherContext = "Clear conditions.";
    try {
      if (end_lat && end_lon) {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${end_lat}&longitude=${end_lon}&current=temperature_2m,wind_speed_10m,precipitation`,
          { signal: AbortSignal.timeout(4000) }
        );
        const weatherData = await weatherRes.json();

        if (weatherData?.current) {
          const { temperature_2m: temp, wind_speed_10m: wind, precipitation: rain } = weatherData.current;
          weatherContext = `${temp}°C, Wind Speed: ${wind} km/h, Precipitation: ${rain}mm.`;
        }
      }
    } catch (weatherError) {
      console.warn("⚠️ Weather fetch failed/timed out, using default:", weatherError.message);
    }

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
      aiInsight = await fetchFromGemini('gemini-3.8-flash', apiKey, prompt, 10000);
    } catch (error38) {
      console.warn("⚠️ Gemini 3.8 failed/timed out. Falling back to 3.5:", error38.message);
      try {
        aiInsight = await fetchFromGemini('gemini-3.5-flash', apiKey, prompt, 10000);
      } catch (error35) {
        console.error("❌ Both Gemini models failed:", error35.message);
        // Return a clean JSON fallback so the UI never breaks
        return NextResponse.json(
          {
            success: true,
            insight: `Smooth acceleration and steady highway speeds will help maximize your ${co2Saved}g CO2 savings on this ${distance} km trip. Keep an eye on local conditions (${weatherContext}) and anticipate stops early to conserve energy.`
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({ success: true, insight: aiInsight });

  } catch (error) {
    console.error("❌ SERVER FETCH ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI insight." }, { status: 500 });
  }
}