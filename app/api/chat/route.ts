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

    // HARDCODED KEY - Verified working via PowerShell
    const apiKey = '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';
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

    // 2. Manually Sanitize Messages (Fixes the "map" crash)
    // We explicitly create new objects to strip out any weird data from the client
    const coreMessages: CoreMessage[] = rawMessages.map((m: any) => ({
      role: (m.role === 'user' || m.role === 'assistant' || m.role === 'system') ? m.role : 'user',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content || '')
    }));

    // 3. Generate Text (Standard HTTP Mode)
    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...coreMessages],
    });

    // Return simple JSON
    return Response.json({ content: result.text });

  } catch (error: any) {
    console.error("CRITICAL GROQ ERROR:", error);
    return Response.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
