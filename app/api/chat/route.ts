import { createGroq } from '@ai-sdk/groq';
import { generateText, convertToCoreMessages, CoreMessage } from 'ai';
// Allow 60 seconds for the AI to generate the full answer
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // HARDCODED KEY - Verified working
    const apiKey = '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';
    const groq = createGroq({ apiKey });
    const systemMessage: CoreMessage = {
      role: 'system',
      content: `You are ROGER, a Tactical Advisor.
[LIVE INTEL] ${context || 'No local data available.'} [INSTRUCTIONS] Use the [LIVE INTEL] above to answer user questions. Be concise and practical.`
    };

    // SWITCH TO generateText (Non-Streaming)
    // This creates a standard HTTP request that won't be blocked by firewalls or crash the parser
    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...convertToCoreMessages(messages)],
    });
    // Return simple JSON instead of a complex stream
    return Response.json({ content: result.text });
  } catch (error: any) {
    console.error("CRITICAL GROQ ERROR:", error);
    return Response.json({ error: error.message || "Unknown Server Error" }, { status: 500 });
  }
}
