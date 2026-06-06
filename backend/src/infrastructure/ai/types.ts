export interface EnrichInput {
  title: string | null;
  content: string | null;
}

export interface AiSummary {
  summary: string;
  likelyAiGenerated: boolean;
  aiConfidence: number; // 0..1
  producedBy: string; // e.g. "gemini:gemini-2.5-flash-lite" or "heuristic"
}

/** Produces a summary + AI-generated assessment for a content item. */
export interface AiEnricher {
  summarize(input: EnrichInput): Promise<AiSummary>;
}
