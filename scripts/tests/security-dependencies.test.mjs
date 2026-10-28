import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const workspace = readFileSync('pnpm-workspace.yaml', 'utf8');
const workspaceOverrides = workspace.match(/^overrides:\r?\n((?:[ \t]+[^\r\n]*\r?\n?)*)/m)?.[1] || '';
const nextPackagePath = require.resolve('next/package.json');
const next = require(nextPackagePath);
const requireFromNext = createRequire(nextPackagePath);

function atLeast(actual, minimum) {
  assert.match(actual, /^\d+\.\d+\.\d+$/, 'Require a stable release');
  const a = actual.split('.').map(Number);
  const b = minimum.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
}

test('installed Next and WASM compiler retain the patched 15.x release', () => {
  // GHSA-2464-fhr4-w9xw and GHSA-p3m5-59mp-jv5r.
  assert.equal(Number(next.version.split('.')[0]), 15);
  assert.ok(atLeast(next.version, '15.5.28'));
  assert.equal(next.version, manifest.dependencies.next);
  assert.equal(require('@next/swc-wasm-nodejs/package.json').version, next.version);
  assert.equal(manifest.devDependencies['@next/swc-wasm-nodejs'], next.version);
});

test('the image processor actually resolved by Next contains the security fix', async () => {
  const entry = requireFromNext.resolve('sharp');
  const sharpPackage = JSON.parse(readFileSync(resolve(dirname(entry), '../package.json'), 'utf8'));
  assert.ok(atLeast(sharpPackage.version, '0.35.5'));
  assert.equal(sharpPackage.version, manifest.pnpm.overrides.sharp);
  const sharp = requireFromNext('sharp');
  // Small synthetic input only: verifies the native pipeline, not an exploit.
  const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="red"/></svg>');
  const output = await sharp(input).resize(8, 8).png().toBuffer();
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.width, 8);
  assert.equal(metadata.height, 8);
  assert.equal(metadata.format, 'png');
});

test('security overrides remain identical for pnpm 9 and the local pnpm runtime', () => {
  const fixes = {
    sharp: '0.35.5',
    'source-map-js': '1.2.2',
    'postcss-selector-parser': '7.1.6',
    browserslist: '4.28.7',
    'baseline-browser-mapping': '2.11.0'
  };
  for (const [name, minimum] of Object.entries(fixes)) {
    const configured = manifest.pnpm.overrides[name];
    assert.ok(atLeast(configured, minimum), `${name} must remain patched`);
    const yamlVersion = workspaceOverrides.match(new RegExp(`^  ${name}: (\\S+)\\s*$`, 'm'))?.[1];
    assert.equal(yamlVersion, configured, `${name} must agree across package managers`);
  }
});
