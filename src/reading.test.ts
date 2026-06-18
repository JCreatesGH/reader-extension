import { describe, it, expect } from "vitest";
import { countWords, readingTime, extractText, scoreBlock, bestBlockIndex, DEFAULT_WPM } from "./reading";

describe("countWords", () => {
  it("counts words ignoring extra whitespace", () => {
    expect(countWords("  hello   world  ")).toBe(2);
    expect(countWords("")).toBe(0);
  });
});

describe("readingTime", () => {
  it("rounds up to whole minutes, min 1", () => {
    const words = Array(DEFAULT_WPM + 10).fill("w").join(" ");
    expect(readingTime(words).minutes).toBe(1);
    expect(readingTime(Array(DEFAULT_WPM * 3).fill("w").join(" ")).minutes).toBe(3);
  });
  it("handles empty text", () => {
    expect(readingTime("").text).toBe("—");
  });
  it("respects custom wpm", () => {
    const t = Array(200).fill("w").join(" ");
    expect(readingTime(t, 100).minutes).toBe(2);
  });
});

describe("extractText", () => {
  it("strips scripts, styles and tags", () => {
    const html = "<style>a{}</style><p>Hello <b>world</b></p><script>x()</script>";
    expect(extractText(html)).toBe("Hello world");
  });
  it("decodes a couple of entities", () => {
    expect(extractText("<p>A&nbsp;&amp;&nbsp;B</p>")).toBe("A & B");
  });
  it("decodes named and numeric entities", () => {
    expect(extractText("<p>it&#39;s &mdash; &quot;ok&quot; &#x263A;</p>")).toBe('it\'s — "ok" ☺');
  });
  it("leaves unknown entities untouched", () => {
    expect(extractText("<p>Tom &fakeent; Jerry</p>")).toBe("Tom &fakeent; Jerry");
  });
});

describe("scoreBlock", () => {
  it("ignores tiny blocks", () => {
    expect(scoreBlock("short")).toBe(0);
  });
  it("penalizes high link density", () => {
    const text = "This is a reasonably long sentence about something. More here.";
    const clean = scoreBlock(text, 0);
    const linky = scoreBlock(text, Math.floor(text.length * 0.8));
    expect(clean).toBeGreaterThan(linky);
  });
  it("never returns a negative score when links exceed length", () => {
    expect(scoreBlock("This is a long enough sentence to score.", 9999)).toBeGreaterThanOrEqual(0);
  });
});

describe("bestBlockIndex", () => {
  it("picks the highest-scoring (article-like) block", () => {
    const blocks = [
      { text: "Home" },
      { text: "This is the real article body. It has several sentences. They carry meaning.", linkChars: 0 },
      { text: "nav links links links links links links links links", linkChars: 48 },
    ];
    expect(bestBlockIndex(blocks)).toBe(1);
  });
  it("returns -1 for no candidates", () => {
    expect(bestBlockIndex([])).toBe(-1);
  });
});
