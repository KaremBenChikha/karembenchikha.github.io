// Run: node --test test/*.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');

test('redirects to karemverse.github.io three ways', () => {
  assert.match(html, /rel="canonical" href="https:\/\/karemverse\.github\.io\/"/);
  assert.match(html, /http-equiv="refresh" content="0; url=https:\/\/karemverse\.github\.io\/"/);
  assert.match(html, /location\.replace\('https:\/\/karemverse\.github\.io\/'/);
});
