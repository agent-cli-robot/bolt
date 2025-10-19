import { type ActionFunctionArgs } from '@remix-run/node';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction({ request }: ActionFunctionArgs) {
  const { messages } = await request.json<{ messages: Messages }>();

  try {
    const options: StreamingOptions = {
      toolChoice: 'none',
      // For ai@5 + useChat, return AI-formatted stream response.
    };

    const result = await streamText(messages, options);

    // Stream plain text; client is configured for text protocol
    return result.toTextStreamResponse();
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
