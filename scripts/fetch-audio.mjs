// Download only the samples used by the app, from a fixed upstream revision.
// --check verifies local files without accessing the network.
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../apps/web/src/audio/salamander.json', import.meta.url), 'utf8'));
const directory = new URL('../apps/web/public/audio/salamander/', import.meta.url);
const checkOnly = process.argv.includes('--check');
const digest = data => createHash('sha256').update(data).digest('hex');
const files = [...new Set(Object.values(manifest.urls)), 'README'];
if (!checkOnly) await mkdir(directory, { recursive: true });

async function ensureFile(file) {
  const expected = manifest.sha256[file];
  if (!/^[a-f0-9]{64}$/.test(expected ?? '')) throw new Error(`Missing checksum: ${file}`);
  const target = new URL(file, directory);
  try {
    if (digest(await readFile(target)) === expected) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (checkOnly) throw new Error(`Missing or modified audio asset: ${file}. Run pnpm fetch:audio.`);
  const url = `https://raw.githubusercontent.com/Tonejs/audio/${manifest.revision}/salamander/${file}`;
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${file}`);
      const data = Buffer.from(await response.arrayBuffer());
      if (digest(data) !== expected) throw new Error(`Checksum mismatch: ${file}`);
      const temporary = new URL(`${file}.part`, directory);
      try {
        await writeFile(temporary, data);
        await rename(temporary, target);
      } finally {
        await rm(temporary, { force: true });
      }
      console.log(`Downloaded ${file}`);
      return;
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

// Keep downloads bounded on home servers.
for (let offset = 0; offset < files.length; offset += 4) {
  await Promise.all(files.slice(offset, offset + 4).map(ensureFile));
}
console.log(`Verified ${files.length - 1} piano samples and upstream README (SHA-256).`);
