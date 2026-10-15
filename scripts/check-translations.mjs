import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const namespaceDir = path.join(repoRoot, 'apps/web/src/i18n/locales');
const REQUIRED_NAMESPACES = ['common', 'catalog', 'practice', 'diagnostics', 'progress'];
const INTERPOLATION = /{{\s*-?\s*([\w.]+)\s*-?\s*}}/g;
const PLURAL_SUFFIX = /^(.*)_(zero|one|two|few|many|other)$/;

function flattenStrings(value, prefix = '', result = new Map()) {
  if (typeof value === 'string') {
    result.set(prefix, value);
  } else if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenStrings(child, prefix ? `${prefix}.${key}` : key, result);
    }
  }
  return result;
}

function interpolationParameters(value) {
  return [...value.matchAll(INTERPOLATION)].map((match) => match[1]).sort();
}

function requiredPluralCategories(language) {
  try {
    return new Intl.PluralRules(language).resolvedOptions().pluralCategories;
  } catch {
    return ['one', 'other'];
  }
}

function pluralGroups(flattened) {
  const groups = new Map();
  for (const [key, value] of flattened) {
    const match = key.match(PLURAL_SUFFIX);
    if (!match || !interpolationParameters(value).includes('count')) continue;
    const [, base, form] = match;
    const forms = groups.get(base) ?? new Set();
    forms.add(form);
    groups.set(base, forms);
  }
  return groups;
}

function pluralBase(key) {
  return key.match(PLURAL_SUFFIX)?.[1];
}

/** Validate translation resources without requiring Node to import application TypeScript. */
export function validateTranslationResources(resources, supportedLanguages, sourceLanguage, requiredNamespaces) {
  const issues = [];
  const source = resources[sourceLanguage];
  if (!source || typeof source !== 'object') {
    return [`Missing source-language resources: ${sourceLanguage}`];
  }
  const namespaces = Object.keys(source).sort();
  if (namespaces.length === 0) issues.push(`No namespaces found for source language ${sourceLanguage}`);
  for (const namespace of requiredNamespaces ?? []) {
    if (!namespaces.includes(namespace)) issues.push(`${sourceLanguage}: missing namespace "${namespace}"`);
  }
  for (const namespace of namespaces) {
    if (requiredNamespaces && !requiredNamespaces.includes(namespace)) {
      issues.push(`${sourceLanguage}: unexpected namespace "${namespace}"`);
    }
  }

  for (const language of supportedLanguages) {
    const locale = resources[language];
    if (!locale || typeof locale !== 'object') {
      issues.push(`Missing language resources: ${language}`);
      continue;
    }
    for (const namespace of namespaces) {
      if (!Object.hasOwn(locale, namespace)) {
        issues.push(`${language}: missing namespace "${namespace}"`);
      }
    }
    for (const namespace of Object.keys(locale)) {
      if (!namespaces.includes(namespace)) {
        issues.push(`${language}: unexpected namespace "${namespace}"`);
      }
    }

    const sourceFlat = new Map();
    const languageFlat = new Map();
    for (const namespace of namespaces) {
      const sourceResource = source[namespace];
      const languageResource = locale[namespace];
      if (!languageResource || typeof languageResource !== 'object') continue;
      flattenStrings(sourceResource, namespace, sourceFlat);
      flattenStrings(languageResource, namespace, languageFlat);
    }

    const sourcePluralGroups = pluralGroups(sourceFlat);
    const languagePluralGroups = pluralGroups(languageFlat);
    for (const base of sourcePluralGroups.keys()) {
      if (!languagePluralGroups.has(base)) issues.push(`${language}: missing plural key "${base}"`);
    }
    for (const base of languagePluralGroups.keys()) {
      if (!sourcePluralGroups.has(base)) issues.push(`${language}: unexpected plural key "${base}"`);
    }

    for (const [key, sourceValue] of sourceFlat) {
      const base = pluralBase(key);
      if (base && (sourcePluralGroups.has(base) || languagePluralGroups.has(base))) continue;
      if (!languageFlat.has(key)) {
        issues.push(`${language}: missing key "${key}"`);
        continue;
      }
      const translation = languageFlat.get(key);
      if (JSON.stringify(interpolationParameters(sourceValue)) !== JSON.stringify(interpolationParameters(translation))) {
        issues.push(`${language}: interpolation parameters differ at "${key}"`);
      }
    }
    for (const [key, value] of languageFlat) {
      const base = pluralBase(key);
      if (!sourceFlat.has(key) && !(base && (sourcePluralGroups.has(base) || languagePluralGroups.has(base)))) {
        issues.push(`${language}: unexpected key "${key}"`);
      }
      if (!value.trim()) issues.push(`${language}: empty string at "${key}"`);
    }

    for (const [base, forms] of languagePluralGroups) {
      const sourceForms = sourcePluralGroups.get(base);
      if (sourceForms) {
        const sourceForm = sourceForms.has('other') ? 'other' : [...sourceForms][0];
        const reference = sourceFlat.get(`${base}_${sourceForm}`);
        for (const form of forms) {
          const translation = languageFlat.get(`${base}_${form}`);
          if (JSON.stringify(interpolationParameters(reference)) !== JSON.stringify(interpolationParameters(translation))) {
            issues.push(`${language}: interpolation parameters differ at plural key "${base}_${form}"`);
          }
        }
      }
    }

    const categories = requiredPluralCategories(language);
    for (const [base, forms] of languagePluralGroups) {
      for (const category of categories) {
        if (!forms.has(category)) issues.push(`${language}: plural key "${base}" is missing form "${category}"`);
      }
    }
  }
  return issues;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const config = await readJson(path.join(repoRoot, 'localization.config.json'));
  const { readdir } = await import('node:fs/promises');
  const namespaces = new Set();
  for (const language of config.supportedLanguages) {
    try {
      for (const file of await readdir(path.join(namespaceDir, language))) {
        if (file.endsWith('.json')) namespaces.add(file.slice(0, -'.json'.length));
      }
    } catch {
      // The validator below reports a language with no resources.
    }
  }
  const namespaceNames = [...namespaces].sort();
  const loadIssues = [];
  const resources = {};
  for (const language of config.supportedLanguages) {
    resources[language] = {};
    for (const namespace of namespaceNames) {
      const filePath = path.join(namespaceDir, language, `${namespace}.json`);
      try {
        resources[language][namespace] = await readJson(filePath);
      } catch (error) {
        if (error?.code !== 'ENOENT') loadIssues.push(`${language}/${namespace}: ${error.message}`);
      }
    }
  }
  const issues = [...loadIssues, ...validateTranslationResources(resources, config.supportedLanguages, config.sourceLanguage, REQUIRED_NAMESPACES)];
  if (issues.length) {
    console.error(`Translation validation failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Translation resources valid: ${config.supportedLanguages.join(', ')}; ${namespaceNames.length} namespaces.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Translation validation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
