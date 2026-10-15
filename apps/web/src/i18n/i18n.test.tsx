import { createInstance } from "i18next";
import { describe, expect, it, vi } from "vitest";
import { initializeI18n, i18n, syncDocumentMetadata } from "./index";
import { validateTranslationResources } from "../../../../scripts/check-translations.mjs";

const baseResources = {
  en: {
    common: {
      greeting: "Hello {{name}}",
      item_one: "{{count}} item",
      item_other: "{{count}} items",
    },
  },
  it: {
    common: {
      greeting: "Ciao {{name}}",
      item_one: "{{count}} elemento",
      item_other: "{{count}} elementi",
    },
  },
};

describe("i18n foundation", () => {
  it("falls back and still resolves initialization if startup initialization fails", async () => {
    document.head.innerHTML = '<meta name="description" content="old">';
    document.documentElement.lang = "en";
    vi.spyOn(i18n, "init").mockRejectedValueOnce(new Error("simulated initialization failure"));
    await initializeI18n("it");
    expect(i18n.language).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    await i18n.changeLanguage("it");
    syncDocumentMetadata("it");
    expect(document.documentElement.lang).toBe("it");
    expect(document.title).toBe("Pianio — Lezioni di piano gratuite e aperte");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toContain("Impara il pianoforte");
  });

  it("falls back to English when a translated key is not present", async () => {
    const instance = createInstance();
    await instance.init({
      lng: "it",
      fallbackLng: "en",
      ns: ["common"],
      defaultNS: "common",
      resources: { en: { common: { foundationProbe: "English fallback" } }, it: { common: {} } },
    });
    expect(instance.t("foundationProbe" as never)).toBe("English fallback");
  });

  it("accepts language-specific plural categories without requiring another language's forms", () => {
    const resources = {
      en: { common: { item_one: "{{count}} item", item_other: "{{count}} items" } },
      ar: {
        common: {
          item_zero: "{{count}} item",
          item_one: "{{count}} item",
          item_two: "{{count}} items",
          item_few: "{{count}} items",
          item_many: "{{count}} items",
          item_other: "{{count}} items",
        },
      },
    };
    expect(validateTranslationResources(resources, ["en", "ar"], "en")).toEqual([]);
  });

  it("reports missing keys, unexpected keys, empty strings, parameter mismatch and plural gaps", () => {
    const invalid = {
      en: { common: { greeting: "Hello {{name}}", item_one: "{{count}} item", item_other: "{{count}} items" } },
      it: { common: { greeting: "Ciao", extra: "surplus", empty: "", item_one: "{{count}} elemento" } },
    };
    const issues = validateTranslationResources(invalid, ["en", "it"], "en");
    expect(issues).toContain('it: interpolation parameters differ at "common.greeting"');
    expect(issues).toContain('it: unexpected key "common.extra"');
    expect(issues).toContain('it: empty string at "common.empty"');
    expect(issues).toContain('it: plural key "common.item" is missing form "other"');
  });

  it("rejects mismatched namespaces and keys in otherwise valid fixtures", () => {
    const valid = {
      en: { common: { greeting: "Hello {{name}}" }, catalog: {} },
      it: { common: { greeting: "Ciao {{name}}" }, catalog: {} },
    };
    expect(validateTranslationResources(valid, ["en", "it"], "en")).toEqual([]);
    expect(validateTranslationResources(valid, ["en", "it"], "en", ["common", "catalog", "practice", "diagnostics", "progress"]))
      .toContain('en: missing namespace "practice"');
    expect(validateTranslationResources({ ...valid, it: { common: { greeting: "Ciao {{name}}" }, extra: {} } }, ["en", "it"], "en"))
      .toContain('it: missing namespace "catalog"');
  });
});
