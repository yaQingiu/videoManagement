export interface DeepSeekChoice {
  index: number;
  message: {
    role: 'assistant' | 'user' | 'system';
    content: string;
  };
  logprobs: any;
  finish_reason: string;
}

export interface DeepSeekUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens: number;
  };
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage: DeepSeekUsage;
  system_fingerprint?: string;
}