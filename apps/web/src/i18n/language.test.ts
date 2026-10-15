import { afterEach, describe, expect, it } from "vitest";
import {
  getInitialLanguage,
  languageStorageKey,
  normalizeLanguage,
  persistExplicitLanguage,
  resetExplicitLanguageForTests,
  resolveLanguage,
  type StorageLike,
} from "./language";

afterEach(() => resetExplicitLanguageForTests());

describe("language selection", () => {
  it("normalizes supported regional tags and rejects unsupported values", () => {
    expect(normalizeLanguage("it-IT")).toBe("it");
    expect(normalizeLanguage("en-US")).toBe("en");
    expect(normalizeLanguage("EN_us")).toBe("en");
    expect(normalizeLanguage("fr-FR")).toBeUndefined();
    expect(normalizeLanguage({})).toBeUndefined();
  });

  it("prefers a valid stored language, then the first supported browser language", () => {
    const storage: StorageLike = { getItem: () => "it-IT", setItem: () => undefined };
    expect(resolveLanguage({ storage, navigatorLanguages: ["en-US"] })).toBe("it");
    expect(resolveLanguage({ storage: { getItem: () => "broken", setItem: () => undefined }, navigatorLanguages: ["fr", "it-IT", "en-US"] })).toBe("it");
    expect(resolveLanguage({ storage: null, navigatorLanguages: ["fr-FR", "en-US", "it-IT"] })).toBe("en");
  });

  it("remembers explicit choices when storage is absent or throws", () => {
    expect(persistExplicitLanguage("it", null)).toBe(false);
    expect(resolveLanguage({ storage: null, navigatorLanguages: ["en-US"] })).toBe("it");
    const blockedStorage: StorageLike = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
    };
    expect(resolveLanguage({ storage: blockedStorage, navigatorLanguages: ["en-US"] })).toBe("it");
    expect(persistExplicitLanguage("en", blockedStorage)).toBe(false);
    expect(resolveLanguage({ storage: blockedStorage, navigatorLanguages: ["it-IT"] })).toBe("en");
  });

  it("uses English if browser globals are unavailable", () => {
    expect(resolveLanguage({ storage: null, navigatorLanguages: null })).toBe("en");
    expect(getInitialLanguage()).toBe("en");
    expect(languageStorageKey).toBe("pianio:language");
  });
});
