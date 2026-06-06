import { env } from '../../core/config/env.config.js';
import type { AiEnricher, AiSummary, EnrichInput } from './types.js';

// Cheap-first fallback chain, ending in a small Gemma model. The adapter advances to the
// next model on retryable errors (quota / not-found / forbidden). NOTE: a project-wide
// spending cap (429 RESOURCE_EXHAUSTED) affects every model, so the chain only helps with
// per-model rate limits — a project cap must be lifted at ai.studio/spend.
const DEFAULT_CHAIN = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemma-4-26b-a4b-it'];

function modelChain(): string[] {
  const configured = env.GEMINI_MODEL;
  return [...new Set(configured ? [configured, ...DEFAULT_CHAIN] : DEFAULT_CHAIN)];
}

function buildPrompt({ title, content }: EnrichInput): string {
  return [
    'You analyze a news article or code item. Respond with ONLY a strict JSON object',
    '(no markdown fences) with keys:',
    '"summary": a neutral summary under 80 words;',
    '"likelyAiGenerated": boolean — does the text read as AI-generated;',
    '"aiConfidence": a number between 0 and 1.',
    '',
    `Title: ${title ?? ''}`,
    `Content: ${(content ?? '').slice(0, 4000)}`,
  ].join('\n');
}

function parseSummary(text: string, producedBy: string): AiSummary {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const json = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const obj = JSON.parse(json) as Record<string, unknown>;
  return {
    summary: String(obj.summary ?? '').slice(0, 2000),
    likelyAiGenerated: Boolean(obj.likelyAiGenerated),
    aiConfidence: Number(obj.aiConfidence) || 0,
    producedBy,
  };
}

class RetryableModelError extends Error {}

async function callModel(model: string, prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    },
  );

  // Quota / availability problems -> try the next model in the chain.
  if (res.status === 429 || res.status === 404 || res.status === 403) {
    throw new RetryableModelError(`model ${model}: HTTP ${res.status}`);
  }
  if (!res.ok) throw new Error(`Gemini ${model}: HTTP ${res.status}`);

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new RetryableModelError(`model ${model}: empty response`);
  return text;
}

export const geminiEnricher: AiEnricher = {
  async summarize(input: EnrichInput): Promise<AiSummary> {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const prompt = buildPrompt(input);
    let lastError: unknown;
    for (const model of modelChain()) {
      try {
        return parseSummary(await callModel(model, prompt, apiKey), `gemini:${model}`);
      } catch (err) {
        lastError = err;
        if (!(err instanceof RetryableModelError)) throw err; // genuine error -> stop
      }
    }
    throw lastError ?? new Error('all Gemini models failed');
  },
};
