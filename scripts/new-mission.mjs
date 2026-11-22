#!/usr/bin/env node
// Scaffold a game mission (and its city, the first time) in every language.
// Usage: node scripts/new-mission.mjs <city> <slug>   e.g. node scripts/new-mission.mjs porto ribeira
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LANGS = ['en', 'fr', 'es', 'ar'];
const [city, slug] = process.argv.slice(2);
const id = /^[a-z0-9-]{2,64}$/;
if (!id.test(city ?? '') || !id.test(slug ?? '')) {
  console.error('Usage: node scripts/new-mission.mjs <city> <slug>  (lowercase letters, digits and dashes)');
  process.exit(1);
}

const root = new URL(`../api/src/main/resources/play/cities/${city}/`, import.meta.url);
const missions = new URL('missions/', root);
const perLang = text => Object.fromEntries(LANGS.map(lang => [lang, structuredClone(text)]));
const write = (url, data) => {
  writeFileSync(url, `${JSON.stringify(data, null, 2)}\n`, { flag: 'wx' });
  console.log(`created ${fileURLToPath(url)}`);
};

mkdirSync(missions, { recursive: true });
const cityFile = new URL('city.json', root);
if (!existsSync(cityFile)) {
  const order = readdirSync(new URL('..', root)).length;
  write(cityFile, {
    id: city, order, emoji: '📍', colors: ['#16457A', '#E07A2F'], center: [0, 0],
    text: perLang({ name: '', country: '', tagline: '', intro: '' }),
  });
}

const taken = readdirSync(missions).filter(name => name.endsWith('.json'));
if (taken.some(name => name.endsWith(`-${slug}.json`))) {
  console.error(`${city} already has a mission called ${slug}`);
  process.exit(1);
}
const number = String(taken.length + 1).padStart(2, '0');
write(new URL(`${number}-${slug}.json`, missions), {
  id: `${city}-${slug}`, lat: 0, lng: 0, minutes: 10, points: 150, free: false,
  accepted: [],
  rubric: '',
  sources: [{ label: '', url: '' }],
  text: perLang({ title: '', place: '', era: '', hook: '', challenge: '', hints: [''], story: '', facts: [] }),
});
console.log('Fill in every empty field, then run: cd api && mvn test -Dtest=PlayContentTest');
