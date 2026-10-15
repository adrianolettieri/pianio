// @ts-expect-error The existing generator is an importable JavaScript module.
import { loadContent, compileMusic, buildCatalog } from "../../../../scripts/lib/content-pipeline.mjs";
import { describe, expect, it, vi } from "vitest";
import { createCatalogLoader, validateCatalog, visibleCatalog } from "./catalogLoader";
import { catalogFixture, deferred } from "./catalogFixture";

const response = (value: unknown) => new Response(JSON.stringify(value));
describe("localized catalog loader", () => {
  it("deduplicates, caches per language and retains canonical music references without mutating cached courses when filtering", async () => {
    const wait = deferred<Response>();
    const localized = catalogFixture("it");
    localized.courses.push({ ...localized.courses[0], id: "method-level-1", exercises: localized.courses[0].exercises.map(e => ({ ...e, scorePath: e.scorePath.replace("method-level-1a", "method-level-1") })) });
    const fetcher = vi.fn().mockReturnValueOnce(wait.promise).mockResolvedValueOnce(response(localized));
    const loader = createCatalogLoader(fetcher);
    const first = loader.load("en"), second = loader.load("en");
    expect(first).toBe(second);
    const en = catalogFixture("en");
    en.courses.push({ ...en.courses[0], id: "method-level-1", exercises: en.courses[0].exercises.map(e => ({ ...e, scorePath: e.scorePath.replace("method-level-1a", "method-level-1") })) });
    wait.resolve(response(en));
    const data = await first;
    expect(visibleCatalog(data).courses).toHaveLength(1);
    expect(data.courses).toHaveLength(2);
    expect(await loader.load("en")).toBe(data);
    const it = await loader.load("it");
    expect(it.courses[0].exercises[0].expectedNotes).toBe(data.courses[0].exercises[0].expectedNotes);
    expect(it.courses[0].exercises[0].timeSignature).toBe(data.courses[0].exercises[0].timeSignature);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each([
    () => new Response("unavailable", { status: 503 }),
    () => new Response('{"locale":'),
    () => new Response("<!doctype html><html><body>SPA</body></html>", { headers: { "content-type": "text/html" } }),
    () => response(catalogFixture("en")),
  ])("rejects HTTP, invalid JSON, HTML 200 and wrong locale; retries after failure", async badResponse => {
    const fetcher = vi.fn().mockResolvedValueOnce(badResponse()).mockResolvedValueOnce(response(catalogFixture("it")));
    const loader = createCatalogLoader(fetcher);
    await expect(loader.load("it")).rejects.toThrow();
    await expect(loader.load("it")).resolves.toMatchObject({ locale: "it" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("rejects unsafe paths, duplicate IDs, malformed music and dishonest coverage", () => {
    for (const mutate of [
      (c: ReturnType<typeof catalogFixture>) => { c.courses[0].exercises[0].scorePath = "https://evil.example/score"; },
      (c: ReturnType<typeof catalogFixture>) => { c.courses[0].id = "../escape"; },
      (c: ReturnType<typeof catalogFixture>) => { c.courses[0].exercises[1].id = c.courses[0].exercises[0].id; },
      (c: ReturnType<typeof catalogFixture>) => { c.courses[0].exercises[0].expectedNotes[0].noteNumber = 128; },
      (c: ReturnType<typeof catalogFixture>) => { c.courses[0].coverage.fallbackFields = 2; },
    ]) {
      const c = catalogFixture("it"); mutate(c);
      expect(() => validateCatalog(c, "it")).toThrow();
    }
  });
  it("rejects inconsistent music across locales without poisoning the English cache", async () => {
    const it = catalogFixture("it"); it.courses[0].exercises[0].expectedNotes[0].durationBeats = 2;
    const loader = createCatalogLoader(vi.fn().mockResolvedValueOnce(response(catalogFixture("en"))).mockResolvedValueOnce(response(it)));
    const en = await loader.load("en");
    await expect(loader.load("it")).rejects.toThrow("Inconsistent music");
    expect(await loader.load("en")).toBe(en);
  });
  it("rejects cross-language ID/order changes before they can change the active exercise", async () => {
    const it = catalogFixture("it"); it.courses[0].exercises.reverse();
    const loader = createCatalogLoader(vi.fn().mockResolvedValueOnce(response(catalogFixture("en"))).mockResolvedValueOnce(response(it)));
    await loader.load("en");
    await expect(loader.load("it")).rejects.toThrow("identities or order");
  });
  it("accepts the real phase 4 catalogs including legacy GF and coverage", async () => {
    const content = await loadContent({ rootDir: "../.." });
    const music = compileMusic(content.courses);
    for (const language of ["en", "it"] as const) {
      const data = buildCatalog(content, language, music);
      expect(validateCatalog(data, language).courses).toHaveLength(80);
    }
  });
});
