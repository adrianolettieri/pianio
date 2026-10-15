import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { parseJsonStrict, readJsonStrict } from '../lib/json.mjs';
import { validateCourseTranslation, validateSourceCourse, editableFields } from '../lib/content-validation.mjs';
import { createCourseReview } from '../lib/content-review.mjs';
import { loadContent, contentReport, compileMusic, buildCatalog, resolveCourse, generateContent } from '../lib/content-pipeline.mjs';
import { renderMusicXml, localizeMusicXml } from '../lib/music.mjs';
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = await readJsonStrict(path.join(rootDir, 'scripts/test/fixtures/rich-course.json'));
const require = createRequire(path.join(rootDir, 'apps/web/package.json'));
const { JSDOM } = require('jsdom');
const { DOMParser } = new JSDOM().window;
const clone = value => structuredClone(value);
function complete(course = fixture) {
  return { courseId: course.courseId, title: 'Corso d’abilità & lettura < facile', summary: "Accenti, più precisione e l'apostrofo.",
    exercises: Object.fromEntries(course.exercises.map(e => [e.id, { title: "L'esercizio è già qui & < pronto", summary: 'Dinamica e pedale.', goal: 'Suona più piano & conta < quattro.', license: { notes: 'Esercizio originale.' } }])) };
}
async function sandbox(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'pianio-content-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(path.join(dir, 'content/a'), { recursive: true });
  await mkdir(path.join(dir, 'content-locales/it'), { recursive: true });
  await writeFile(path.join(dir, 'localization.config.json'), JSON.stringify({ supportedLanguages: ['en', 'it'], sourceLanguage: 'en', fallbackLanguage: 'en' }));
  await writeFile(path.join(dir, 'content/a/course.json'), JSON.stringify(fixture));
  return dir;
}
async function saveTranslation(dir, value, name = 'fixture-course.json') {
  await writeFile(path.join(dir, 'content-locales/it', name), typeof value === 'string' ? value : JSON.stringify(value));
}
function reviewed(content, translation) {
  content.registry = { version: 1, batches: { pilot: { locale: 'it', status: 'reviewed', reviewedBy: 'Fixture reviewer', reviewedOn: '2026-10-15' } }, locales: { it: { [fixture.courseId]: createCourseReview(content.courses[0], translation, 'pilot') } } };
}
function xmlTree(xml, normalizeEditorial = false) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  assert.equal(doc.querySelector('parsererror'), null);
  if (normalizeEditorial) for (const selector of ['score-partwise > work > work-title', 'score-partwise > movement-title', 'score-partwise > part > measure:first-child > direction[placement="above"] > direction-type > words']) {
    const nodes = doc.querySelectorAll(selector);
    assert.equal(nodes.length, 1, selector);
    nodes[0].textContent = 'AUTHORIZED_EDITORIAL_TEXT';
  }
  const visit = node => node.nodeType === 1 ? { name: node.nodeName,
    attributes: [...node.attributes].map(a => [a.name, a.value]).sort(),
    children: [...node.childNodes].filter(n => n.nodeType !== 3 || n.textContent.trim()).map(visit) }
    : { type: node.nodeType, name: node.nodeName, text: node.textContent };
  return {
    declaration: xml.match(/^<\?xml[^?]*\?>/)?.[0],
    doctype: doc.doctype ? { name: doc.doctype.name, publicId: doc.doctype.publicId, systemId: doc.doctype.systemId } : null,
    document: [...doc.childNodes].filter(n => n.nodeType !== 10 && (n.nodeType !== 3 || n.textContent.trim())).map(visit)
  };
}

