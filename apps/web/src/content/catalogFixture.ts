import type { LocalizedCatalog } from "@pianio/content-schema";
import type { Language } from "../i18n/language";

export function catalogFixture(language: Language): LocalizedCatalog {
  return { locale: language, generatedAt: "2026-10-15T12:00:00.000Z", courses: [{
    id: "method-level-1a", title: language === "it" ? "Metodo italiano" : "English method", summary: "Summary", level: 1, sourcePolicy: "original", exerciseCount: 2,
    coverage: { locale: language, sourceLanguage: "en", totalFields: 2, sourceFields: language === "en" ? 2 : 0, translatedFields: language === "it" ? 2 : 0, fallbackFields: 0, reviewStatus: language === "it" ? "reviewed" : "source", staleFields: [], fields: { title: language === "it" ? "translated" : "source", summary: language === "it" ? "translated" : "source" } },
    exercises: ["one", "two"].map((slug, index) => ({ id: `ex-${slug}`, slug, title: language === "it" ? `Esercizio ${slug}` : `Exercise ${slug}`, summary: "Summary", goal: language === "it" ? "Suona il Do" : "Play C", hands: "right", clef: "G", sourceKind: "original", tempoBpm: 120, timeSignature: [4, 4], license: { type: "CC0", attribution: "", notes: "" }, scorePath: `/generated/${language}/scores/method-level-1a/${slug}.musicxml`, expectedNotes: [0, 4, 8].map(startBeat => ({ noteNumber: 60 + index, startBeat, durationBeats: 1, hand: "right" })) }))
  }] };
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
