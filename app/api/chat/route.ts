import { createGroq } from '@ai-sdk/groq';
import { generateText, CoreMessage } from 'ai';

// Allow 60 seconds for the AI to generate the full answer
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // SAFETY CHECK: Ensure we have an array
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context || '';

    console.log("DEBUG: Processing", rawMessages.length, "messages");

    // RESTORED: Use Environment Variable for Production Security
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("CRITICAL: Missing GROQ_API_KEY in Vercel Environment Variables");
        throw new Error("Server Configuration Error: Missing API Key");
    }

    const groq = createGroq({ apiKey });

    // 1. Manually construct the System Message
    const systemMessage: CoreMessage = {
      role: 'system',
      content: `You are ROGER, a Tactical Advisor.
[LIVE INTEL]
${context || 'No local data available.'}

[INSTRUCTIONS]
Use the [LIVE INTEL] above to answer user questions. Be concise and practical.`
    };

    // 2. Manually Sanitize Messages (Fixes the "map" crash and ensures valid structure)
    // We explicitly create new objects to strip out any weird data from the client
    const coreMessages: CoreMessage[] = rawMessages.map((m: any) => ({
      role: (m.role === 'user' || m.role === 'assistant' || m.role === 'system') ? m.role : 'user',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content || '')
    }));

    // 3. Generate Text (Standard HTTP Mode)
    // This uses a single request/response to bypass firewall/proxy issues (400 errors)
    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...coreMessages],
    });

    // Return simple JSON response
    return Response.json({ content: result.text });

  } catch (error: any) {
    console.error("CRITICAL GROQ ERROR:", error);
    return Response.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