test('strict JSON detects duplicates at every depth, including escaped keys', () => {
  for (const raw of ['{"a":1,"a":2}', '{"exercises":{"x":{"title":"a","ti\\u0074le":"b"}}}', '{"x":[{"notes":"a","notes":"b"}]}']) assert.throws(() => parseJsonStrict(raw), /Duplicate key/);
  for (const raw of ['{"a":1,}', '[1,]', '{"x":01}', '{"x":"bad\n"}', 'true false', '']) assert.throws(() => parseJsonStrict(raw));
  assert.deepEqual(parseJsonStrict('{"a":[{"x":"è & < \\""},null,true,1e2]}'), { a: [{ x: 'è & < "' }, null, true, 100] });
});
test('complete/partial documents, blanks, required fields and strict field allowlist', () => {
  assert.equal(validateSourceCourse(clone(fixture)).courseId, fixture.courseId);
  validateCourseTranslation(complete(), fixture, { full: true });
  validateCourseTranslation({ courseId: fixture.courseId }, fixture);
  assert.throws(() => validateCourseTranslation({ courseId: fixture.courseId }, fixture, { full: true }), /missing translations/);
  for (const field of editableFields(fixture, complete())) {
    const partial = complete();
    const parts = field.path.split('.');
    let target = partial;
    for (const key of parts.slice(0, -1)) target = target[key];
    delete target[parts.at(-1)];
    assert.throws(() => validateCourseTranslation(partial, fixture, { full: true }), /missing translations/);
    target[parts.at(-1)] = '  ';
    validateCourseTranslation(partial, fixture);
    assert.throws(() => validateCourseTranslation(partial, fixture, { full: true }), /missing translations/);
  }
  for (const mutation of [d => { d.courseId = 'orphan'; }, d => { d.exercises.unknown = {}; }, d => { d.title = 4; }, d => { d.title = null; }, d => { d.exercises = []; }, d => { d.exercises['fixture-001'] = null; }, d => { d.exercises['fixture-001'].license.notes = []; }, d => { d.title = '\u0000'; }]) {
    const d = complete(); mutation(d); assert.throws(() => validateCourseTranslation(d, fixture));
  }
  for (const key of ['id', 'slug', 'tempoBpm', 'measures', 'expectedNotes', 'clef', 'swing', 'licenseType', '__proto__']) {
    const d = complete(); Object.defineProperty(d.exercises['fixture-001'], key, { value: 'override', enumerable: true });
    assert.throws(() => validateCourseTranslation(d, fixture), /unknown field/);
  }
  for (const key of ['type', 'attribution']) {
    const d = complete(); d.exercises['fixture-001'].license[key] = 'override';
    assert.throws(() => validateCourseTranslation(d, fixture), /unknown field/);
  }
  assert.throws(() => validateCourseTranslation({ ...complete(), sourcePolicy: 'override' }, fixture), /unknown field/);
});
test('fallback is per field, empty is not translated, source is never mutated', () => {
  const d = { courseId: fixture.courseId, title: 'Italiano', summary: ' ', exercises: { 'fixture-001': { goal: 'Obiettivo', title: '', license: { notes: '' } } } };
  const before = clone(fixture), resolved = resolveCourse(fixture, d);
  assert.equal(resolved.title, 'Italiano'); assert.equal(resolved.summary, fixture.summary);
  assert.equal(resolved.exercises[0].goal, 'Obiettivo');
  for (const key of ['title', 'summary']) assert.equal(resolved.exercises[0][key], fixture.exercises[0][key]);
  assert.deepEqual(resolved.exercises[0].license, fixture.exercises[0].license);
  assert.deepEqual(fixture, before);
});
test('absent contents allowed ordinarily, malformed present files and duplicate source courses rejected', async t => {
  const dir = await sandbox(t);
  let content = await loadContent({ rootDir: dir });
  assert.equal(contentReport(content).issues.length, 0);
  assert.ok(contentReport(content, { full: true }).issues.length);
  for (const raw of ['{"courseId":"fixture-course","title":false}', '{"courseId":"fixture-course","title":"a","title":"b"}', '{"courseId":"fixture-course","exercises":{"no-such-id":{}}}', '{"courseId":"unknown"}', 'null', '{broken']) {
    await saveTranslation(dir, raw);
    await assert.rejects(loadContent({ rootDir: dir }));
  }
  await saveTranslation(dir, complete());
  await saveTranslation(dir, complete(), 'copy.json');
  await assert.rejects(loadContent({ rootDir: dir }), /Duplicate|filename/);
  await rm(path.join(dir, 'content-locales/it/copy.json'));
  await mkdir(path.join(dir, 'content/b'));
  await writeFile(path.join(dir, 'content/b/course.json'), JSON.stringify(fixture));
  await assert.rejects(loadContent({ rootDir: dir }), /Duplicate course/);
});
test('review hashes detect source and translation edits and pending batches; never refresh implicitly', async t => {
  const dir = await sandbox(t), d = complete(); await saveTranslation(dir, d);
  const content = await loadContent({ rootDir: dir }); reviewed(content, d);
  assert.deepEqual(contentReport(content, { full: true }).issues, []);
  const registryBefore = clone(content.registry);
  // Persist approvals and reload a modified source exactly as the CLI does.
  const reviewFile = path.join(dir, 'content-locales/review-registry.json');
  await writeFile(reviewFile, JSON.stringify(content.registry));
  const changedSource = clone(fixture); changedSource.exercises[0].goal += ' Changed on disk.';
  await writeFile(path.join(dir, 'content/a/course.json'), JSON.stringify(changedSource));
  assert.equal(contentReport(await loadContent({ rootDir: dir }), { full: true }).rows[1].reviewStatus, 'stale');
  assert.deepEqual(await readJsonStrict(reviewFile), registryBefore);
  content.courses[0].exercises[0].goal += ' Changed.';
  const stale = contentReport(content, { full: true });
  assert.equal(stale.rows[1].reviewStatus, 'stale');
  assert.deepEqual(stale.rows[1].staleFields, ['exercises.fixture-001.goal']);
  assert.ok(stale.issues.some(i => i.includes('stale')));
  assert.equal(contentReport(content).issues.length, 0);
  assert.equal(contentReport(content).warnings.length, 1);
  assert.deepEqual(content.registry, registryBefore);
  content.courses[0] = clone(fixture);
  content.translations.it.get(fixture.courseId).title += ' Modificato';
  assert.equal(contentReport(content).rows[1].reviewStatus, 'stale');
  content.translations.it.set(fixture.courseId, complete());
  content.registry.batches.pilot.status = 'pending';
  assert.equal(contentReport(content, { full: true }).rows[1].reviewStatus, 'pending');
  await writeFile(path.join(dir, 'content-locales/review-registry.json'), JSON.stringify({ version: 1, batches: {}, locales: { it: { unknown: {} } } }));
  await assert.rejects(loadContent({ rootDir: dir }), /unknown field/);
});
test('coverage counts source, translated and fallback fields separately', async t => {
  const dir = await sandbox(t); await saveTranslation(dir, { courseId: fixture.courseId, title: 'Titolo', summary: '', exercises: { 'fixture-001': { goal: 'Obiettivo' } } });
  const rows = contentReport(await loadContent({ rootDir: dir })).rows;
  assert.equal(rows[0].sourceFields, 6); assert.equal(rows[0].fallbackFields, 0);
  assert.equal(rows[1].translatedFields, 2); assert.equal(rows[1].fallbackFields, 4);
  assert.equal(rows[1].fields.summary, 'fallback'); assert.equal(rows[1].fields.title, 'translated');
});
test('generation isolated in temp dirs; EN/IT identity, order, music, credits and legacy URLs', async t => {
  const dir = await sandbox(t); await saveTranslation(dir, complete());
  const outputDir = path.join(dir, 'output');
  const { catalogs, legacy } = await generateContent({ rootDir: dir, outputDir });
  const en = catalogs.en.courses[0], it = catalogs.it.courses[0];
  assert.equal(catalogs.en.locale, 'en'); assert.equal(catalogs.it.locale, 'it');
  const invariant = c => ({ ...c, title: '', summary: '', coverage: undefined, exercises: c.exercises.map(e => ({ ...e, title: '', summary: '', goal: '', scorePath: '', license: { ...e.license, notes: '' } })) });
  assert.deepEqual(invariant(it), invariant(en));
  assert.strictEqual(en.exercises[0].expectedNotes, it.exercises[0].expectedNotes);
  const e = en.exercises[0];
  assert.equal(legacy.courses[0].exercises[0].scorePath, '/generated/scores/fixture-course/rich-score.musicxml');
  assert.equal(e.scorePath, '/generated/en/scores/fixture-course/rich-score.musicxml');
  const oldXml = await readFile(path.join(outputDir, 'scores/fixture-course/rich-score.musicxml'), 'utf8');
  assert.equal(oldXml, await readFile(path.join(outputDir, 'en/scores/fixture-course/rich-score.musicxml'), 'utf8'));
  assert.deepEqual(xmlTree(oldXml, true), xmlTree(await readFile(path.join(outputDir, 'it/scores/fixture-course/rich-score.musicxml'), 'utf8'), true));
  assert.equal(legacy.generatedAt, catalogs.it.generatedAt);
  // Reject bad inputs before clearing even a caller-selected directory.
  await writeFile(path.join(outputDir, 'sentinel'), 'keep');
  await saveTranslation(dir, '{bad');
  await assert.rejects(generateContent({ rootDir: dir, outputDir }));
  assert.equal(await readFile(path.join(outputDir, 'sentinel'), 'utf8'), 'keep');
  await saveTranslation(dir, complete());
  await assert.rejects(generateContent({ rootDir: dir, outputDir: dir }), /Unsafe outputDir/);
});
test('structural MusicXML baseline preserves chords, two staves, ties, dots, swing data, dynamics and pedal', async () => {
  const xml = renderMusicXml(fixture, fixture.exercises[0]);
  const baseline = await readFile(path.join(rootDir, 'scripts/test/fixtures/rich-score.baseline.musicxml'), 'utf8');
  assert.deepEqual(xmlTree(xml), xmlTree(baseline));
  const content = { courses: [fixture], config: { sourceLanguage: 'en', supportedLanguages: ['en', 'it'] }, translations: { it: new Map([[fixture.courseId, complete()]]) }, registry: { batches: {}, locales: {} } };
  const music = compileMusic(content.courses);
  assert.deepEqual(music.get(fixture.courseId).get('fixture-001').expectedNotes, await readJsonStrict(path.join(rootDir, 'scripts/test/fixtures/rich-score.baseline-notes.json')));
  const localized = localizeMusicXml(xml, resolveCourse(fixture, complete()).exercises[0]);
  assert.deepEqual(xmlTree(xml, true), xmlTree(localized, true));
  // Credits, rights, declarations and musical changes cannot be hidden by normalization.
  for (const changed of [
    localized.replace('Pianio original curriculum', 'Different credit'),
    localized.replace('CC0-1.0', 'Different rights'),
    localized.replace('<step>C</step>', '<step>D</step>'),
    localized.replace('http://www.musicxml.org/dtds/partwise.dtd', 'different.dtd'),
    localized.replace('<encoding>', '<encoding><!-- additional metadata -->')
  ]) assert.notDeepEqual(xmlTree(xml, true), xmlTree(changed, true));
  for (const marker of ['<chord/>', '<staves>2</staves>', '<tie type="start"/>', '<tie type="stop"/>', '<dot/>', '<dynamics', '<pedal']) assert.ok(localized.includes(marker), marker);
  assert.equal(buildCatalog(content, 'it', music).courses[0].exercises[0].swing, true);
  const doc = new DOMParser().parseFromString(localized, 'application/xml');
  assert.equal(doc.querySelector('work-title').textContent, complete().exercises['fixture-001'].title);
  assert.equal(doc.querySelector('words').textContent, complete().exercises['fixture-001'].goal);
  assert.ok(localized.includes('&amp;')); assert.ok(localized.includes('&lt;')); assert.ok(localized.includes('&apos;'));
});
test('real catalog: pilot fully reviewed, every course/exercise retains order and musical fields', async () => {
  const content = await loadContent({ rootDir });
  const music = compileMusic(content.courses), en = buildCatalog(content, 'en', music), it = buildCatalog(content, 'it', music);
  assert.equal(content.translations.it.size, 1);
  const pilot = it.courses.find(c => c.id === 'method-level-1a');
  assert.equal(pilot.exercises.length, 20); assert.equal(pilot.coverage.translatedFields, 82);
  assert.equal(pilot.coverage.fallbackFields, 0); assert.equal(pilot.coverage.reviewStatus, 'reviewed');
  assert.equal(contentReport(content).issues.length, 0);
  assert.equal(contentReport(content, { full: true }).rows.filter(r => r.locale === 'it' && r.fallbackFields > 0).length, content.courses.length - 1);
  assert.deepEqual(en.courses.map(c => c.id), it.courses.map(c => c.id));
  for (let i = 0; i < en.courses.length; i++) {
    assert.deepEqual(en.courses[i].exercises.map(e => [e.id, e.slug]), it.courses[i].exercises.map(e => [e.id, e.slug]));
    for (let j = 0; j < en.courses[i].exercises.length; j++) {
      const a = en.courses[i].exercises[j], b = it.courses[i].exercises[j];
      for (const key of ['expectedNotes', 'tempoBpm', 'timeSignature', 'keySignature', 'hands', 'clef', 'category', 'sourceKind', 'swing']) assert.deepEqual(a[key], b[key], key);
      assert.equal(a.license.type, b.license.type); assert.equal(a.license.attribution, b.license.attribution);
    }
  }
});

