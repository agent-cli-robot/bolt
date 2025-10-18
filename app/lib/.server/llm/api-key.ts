import { env } from 'node:process';

export function getAPIKey() {
  return env.ANTHROPIC_API_KEY;
}
