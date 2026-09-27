import { NextResponse } from 'next/server';

// Helper function to handle the actual API request
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
    const { origin, destination, engineType, co2Saved, distance } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      console.log("❌ ERROR: GEMINI_API_KEY is missing from environment variables!");
      return NextResponse.json({ success: false, message: "AI API Key missing." }, { status: 500 });
    }

    const prompt = `
      You are the 'Green Route AI Copilot', an expert in eco-friendly driving. 
      The user is driving a ${engineType} vehicle from ${origin} to ${destination}. 
      The trip is ${distance} km long, and they are saving ${co2Saved} grams of CO2 by taking the eco-route.
      
      Provide a highly specific, 2-sentence driving tip based on their vehicle type and the likely geography of this route. 
      Also, creatively contextualize their CO2 savings (e.g., "That's enough energy to..."). 
      Keep the tone encouraging, modern, and concise. Do not use hashtags.
    `;

    let aiInsight;

    try {
      // 1. PRIMARY ATTEMPT: Try the newest model (3.8-flash)
      console.log("Attempting Gemini 3.8 Flash...");
      aiInsight = await fetchFromGemini('gemini-3.8-flash', apiKey, prompt);
      
    } catch (error38) {
      console.warn("⚠️ Gemini 3.8 failed (likely high demand). Falling back to 3.5:", error38.message);
      
      try {
        // 2. FALLBACK ATTEMPT: Try the highly stable production model (3.5-flash)
        console.log("Attempting Gemini 3.5 Flash (Fallback)...");
        aiInsight = await fetchFromGemini('gemini-3.5-flash', apiKey, prompt);
        
      } catch (error35) {
        // 3. COMPLETE FAILURE: Both Google models are down
        console.error("❌ Both Gemini models failed:", error35.message);
        return NextResponse.json({ success: false, error: "AI temporarily unavailable." }, { status: 500 });
      }
    }

    // If either attempt succeeded, return the text to the frontend
    return NextResponse.json({ success: true, insight: aiInsight });

  } catch (error) {
    console.error("❌ SERVER FETCH ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI insight." }, { status: 500 });
  }
}