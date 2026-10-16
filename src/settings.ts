export interface NoticeFilterSettings {
  enabled: boolean;
  keywords: string[];
}

export const DEFAULT_SETTINGS: Readonly<NoticeFilterSettings> = Object.freeze({
  enabled: true,
  keywords: [],
});

export function normalizeKeyword(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeSettings(data: unknown): NoticeFilterSettings {
  const candidate = isRecord(data) ? data : {};
  const rawKeywords = Array.isArray(candidate.keywords)
    ? candidate.keywords
    : DEFAULT_SETTINGS.keywords;
  const seen = new Set<string>();
  const keywords: string[] = [];

  for (const rawKeyword of rawKeywords) {
    const keyword = normalizeKeyword(rawKeyword);
    const identity = keyword.toLocaleLowerCase();
    if (!keyword || seen.has(identity)) continue;
    seen.add(identity);
    keywords.push(keyword);
  }

  return {
    enabled:
      typeof candidate.enabled === "boolean"
        ? candidate.enabled
        : DEFAULT_SETTINGS.enabled,
    keywords,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
