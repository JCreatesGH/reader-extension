// Content script: measure the page and (optionally) toggle a clean reader view.
import { extractText, readingTime, scoreBlock } from "./reading.js";

function mainArticleText(): string {
  const candidates = Array.from(
    document.querySelectorAll("article, main, .post, .content, #content")
  ) as HTMLElement[];
  if (candidates.length === 0) candidates.push(document.body);
  let best: HTMLElement = candidates[0];
  let bestScore = -1;
  for (const el of candidates) {
    const text = el.innerText || "";
    const linkChars = Array.from(el.querySelectorAll("a"))
      .reduce((n: number, a: any) => n + (a.innerText?.length || 0), 0);
    const s = scoreBlock(text, linkChars);
    if (s > bestScore) { bestScore = s; best = el; }
  }
  return best.innerText || extractText(best.innerHTML || "");
}

export function measure() {
  return readingTime(mainArticleText());
}

const runtime = (globalThis as any).chrome?.runtime;
if (runtime) {
  runtime.onMessage.addListener((msg: any, _s: any, send: any) => {
    if (msg?.type === "MEASURE") send(measure());
    if (msg?.type === "READER") { document.documentElement.classList.toggle("reader-mode"); send({ ok: true }); }
    return true;
  });
}
