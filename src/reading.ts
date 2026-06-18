// Pure helpers for reading-time + readability. No DOM/browser APIs, so testable.
export const DEFAULT_WPM = 220;

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export interface ReadingStats {
  words: number;
  minutes: number;       // rounded up, min 1 if any words
  text: string;          // "5 min read"
}

export function readingTime(text: string, wpm: number = DEFAULT_WPM): ReadingStats {
  const words = countWords(text);
  const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / wpm));
  return { words, minutes, text: minutes === 0 ? "—" : `${minutes} min read` };
}

const NAMED_ENTITIES: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&apos;": "'", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…",
  "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-z]+;/gi, (m) => NAMED_ENTITIES[m.toLowerCase()] ?? m);
}

// Strip markup-ish noise and collapse whitespace for a clean word count.
export function extractText(html: string): string {
  const noScript = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const noTags = noScript.replace(/<[^>]+>/g, " ");
  return decodeEntities(noTags).replace(/\s+/g, " ").trim();
}

// Score a block of text the way a reader-mode extractor would: longer,
// sentence-rich blocks with low link density rank higher.
export function scoreBlock(text: string, linkChars = 0): number {
  const len = text.length;
  if (len < 25) return 0;
  const sentences = (text.match(/[.!?](\s|$)/g) || []).length;
  const linkDensity = len ? Math.min(1, linkChars / len) : 0;   // clamp so score never goes negative
  return len * (1 - linkDensity) + sentences * 25;
}

export interface Block {
  text: string;
  linkChars?: number;
}

/** Index of the highest-scoring block (the likely article), or -1 if none. */
export function bestBlockIndex(blocks: Block[]): number {
  let best = -1;
  let bestScore = -1;
  blocks.forEach((b, i) => {
    const s = scoreBlock(b.text, b.linkChars ?? 0);
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  });
  return best;
}
