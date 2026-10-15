import { afterEach, describe, expect, it, vi } from "vitest";
import { importProgress, type ProgressExport } from "./progress";

describe("structured progress import", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns a coded JSON parse failure", () => {
    expect(importProgress("{" )).toMatchObject({ outcome: "failure", code: "progress.import.invalid-json", ok: false });
  });

  it("returns a coded unsupported format failure", () => {
    expect(importProgress(JSON.stringify({ version: 2 }))).toMatchObject({ outcome: "failure", code: "progress.import.unsupported-format", ok: false });
  });

  it("imports version 1 data and reports the completed exercise count", () => {
    const legacyExport: ProgressExport = {
      version: 1,
      exportedAt: "2025-01-01T00:00:00.000Z",
      completed: ["course/a", "course/b"],
      stars: { "course/a": 3 },
      streakDates: ["2025-01-01"],
    };
    expect(importProgress(JSON.stringify(legacyExport))).toMatchObject({
      outcome: "success", code: "progress.import.success", params: { importedCount: 2 }, ok: true,
    });
    expect(localStorage.getItem("pianio:completed")).toBe(JSON.stringify(legacyExport.completed));
    expect(localStorage.getItem("pianio:stars")).toBe(JSON.stringify(legacyExport.stars));
  });

  it("reports storage write failures", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota exceeded"); });
    expect(importProgress(JSON.stringify({ version: 1, completed: [] }))).toMatchObject({ outcome: "failure", code: "progress.import.storage-write-failed", ok: false });
  });
});
