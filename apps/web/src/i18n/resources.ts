import enCommon from "./locales/en/common.json";
import enCatalog from "./locales/en/catalog.json";
import enPractice from "./locales/en/practice.json";
import enDiagnostics from "./locales/en/diagnostics.json";
import enProgress from "./locales/en/progress.json";
import itCommon from "./locales/it/common.json";
import itCatalog from "./locales/it/catalog.json";
import itPractice from "./locales/it/practice.json";
import itDiagnostics from "./locales/it/diagnostics.json";
import itProgress from "./locales/it/progress.json";

export const resources = {
  en: { common: enCommon, catalog: enCatalog, practice: enPractice, diagnostics: enDiagnostics, progress: enProgress },
  it: { common: itCommon, catalog: itCatalog, practice: itPractice, diagnostics: itDiagnostics, progress: itProgress },
} as const;

export type Language = keyof typeof resources;
export const languageLabels: Record<Language, string> = { en: "English", it: "Italiano" };
