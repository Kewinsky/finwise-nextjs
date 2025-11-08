/**
 * Check if OpenAI is configured and enabled
 * This is a utility function that can be used in both client and server code
 *
 * Returns true only if:
 * - ENABLE_OPENAI is set to "true"
 * - OPENAI_API_KEY is set and not a placeholder
 */
export function isOpenAIConfigured(): boolean {
  const enableOpenAI = process.env.ENABLE_OPENAI;
  const apiKey = process.env.OPENAI_API_KEY;

  // Check if OpenAI is explicitly enabled
  const isEnabled = enableOpenAI === 'true' || enableOpenAI === '1';

  // Check if API key is valid (not empty and not placeholder)
  const hasValidApiKey = !!(
    apiKey &&
    apiKey !== 'sk-your_openai_api_key_here' &&
    apiKey.trim() !== ''
  );

  return isEnabled && hasValidApiKey;
}
