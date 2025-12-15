import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, CoreMessage } from 'ai';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // HARDCODED KEY - Verified working via PowerShell
    const apiKey = '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';
    const groq = createGroq({ apiKey });

    const systemMessage: CoreMessage = {
      role: 'system',
      content: `You are ROGER, a Tactical Advisor.
[LIVE INTEL] ${context || 'No local data available.'}

[INSTRUCTIONS] Use the [LIVE INTEL] above to answer the user's questions about their inventory, kits, and plans. Be concise, practical, and focused on preparedness.`
    };

    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...convertToCoreMessages(messages)],
    });
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("CRITICAL GROQ ERROR:", error);
    // Return a text response so the client doesn't crash trying to parse JSON
    return new Response("Service Error: " + (error.message || "Unknown"), { status: 500 });
  }
}
