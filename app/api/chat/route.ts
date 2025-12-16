import { createGroq } from '@ai-sdk/groq';
import { generateText, convertToCoreMessages, CoreMessage } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // SAFETY CHECK: Ensure messages is always an array
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context || '';

    console.log("DEBUG: Processing chat with", messages.length, "messages");

    // HARDCODED KEY - Validated
    const apiKey = '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';
    const groq = createGroq({ apiKey });

    const systemMessage: CoreMessage = {
      role: 'system',
      content: `You are ROGER, a Tactical Advisor.
[LIVE INTEL]
${context || 'No local data available.'}

[INSTRUCTIONS]
Use the [LIVE INTEL] above to answer user questions. Be concise and practical.`
    };

    // USE generateText (Stable, Non-Streaming)
    // This prevents 400 Bad Request errors caused by firewalls blocking streams
    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      messages: [systemMessage, ...convertToCoreMessages(messages)],
    });

    // Return simple JSON
    return Response.json({ content: result.text });

  } catch (error: any) {
    console.error("CRITICAL GROQ ERROR:", error);
    return Response.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
