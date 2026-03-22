import { NextResponse } from 'next/server';

const API_KEY = process.env.API_KEY || "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";
const MODEL = "stepfun/step-3.5-flash:free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(request: Request) {
  const { messages } = await request.json();

  try {
    if (!API_KEY || API_KEY.startsWith('sk-or-v1-placeholder')) {
      return NextResponse.json({ error: "API Key is missing or invalid. Please set API_KEY in your .env.local file." }, { status: 400 });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://github.com/Sadeepa11/Ai--Code--Editor',
        'X-Title': 'MVS Code Editor'
      },
      body: JSON.stringify({ model: MODEL, messages })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ 
        error: data.error?.message || data.error || "AI API Error",
        details: data
      }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
