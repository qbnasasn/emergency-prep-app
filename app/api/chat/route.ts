import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, CoreMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
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

    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...convertToCoreMessages(messages)],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Groq API Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to process chat' }), { status: 500 });
  }
}
