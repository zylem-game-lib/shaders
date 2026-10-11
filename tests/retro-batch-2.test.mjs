/**
 * Build the lazy TSL graphs all the way to WGSL without requesting a GPU device.
 * This catches missing node methods, stage misuse and optional-branch failures
 * that tsc/bundling cannot see. It does not validate WGSL on a GPU or render pixels.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DataTexture, Mesh, NoToneMapping, PerspectiveCamera, PlaneGeometry, Scene } from 'three';
import { MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu';
import { float, uniform, vec4 } from 'three/tsl';
import { createBlobShadow, createHitSpark, createIrisTransition, createRainbowRoad, createWaterRipple } from '../dist/index.js';
import { createChaffInterferenceEffect, createLanternConeEffect, createThermalVisionEffect } from '../dist/postprocessing.js';

function buildGraph(shader) {
	const renderer = new WebGPURenderer({
		canvas: { width: 320, height: 180, style: {}, addEventListener() {}, removeEventListener() {} },
	});
	renderer.toneMapping = NoToneMapping;
	// Baseline feature profile for source generation only; no device is requested.
	renderer.hasFeature = () => false;
	const material = new MeshBasicNodeMaterial();
	for (const key of ['colorNode', 'positionNode', 'transparent', 'blending', 'side']) {
		if (shader[key] !== undefined) material[key] = shader[key];
	}
	const geometry = new PlaneGeometry();
	const mesh = new Mesh(geometry, material);
	// Use the backend's builder to share the same TSL registry as three/webgpu.
	const builder = renderer.backend.createNodeBuilder(mesh, renderer);
	builder.scene = new Scene();
	builder.camera = new PerspectiveCamera();
	try {
		builder.build();
		assert.match(builder.vertexShader, /@vertex/);
		assert.match(builder.fragmentShader, /@fragment/);
		assert.doesNotMatch(builder.vertexShader, /\bfwidth\(/, 'derivatives must remain in the fragment stage');
		assert.doesNotMatch(builder.fragmentShader, /\b(?:undefined|NaN|Infinity)\b/);
	} finally {
		geometry.dispose();
		material.dispose();
		// Renderer was never initialized: it has no device/resources to dispose.
	}
}

for (const [name, factory] of Object.entries({ createWaterRipple, createBlobShadow, createRainbowRoad, createHitSpark })) {
	test(name + ' generates vertex and fragment WGSL', () => buildGraph(factory()));
}
test('rainbow U-axis/manual-clock branch generates WGSL', () => {
	buildGraph(createRainbowRoad({ axis: 'u', manualTime: true, speed: 0 }));
});

const context = {
	get scenePass() { throw new Error('Color-only effects must transform the current input, not replace its scene pass'); },
	scene: new Scene(), camera: new PerspectiveCamera(),
};
for (const [name, factory] of Object.entries({ createLanternConeEffect, createThermalVisionEffect, createChaffInterferenceEffect })) {
	test(name + ' composes with a prior color operation', () => {
		const input = vec4(uniform(0.2), uniform(0.4), uniform(0.6), uniform(0.5)).mul(0.9);
		buildGraph({ colorNode: factory().effect(input, context), transparent: true });
	});
}
test('thermal heat-texture branch generates WGSL', () => {
	const heat = new DataTexture(new Uint8Array([128, 0, 0, 255]), 1, 1);
	try {
		buildGraph({ colorNode: createThermalVisionEffect({ heatTexture: heat }).effect(vec4(1), context) });
	} finally { heat.dispose(); }
});
test('chaff manual-clock branch generates WGSL', () => {
	buildGraph({ colorNode: createChaffInterferenceEffect({ manualTime: true }).effect(vec4(1), context) });
});
test('iris generates WGSL at both endpoints and during an off-center wipe', () => {
	for (const progress of [0, 0.5, 1]) {
		const iris = createIrisTransition({ center: { x: 0.1, y: 0.9 }, softness: 0 });
		buildGraph({ colorNode: iris.shader({ fromNode: vec4(1, 0, 0, 1), toNode: vec4(0, 0, 1, 1), progress: float(progress) }) });
	}
});
