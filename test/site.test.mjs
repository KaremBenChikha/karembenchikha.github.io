// Static checks for index.html. Run: node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('no em dash anywhere', () => {
  assert.equal(html.includes('—'), false);
});

test('contribution data is valid and has 12 months', () => {
  const m = html.match(/<script id="contrib-data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'data block missing');
  const data = JSON.parse(m[1]);
  assert.match(data.asOf, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(data.months.length, 12);
  for (const [month, n] of data.months) {
    assert.match(month, /^\d{4}-\d{2}$/);
    assert.ok(Number.isInteger(n) && n >= 0);
  }
});

test('local assets referenced by the page exist', () => {
  const refs = [...html.matchAll(/(?:src|href)="((?!https?:|#|data:)[^"]+)"/g)].map((r) => r[1]);
  assert.ok(refs.length > 0);
  for (const r of refs) assert.ok(existsSync(join(root, r)), `missing ${r}`);
});

test('section counts match the cards shown', () => {
  const grids = html.split('<div class="sec">').slice(1);
  for (const g of grids) {
    const n = Number(g.match(/<span>(\d+)<\/span>/)[1]);
    const block = g.split('<div class="sec">')[0].split('<footer>')[0];
    const items = (block.match(/<a class="card"/g) || []).length + (block.match(/<a href="https:\/\/github\.com\/[^"]+"><div class="lname">/g) || []).length;
    assert.equal(items, n);
  }
});

test('open-source count in the sidebar matches the page', () => {
  const claimed = Number(html.match(/<b>(\d+)<\/b> open-source projects/)[1]);
  const oss = (html.match(/href="https:\/\/github\.com\/(KaremBenChikha|Karemverse)\/[a-z0-9-]+"/g) || []).length;
  assert.equal(oss, claimed);
});

test('no links to private or removed repos', () => {
  for (const bad of ['removed-project', 'ems-marketplace', 'polybrain-chat', 'CryptoTaxProject', 'KaremBenChikha/Homelab', 'KaremBenChikha/stoxx']) {
    assert.equal(html.includes(bad), false, bad);
  }
});
