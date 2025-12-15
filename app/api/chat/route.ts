import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, CoreMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log("--- DEBUG: Starting Chat Request ---");
    const { messages, context } = await req.json();

    // HARDCODED KEY TEST - DO NOT KEEP IN PRODUCTION
    const apiKey = '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';
    console.log("Using Hardcoded Key:", apiKey.slice(0, 10) + "...");

    const groq = createGroq({
      apiKey: apiKey,
    });

    const systemMessage: CoreMessage = {
      role: 'system',
      content: `You are ROGER, a Tactical Advisor.

[LIVE INTEL]
${context || 'No local data available.'}

[INSTRUCTIONS]
Use the [LIVE INTEL] above to answer the user's questions about their inventory, kits, and plans.
Be concise, practical, and focused on preparedness.`
    };

    console.log("Sending request to Groq...");
    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...convertToCoreMessages(messages)],
    });

    console.log("Groq stream started successfully.");

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("CRITICAL GROQ ERROR:", error);
    return new Response(JSON.stringify({ error: 'Server Error', details: error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
