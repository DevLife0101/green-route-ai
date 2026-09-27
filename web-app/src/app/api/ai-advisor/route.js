import { NextResponse } from 'next/server';

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // NEW: Check if Google Gemini returned an error (like an invalid key)
    if (!response.ok || data.error) {
      console.error("❌ GEMINI API REJECTED THE REQUEST:", JSON.stringify(data, null, 2));
      return NextResponse.json({ success: false, error: data.error?.message || "Gemini API error" }, { status: 500 });
    }

    // Safely extract the text
    if (data.candidates && data.candidates.length > 0) {
      const aiInsight = data.candidates[0].content.parts[0].text;
      return NextResponse.json({ success: true, insight: aiInsight });
    } else {
      console.error("❌ GEMINI SENT EMPTY DATA:", JSON.stringify(data, null, 2));
      return NextResponse.json({ success: false, error: "No text returned" }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ SERVER FETCH ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI insight." }, { status: 500 });
  }
}