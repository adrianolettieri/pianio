// Read-only HTTP verification against an already running Vite static preview.
import assert from 'node:assert/strict';
const base = new URL(process.argv[2] ?? 'http://127.0.0.1:4173/');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname), 'Use a local preview, not production');
async function get(path) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  return response.text();
}
const [en, it, legacy] = await Promise.all(['/generated/en/catalog.json', '/generated/it/catalog.json', '/generated/catalog.json'].map(async path => JSON.parse(await get(path))));
assert.equal(en.locale, 'en'); assert.equal(it.locale, 'it');
const identity = catalog => catalog.courses.map(c => [c.id, c.exercises.map(e => [e.id, e.slug])]);
assert.deepEqual(identity(en), identity(it)); assert.deepEqual(identity(en), identity(legacy));
const jobs = en.courses.flatMap((c, i) => c.exercises.map((exercise, j) => async () => {
  const [a, b, c] = await Promise.all([exercise.scorePath, it.courses[i].exercises[j].scorePath, legacy.courses[i].exercises[j].scorePath].map(get));
  for (const xml of [a, b, c]) assert.match(xml, /<score-partwise\b/, exercise.scorePath);
  assert.equal(a, c, `Legacy EN mismatch: ${exercise.scorePath}`);
}));
for (let offset = 0; offset < jobs.length; offset += 12) await Promise.all(jobs.slice(offset, offset + 12).map(job => job()));
console.log(JSON.stringify({ base: base.href, catalogs: 3, coursesPerCatalog: en.courses.length, exercisesPerCatalog: jobs.length, musicXmlFetched: jobs.length * 3, legacyByteComparisons: jobs.length, result: 'passed', hosting: 'Vite preview; does not emulate Firebase rewrites' }, null, 2));
