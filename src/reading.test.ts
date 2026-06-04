import { describe, it, expect } from "vitest";
import { countWords, readingTime, extractText, scoreBlock, DEFAULT_WPM } from "./reading";

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
});