test('empty source license notes require no invented translation; legacy source clef is preserved', () => {
  const course = clone(fixture); course.exercises[0].license.notes = ''; course.exercises[0].license.attribution = '';
  course.exercises[0].clef = 'GF'; validateSourceCourse(course);
  const d = complete(course); delete d.exercises['fixture-001'].license;
  validateCourseTranslation(d, course, { full: true });
  assert.equal(editableFields(course, d).length, 5);
  d.exercises['fixture-001'].license = { notes: 'Invented' };
  assert.throws(() => validateCourseTranslation(d, course), /no source note/);
});
test('every real legacy English score URL remains readable and byte-identical to localized EN', async t => {
  const dir = await mkdtemp(path.join(tmpdir(), 'pianio-all-output-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const { catalogs, legacy } = await generateContent({ rootDir, outputDir: path.join(dir, 'generated') });
  for (const [i, course] of legacy.courses.entries()) for (const [j, exercise] of course.exercises.entries()) {
    const legacyXml = await readFile(path.join(dir, exercise.scorePath), 'utf8');
    const localizedEnXml = await readFile(path.join(dir, catalogs.en.courses[i].exercises[j].scorePath), 'utf8');
    assert.equal(legacyXml, localizedEnXml);
    const itXml = await readFile(path.join(dir, catalogs.it.courses[i].exercises[j].scorePath), 'utf8');
    if (course.id === 'method-level-1a') assert.deepEqual(xmlTree(legacyXml, true), xmlTree(itXml, true));
    else assert.equal(itXml, localizedEnXml);
  }
});
