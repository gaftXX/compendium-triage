import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeRequest {
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeResponse {
  content: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

function readApiKeyFromEnv(): string | undefined {
  try {
    // @ts-ignore - import.meta.env may not exist in Node context
    const env = (import.meta as any)?.env;
    if (env) {
      // Check both possible variable names
      return env.VITE_CLAUDE_API_KEY || env.VITE_ANTHROPIC_API_KEY;
    }
  } catch (_) {
    // ignore
  }

  if (typeof process !== 'undefined' && process.env) {
    // Check both possible variable names
    return process.env.VITE_CLAUDE_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  }

  return undefined;
}

function getAnthropicClient(explicitApiKey?: string): Anthropic {
  const apiKey = explicitApiKey || readApiKeyFromEnv();
  if (!apiKey) {
    throw new Error('Claude API key not found. Provide apiKey or set VITE_CLAUDE_API_KEY or VITE_ANTHROPIC_API_KEY.');
  }
  return new Anthropic({ apiKey });
}

export async function sendMessage(
  request: ClaudeRequest,
  options?: { apiKey?: string; model?: string }
): Promise<ClaudeResponse> {
  const anthropic = getAnthropicClient(options?.apiKey);
  const model = options?.model || 'claude-sonnet-4-20250514';

  const messages = [
    ...(request.conversationHistory || []),
    { role: 'user' as const, content: request.userMessage },
  ];

  const response = await anthropic.messages.create({
    model,
    max_tokens: request.maxTokens ?? 4096,
    temperature: request.temperature ?? 1.0,
    system: request.systemPrompt,
    messages,
  });

  const text = response.content[0]?.type === 'text' ? (response.content[0] as any).text : '';

  return {
    content: text,
    stopReason: (response as any).stop_reason || 'end_turn',
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

export async function streamMessage(
  request: ClaudeRequest,
  onChunk: (text: string) => void,
  options?: { apiKey?: string; model?: string }
): Promise<ClaudeResponse> {
  const anthropic = getAnthropicClient(options?.apiKey);
  const model = options?.model || 'claude-sonnet-4-20250514';

  const messages = [
    ...(request.conversationHistory || []),
    { role: 'user' as const, content: request.userMessage },
  ];

  const stream = await anthropic.messages.create({
    model,
    max_tokens: request.maxTokens ?? 4096,
    temperature: request.temperature ?? 1.0,
    system: request.systemPrompt,
    messages,
    stream: true,
  });

  let fullText = '';
  let usage = { inputTokens: 0, outputTokens: 0 };

  for await (const event of stream as any) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta;
      if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
        fullText += delta.text;
        onChunk(delta.text);
      }
    }
    if (event.type === 'message_delta') {
      usage.outputTokens = event.usage?.output_tokens || usage.outputTokens;
    }
    if (event.type === 'message_start') {
      usage.inputTokens = event.message?.usage?.input_tokens || usage.inputTokens;
    }
  }

  return { content: fullText, stopReason: 'end_turn', usage };
}


