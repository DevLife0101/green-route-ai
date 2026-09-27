import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { origin, destination, engineType, co2Saved, distance } = await req.json();

    // Example using Google Gemini API (You can easily swap this for OpenAI)
    const apiKey = process.env.GEMINI_API_KEY; // Add this to your .env file
    
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "AI API Key missing." }, { status: 500 });
    }

    // The hidden prompt that tells the AI how to behave
    const prompt = `
      You are the 'Green Route AI Copilot', an expert in eco-friendly driving. 
      The user is driving a ${engineType} vehicle from ${origin} to ${destination}. 
      The trip is ${distance} km long, and they are saving ${co2Saved} grams of CO2 by taking the eco-route.
      
      Provide a highly specific, 2-sentence driving tip based on their vehicle type and the likely geography of this route. 
      Also, creatively contextualize their CO2 savings (e.g., "That's enough energy to..."). 
      Keep the tone encouraging, modern, and concise. Do not use hashtags.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const aiInsight = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ success: true, insight: aiInsight });

  } catch (error) {
    console.error("AI Advisor Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI insight." }, { status: 500 });
  }
}