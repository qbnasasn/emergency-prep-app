import { createGroq } from '@ai-sdk/groq';
import { generateText, convertToCoreMessages, CoreMessage } from 'ai';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // SAFETY CHECK: Ensure messages is always an array
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context || '';
    console.log("DEBUG: Received", messages.length, "messages");

    // HARDCODED KEY - Verified working
    const apiKey = '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';
    const groq = createGroq({ apiKey });
    const systemMessage: CoreMessage = {
      role: 'system',
      content: `You are ROGER, a Tactical Advisor.
[LIVE INTEL] ${context || 'No local data available.'} [INSTRUCTIONS] Use the [LIVE INTEL] above to answer user questions. Be concise.`
    };

    // Use generateText (Stable, Non-Streaming)
    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      // Convert messages, but handle empty list safely
      messages: [systemMessage, ...convertToCoreMessages(messages)],
    });
    return Response.json({ content: result.text });
  } catch (error: any) {
    console.error("CRITICAL GROQ ERROR:", error);
    return Response.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
