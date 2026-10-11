import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { BoxGeometry, DataTexture, Matrix4, PerspectiveCamera, Scene, Vector3 } from 'three';
import { float, texture, vec4 } from 'three/tsl';
import * as shaders from '../dist/index.js';
import { createXRayScopeEffect } from '../dist/postprocessing.js';
import { buildGraph } from './helpers/wgsl.mjs';
const rows = JSON.parse(readFileSync(new URL('./fixtures/retro-completion.json', import.meta.url)));
const context = { get scenePass() { throw Error('X-ray must compose with the current input'); }, scene: new Scene(), camera: new PerspectiveCamera() };
function withResources(run) {
	const map = new DataTexture(new Uint8Array([80, 160, 220, 128]), 1, 1); const geometry = new BoxGeometry();
	try { run({ atlas: map, backgroundTexture: map, revealTexture: map, baseTexture: map, geometry }); }
	finally { map.dispose(); geometry.dispose(); }
}
for (const row of rows) test(`#${row.id} ${row.factory} generates WGSL`, () => withResources(options => {
	if (row.kind === 'screen') { buildGraph({ colorNode: createXRayScopeEffect(options).effect(vec4(0.4).mul(0.8), context) }); return; }
	const fx = shaders[row.factory](options);
	if (row.kind === 'transition') {
		for (const progress of [0, 0.5, 1]) buildGraph({ colorNode: fx.shader({ fromNode: texture(options.atlas), toNode: texture(options.atlas), progress: float(progress) }) });
	} else if (['particles', 'echo', 'ribbon'].includes(row.kind)) {
		try { buildGraph(fx.shader, fx.mesh.geometry.clone(), fx.mesh.isInstancedMesh ? fx.mesh.count : 0); } finally { fx.dispose(); }
	} else buildGraph(fx);
}));

