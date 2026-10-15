export function validateTranslationResources(
  resources: Record<string, Record<string, unknown>>,
  supportedLanguages: readonly string[],
  sourceLanguage: string,
  requiredNamespaces?: readonly string[],
): string[];
