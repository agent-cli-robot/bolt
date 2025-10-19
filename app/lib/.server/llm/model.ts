import { createAnthropic } from '@ai-sdk/anthropic';
import { env } from 'node:process';

export function getAnthropicModel(apiKey: string) {
  const anthropic = createAnthropic({
    apiKey,
  });

  const model = env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
  return anthropic(model);
}
