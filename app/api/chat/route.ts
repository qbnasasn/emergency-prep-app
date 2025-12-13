import { createGroq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, CoreMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
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
    model: groq('llama3-8b-8192'),
    messages: [systemMessage, ...convertToCoreMessages(messages)],
  });

  return result.toDataStreamResponse();
}