test('completion has 59 distinct routes and closes the 100-entry catalog', () => {
	const earlier = [1,2,12,17,20,35,36,87,3,7,16,38,55,62,86,88,6,14,19,21,22,23,24,27,30,31,33,39,42,43,44,48,60,65,66,68,79,81,91,96,98];
	assert.equal(rows.length, 59); assert.equal(new Set(rows.map(r => r.route)).size, 59);
	assert.deepEqual([...earlier, ...rows.map(r => r.id)].sort((a,b) => a-b), Array.from({ length: 100 }, (_,i) => i+1));
	const registry = readFileSync(new URL('../showcase/src/showcase-config.ts', import.meta.url), 'utf8');
	const guide = readFileSync(new URL('../docs/retro-effects-completion.md', import.meta.url), 'utf8');
	for (const row of rows) {
		assert.ok(existsSync(new URL(`../showcase/src/demos/${row.route}/${row.route}.ts`, import.meta.url)));
		assert.ok(registry.includes(`'${row.route}'`)); assert.ok(guide.includes('`'+row.factory+'`'));
	}
});
test('optional image/noise paths and manual clocks generate source', () => withResources(({ atlas }) => {
	for (const name of ['createPerspectiveTrack','createAirshipMap','createRotatingRoom','createOverheadRotation']) buildGraph(shaders[name]({ mapTexture: atlas, scale: 0, horizon: 0 }));
	buildGraph(shaders.createBrambleParallax({ foregroundTexture: atlas, backgroundTexture: atlas }));
	for (const name of ['createFireSpell','createFlameBreath','createMistAtmosphere']) buildGraph(shaders[name]({ noiseTexture: atlas, manualTime: true }));
	for (const name of ['createVanishCap','createBossGrowth','createDistanceFog']) buildGraph(shaders[name]({ manualTime: true }));
	buildGraph({ colorNode: createXRayScopeEffect({ revealTexture: atlas, range: 0, aperture: 0, strength: 0 }).effect(vec4(0.5), context) });
}));
test('particle pool preserves emission cadence, interpolates path and bounds long-frame work', () => {
	const fx = shaders.createElementalArrowTrail({ count: 8, rate: 10 });
	try {
		fx.update(0, new Vector3()); fx.update(0.25, new Vector3(2.5, 0, 0));
		const births = fx.mesh.geometry.getAttribute('retroBirth'); const origins = fx.mesh.geometry.getAttribute('retroOrigin');
		assert.ok(Math.abs(births.getX(1) - 0.1) < 1e-6); assert.ok(Math.abs(births.getX(2) - 0.2) < 1e-6);
		assert.ok(Math.abs(origins.getX(1) - 1) < 1e-6); assert.ok(Math.abs(origins.getX(2) - 2) < 1e-6);
		fx.update(10000, new Vector3(3, 0, 0)); assert.equal(births.count, 8); assert.equal(fx.mesh.geometry.instanceCount, 8);
		assert.ok([...births.array].every(t => t >= 9999 && t <= 10000));
		assert.throws(() => fx.update(2), /backward/); fx.reset(); fx.update(0);
	} finally { fx.dispose(); }
});
test('seeded bursts are reproducible, staggered explosions retain stationary origins', () => {
	const a = shaders.createChainedExplosions({ seed: 4, count: 8 }); const b = shaders.createChainedExplosions({ seed: 4, count: 8 });
	try {
		assert.deepEqual(a.mesh.geometry.getAttribute('retroOrigin').array, b.mesh.geometry.getAttribute('retroOrigin').array);
		const birth = a.mesh.geometry.getAttribute('retroBirth'); assert.ok(birth.getX(7) > birth.getX(0));
		const velocity = a.mesh.geometry.getAttribute('retroVelocity'); assert.equal(velocity.getX(0), 0); assert.equal(velocity.getY(0), 0);
	} finally { a.dispose(); b.dispose(); }
});
test('invalid capacities and lifetimes fail before allocation', () => {
	for (const count of [0, 1.5, 257, NaN]) assert.throws(() => shaders.createTntDebris({ count }), RangeError);
	for (const duration of [0, -1, Infinity]) assert.throws(() => shaders.createDrawStream({ duration }), RangeError);
	assert.throws(() => shaders.createSwordRibbon({ segments: 0 }), RangeError);
});
test('afterimage history expires, remains bounded and owns only its geometry clone', () => {
	const original = new BoxGeometry(); let originalDisposed = false; original.addEventListener('dispose', () => { originalDisposed = true; });
	const fx = shaders.createSpeedAfterimages({ geometry: original, count: 3, duration: 0.3 }); const matrix = new Matrix4();
	try {
		assert.notEqual(fx.mesh.geometry, original);
		for (let i = 0; i < 20; i++) fx.update(i * 0.1, matrix.makeTranslation(i, 0, 0));
		assert.equal(fx.mesh.count, 3); fx.update(3, matrix, false);
		assert.ok([...fx.mesh.geometry.getAttribute('retroFade').array].every(a => a === 0));
		fx.reset(); fx.update(0, matrix); assert.ok(fx.mesh.geometry.getAttribute('retroFade').getX(0) > 0);
	} finally { fx.dispose(); fx.dispose(); }
	assert.equal(originalDisposed, false); original.dispose();
});
test('ribbon draw range follows live segments and clears after emission stops', () => {
	const fx = shaders.createSwordRibbon({ segments: 4, duration: 0.2 }); const start = new Vector3(); const end = new Vector3(1,0,0);
	try {
		fx.update(0,start,end); assert.equal(fx.mesh.geometry.drawRange.count, 0);
		fx.update(0.05,start,end); assert.equal(fx.mesh.geometry.drawRange.count, 6);
		for (let i = 2; i < 10; i++) fx.update(i * 0.05,start,end);
		assert.ok(fx.mesh.geometry.drawRange.count <= 24); fx.update(1,start,end,false); assert.equal(fx.mesh.geometry.drawRange.count, 0);
		fx.reset(); assert.throws(() => fx.update(NaN,start,end), RangeError);
	} finally { fx.dispose(); }
});
test('managed resources dispose exactly once and reject updates after disposal', () => {
	const fx = shaders.createDamageSmoke(); let geometryDisposals = 0; let materialDisposals = 0;
	fx.mesh.geometry.addEventListener('dispose', () => geometryDisposals++); fx.mesh.material.addEventListener('dispose', () => materialDisposals++);
	fx.dispose(); fx.dispose(); assert.equal(geometryDisposals,1); assert.equal(materialDisposals,1); assert.throws(() => fx.update(1), /disposed/);
});
test('flare light switches off with the visible effect and keeps a finite range', () => {
	const fx = shaders.createFlareIllumination(); assert.ok(fx.light.distance > 0); assert.equal(fx.light.castShadow,false);
	fx.uniforms.strength.value = 0; fx.update(1); assert.equal(fx.light.intensity,0);
	fx.uniforms.strength.value = 1; fx.update(2); assert.ok(fx.light.intensity > 0); assert.equal(fx.uniforms.time.value,2);
});
