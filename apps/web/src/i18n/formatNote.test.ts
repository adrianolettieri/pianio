import { describe, expect, it } from "vitest";
import { formatNote, formatNoteName } from "./formatNote";

describe("UI note formatting", () => {
  it("formats middle C and both ends of the MIDI range", () => {
    expect(formatNote(60, "en")).toBe("C4");
    expect(formatNote(60, "it")).toBe("Do4");
    expect(formatNote(0, "en")).toBe("C-1");
    expect(formatNote(0, "it")).toBe("Do-1");
    expect(formatNote(127, "en")).toBe("G9");
    expect(formatNote(127, "it")).toBe("Sol9");
  });

  it("keeps the existing sharp spellings without enharmonic conversion", () => {
    expect(formatNote(61, "en")).toBe("C#4");
    expect(formatNote(61, "it")).toBe("Do#4");
    expect(formatNoteName(66, "it")).toBe("Fa#");
  });

  it("reports invalid values without treating them as MIDI notes", () => {
    expect(formatNote(-1, "it")).toBe("Nota -1");
    expect(formatNote(128, "en")).toBe("Note 128");
    expect(formatNote(60.5, "en")).toBe("Note 60.5");
    expect(formatNote(Number.NaN, "it")).toBe("Nota NaN");
  });
});
