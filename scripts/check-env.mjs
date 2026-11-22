import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = new URL('../', import.meta.url);
const example = readFileSync(new URL('.env.example', root), 'utf8').split(/\r?\n/);
function keys(lines) {
  const entries = lines.map((line, index) => ({ line: index + 1, key: line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)?.[1] })).filter(entry => entry.key);
  if (new Set(entries.map(entry => entry.key)).size !== entries.length) throw new Error('Duplicate environment key');
  return entries;
}
const expected = keys(example);
const localPath = new URL('.env', root);
if (existsSync(localPath)) {
  const local = readFileSync(localPath, 'utf8').split(/\r?\n/);
  if (JSON.stringify(keys(local)) !== JSON.stringify(expected)) throw new Error('.env and .env.example must have identical keys on identical lines');
  if (local.length !== example.length) throw new Error('Environment file line counts differ');
  const values = parseEnv(local.join('\n'));
  for (const key of ['POSTGRES_PASSWORD', 'JWT_SECRET', 'MINIO_PASSWORD', 'DATABASE_URL']) {
    if (!values[key]) throw new Error(`Set the local development value for ${key}`);
  }
}
const values = parseEnv(example.join('\n'));
for (const [key, value] of Object.entries(values)) {
  if (/SECRET|PASSWORD|API_KEY|CLIENT_TOKEN/.test(key.toUpperCase()) && value) throw new Error(`Keep the template secret ${key} empty`);
}
console.log(`${fileURLToPath(root)}: ${expected.length} environment keys checked`);
