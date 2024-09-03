export interface LLMSettings {
    provider: 'Anthropic' | 'OpenAI';
    apiKey: string;
    model: string;
  }