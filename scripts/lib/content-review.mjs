import { createHash } from 'node:crypto';
import { editableFields, isTranslated, object, text } from './content-validation.mjs';

export const fingerprint = value => createHash('sha256').update(value, 'utf8').digest('hex');
export const emptyReviewRegistry = () => ({ version: 1, batches: {}, locales: {} });
export function validateReviewRegistry(registry, courses, languages) {
  object(registry, 'review registry', ['version', 'batches', 'locales'], ['version', 'batches', 'locales']);
  if (registry.version !== 1) throw new Error('Unsupported review registry version');
  object(registry.batches, 'review batches', Object.keys(registry.batches ?? {}));
  for (const [id, batch] of Object.entries(registry.batches)) {
    object(batch, `batch ${id}`, ['locale', 'status', 'reviewedBy', 'reviewedOn'], ['locale', 'status']);
    if (!languages.includes(batch.locale) || !['pending', 'reviewed'].includes(batch.status)) throw new Error(`Invalid batch ${id}`);
    if (batch.status === 'reviewed') {
      text(batch.reviewedBy, `${id}.reviewedBy`);
      text(batch.reviewedOn, `${id}.reviewedOn`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(batch.reviewedOn) || !Number.isFinite(Date.parse(batch.reviewedOn))) throw new Error(`Invalid review date ${id}`);
    }
  }
  object(registry.locales, 'review locales', languages);
  for (const [locale, entries] of Object.entries(registry.locales)) {
    object(entries, `review ${locale}`, courses.map(c => c.courseId));
    for (const [id, entry] of Object.entries(entries)) {
      object(entry, `review ${id}`, ['status', 'batchId', 'sourceFingerprints', 'translationFingerprints'], ['status', 'batchId', 'sourceFingerprints', 'translationFingerprints']);
      if (!['pending', 'reviewed'].includes(entry.status) || registry.batches[entry.batchId]?.locale !== locale) throw new Error(`Invalid course review ${id}`);
      const fields = editableFields(courses.find(c => c.courseId === id)).map(f => f.path);
      for (const key of ['sourceFingerprints', 'translationFingerprints']) {
        object(entry[key], `${id}.${key}`, fields);
        for (const hash of Object.values(entry[key])) if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid fingerprint ${id}`);
      }
    }
  }
  return registry;
}
/** Explicit editorial action only; generation/checking never refreshes approvals. */
export function createCourseReview(course, translation, batchId) {
  const fields = editableFields(course, translation).filter(f => isTranslated(f.translation));
  return { status: 'reviewed', batchId,
    sourceFingerprints: Object.fromEntries(fields.map(f => [f.path, fingerprint(f.source)])),
    translationFingerprints: Object.fromEntries(fields.map(f => [f.path, fingerprint(f.translation)])) };
}
export function reviewCoverage(course, translation, registry, locale, sourceLanguage) {
  const source = locale === sourceLanguage;
  const fields = editableFields(course, translation);
  const entries = registry.locales[locale];
  const review = entries && Object.hasOwn(entries, course.courseId) ? entries[course.courseId] : undefined;
  const batch = registry.batches[review?.batchId];
  const translated = source ? [] : fields.filter(f => isTranslated(f.translation));
  const staleFields = translated.filter(f => review && (
    review.sourceFingerprints[f.path] !== fingerprint(f.source) ||
    review.translationFingerprints[f.path] !== fingerprint(f.translation))).map(f => f.path);
  // Removed translations must not silently retain a reviewed course status.
  for (const key of Object.keys(review?.sourceFingerprints ?? {})) {
    if (!translated.some(f => f.path === key)) staleFields.push(key);
  }
  const reviewStatus = source ? 'source' : !review ? 'missing' : staleFields.length ? 'stale' :
    review.status === 'reviewed' && batch?.status === 'reviewed' ? 'reviewed' : 'pending';
  return { locale, sourceLanguage, totalFields: fields.length,
    sourceFields: source ? fields.length : 0, translatedFields: translated.length,
    fallbackFields: source ? 0 : fields.length - translated.length, reviewStatus, staleFields,
    ...(review ? { batchId: review.batchId } : {}),
    fields: Object.fromEntries(fields.map(f => [f.path, source ? 'source' : isTranslated(f.translation) ? 'translated' : 'fallback'])) };
}
