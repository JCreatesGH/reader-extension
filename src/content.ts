// Content script: measure the page and (optionally) toggle a clean reader view.
import { extractText, readingTime, bestBlockIndex } from "./reading.js";

function candidateElements(): HTMLElement[] {
  const els = Array.from(
    document.querySelectorAll("article, main, .post, .content, #content")
  ) as HTMLElement[];
  return els.length ? els : [document.body];
}

function bestArticleElement(): HTMLElement {
  const cands = candidateElements();
  const idx = bestBlockIndex(cands.map((el) => ({
    text: el.innerText || "",
    linkChars: Array.from(el.querySelectorAll("a"))
      .reduce((n: number, a: any) => n + (a.innerText?.length || 0), 0),
  })));
  return cands[idx >= 0 ? idx : 0];
}

function mainArticleText(): string {
  const el = bestArticleElement();
  return el.innerText || extractText(el.innerHTML || "");
}

export function measure() {
  return readingTime(mainArticleText());
}

function setReaderMode(on: boolean): void {
  document.documentElement.classList.toggle("reader-mode", on);
  // Always clear, then mark the chosen block so reader.css reveals the right
  // element — even on sites whose article lives in a .post / #content div.
  document.querySelectorAll(".reader-content").forEach((e) => e.classList.remove("reader-content"));
  if (on) bestArticleElement().classList.add("reader-content");
}

const runtime = (globalThis as any).chrome?.runtime;
if (runtime) {
  runtime.onMessage.addListener((msg: any, _s: any, send: any) => {
    if (msg?.type === "MEASURE") send(measure());
    if (msg?.type === "READER") {
      const on = !document.documentElement.classList.contains("reader-mode");
      setReaderMode(on);
      send({ ok: true, reader: on });
    }
    return true;
  });
}
