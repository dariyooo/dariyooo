#!/usr/bin/env node
/**
 * Writes current GitHub star counts straight into docs/data/content.json.
 *
 * Repos are taken from work.items[].url, so adding a card there is enough - no
 * need to touch this script. Only the numbers are rewritten (in the raw text,
 * so your hand formatting survives); everything else is left alone.
 *
 * Run: node scripts/update-stats.mjs   (GITHUB_TOKEN optional, raises rate limit)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '../docs/data/content.json');

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'dariyooo-site-stats' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function gh(path) {
  const res = await fetch('https://api.github.com' + path, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const slugOf = (url) => (String(url).match(/github\.com\/([^/]+\/[^/#?]+)/) || [])[1];

const raw = await readFile(CONTENT, 'utf8');
const content = JSON.parse(raw);
const user = (content.brand.githubUrl.match(/github\.com\/([^/#?]+)/) || [])[1];
const items = content.work.items;

const [profile, ...repos] = await Promise.all([
  gh(`/users/${user}`),
  ...items.map(it => gh(`/repos/${slugOf(it.url)}`)),
]);

// items[] and the "stars" fields in the file are in the same order, so the nth
// match belongs to the nth item.
let i = 0;
let out = raw.replace(/"stars":\s*"[^"]*"/g, () => `"stars": "★ ${repos[i++].stargazers_count}"`);
if (i !== items.length) throw new Error(`expected ${items.length} "stars" fields, patched ${i}`);
out = out.replace(/("linkLabel":\s*"All )\d+( repos)/, `$1${profile.public_repos}$2`);

if (out === raw) {
  console.log('content.json already up to date.');
} else {
  await writeFile(CONTENT, out);
  console.log(`Updated: ${profile.public_repos} public repos`);
  for (const r of repos) console.log(`  ${r.full_name}: ★ ${r.stargazers_count}`);
}
