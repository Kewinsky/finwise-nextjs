/**
 * Check if OpenAI is configured
 * This is a utility function that can be used in both client and server code
 */
export function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!(apiKey && apiKey !== 'sk-your_openai_api_key_here');
}
