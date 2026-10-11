import test from 'node:test';
import { DataTexture, PerspectiveCamera, Scene } from 'three';
import { float, texture, uniform, vec4 } from 'three/tsl';
import * as shaders from '../dist/index.js';
import { createSpellEmphasisEffect, createTruthLensEffect } from '../dist/postprocessing.js';
import { buildGraph } from './helpers/wgsl.mjs';

const materialFactories = [
	'createBoostExhaust', 'createChargeGlow', 'createStagedAura', 'createFacetedBarrier',
	'createWindMarker', 'createShieldBubble', 'createMuzzleFlash', 'createHolyPillars', 'createSpinSmear',
	'createForegroundMist', 'createPsiOverlay', 'createLayeredRain', 'createSnowLayers',
	'createRotatingTunnel', 'createSwimmingWake',
	'createSunsetSilhouette', 'createDefeatDissolve', 'createTwistedCorridor', 'createGoldenGlint',
	'createMistForm', 'createPortalPreview', 'createQuakeWave',
];
function withTexture(run) {
	const map = new DataTexture(new Uint8Array([80, 130, 220, 255]), 1, 1);
	try { run(map); } finally { map.dispose(); }
}
const context = {
	get scenePass() { throw Error('Reveal/color effects must use the current pipeline input'); },
	scene: new Scene(), camera: new PerspectiveCamera(),
};

for (const name of materialFactories) {
	test(name + ' generates WGSL', () => withTexture(map => {
		buildGraph(shaders[name](name === 'createPortalPreview' ? { previewTexture: map } : {}));
	}));
}
for (const name of ['createSunsetSilhouette', 'createDefeatDissolve', 'createTwistedCorridor']) {
	test(name + ' color-texture branch', () => withTexture(map => buildGraph(shaders[name]({ baseTexture: map }))));
}
test('mist lookup and silhouette-mask branches', () => withTexture(map => {
	buildGraph(shaders.createForegroundMist({ noiseTexture: map, manualTime: true }));
	buildGraph(shaders.createMistForm({ noiseTexture: map, maskTexture: map, manualTime: true }));
}));
test('animated energy and environment manual-clock branches', () => {
	buildGraph(shaders.createStagedAura({ manualTime: true }));
	buildGraph(shaders.createLayeredRain({ manualTime: true }));
});
test('spell emphasis composes after an input color operation, with/without a target mask', () => withTexture(map => {
	const input = vec4(uniform(0.5)).mul(0.7);
	for (const options of [{}, { targetMask: map }]) {
		buildGraph({ colorNode: createSpellEmphasisEffect(options).effect(input, context) });
	}
}));
test('truth lens composes a reveal texture with the current pipeline input', () => withTexture(map => {
	buildGraph({ colorNode: createTruthLensEffect({ revealTexture: map }).effect(vec4(0.4).mul(0.8), context) });
}));
test('battle swirl generates two-frame WGSL at start, middle and end', () => withTexture(map => {
	for (const progress of [0, 0.5, 1]) {
		const transition = shaders.createBattleSwirlTransition({ center: { x: 0.2, y: 0.8 } });
		buildGraph({ colorNode: transition.shader({ fromNode: texture(map), toNode: texture(map), progress: float(progress) }) });
	}
}));
test('zero-width and zero-strength settings still generate valid source', () => {
	buildGraph(shaders.createQuakeWave({ width: 0, amplitude: 0 }));
	buildGraph(shaders.createChargeGlow({ charge: 0 }));
	buildGraph(shaders.createDefeatDissolve({ progress: 1, pixels: 0 }));
});
