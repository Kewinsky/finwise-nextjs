import { describe, it, expect, vi } from 'vitest';
import { callOpenAI } from '@/lib/openai/client';

// Mock configuration so that callOpenAI believes OpenAI is enabled
vi.mock('@/lib/openai/config', () => ({
  isOpenAIConfigured: () => true,
}));

vi.mock('openai', () => {
  const createMock = vi.fn();

  class OpenAI {
    chat = {
      completions: {
        create: createMock,
      },
    };

    constructor() {
      // nothing else needed – callOpenAI only uses chat.completions.create
    }
  }

  return {
    default: OpenAI,
    __mock: {
      createMock,
    },
  };
});

describe('OpenAI service integration', () => {
  it('handles API errors gracefully (rate limit)', async () => {
    const { __mock } = await import('openai');

    __mock.createMock.mockRejectedValueOnce(new Error('Request failed due to rate limit'));

    // Provide a fake API key so that getOpenAIClient does not throw before
    // our mocked client is used.
    process.env.OPENAI_API_KEY = 'test-api-key';

    const result = await callOpenAI('Test prompt');

    expect(result.error).toBe('Rate limit exceeded');
    expect(result.content).toMatch(/temporarily unavailable due to rate limits/i);
    expect(result.tokensUsed).toBe(0);
  });
});
