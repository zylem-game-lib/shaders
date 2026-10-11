import assert from 'node:assert/strict';
import { InstancedMesh, Mesh, NoToneMapping, PerspectiveCamera, PlaneGeometry, Scene } from 'three';
import { MeshBasicNodeMaterial, WebGPURenderer } from 'three/webgpu';

export function buildGraph(shader, geometry = new PlaneGeometry(), instances = 0) {
	const renderer = new WebGPURenderer({
		canvas: { width: 320, height: 180, style: {}, addEventListener() {}, removeEventListener() {} },
	});
	renderer.toneMapping = NoToneMapping;
	// Baseline feature profile for source generation only; no device is requested.
	renderer.hasFeature = () => false;
	// Conservative source-generation profile for InstancedMesh's uniform-buffer path.
	// This is not a device query and does not claim GPU support.
	renderer.backend.capabilities.getUniformBufferLimit = () => 16384;
	const material = new MeshBasicNodeMaterial();
	for (const key of ['colorNode', 'positionNode', 'normalNode', 'transparent', 'blending', 'side']) {
		if (shader[key] !== undefined) material[key] = shader[key];
	}
	const mesh = instances > 0 ? new InstancedMesh(geometry, material, instances) : new Mesh(geometry, material);
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
		if (mesh.isInstancedMesh) mesh.dispose();
		geometry.dispose();
		material.dispose();
		// Renderer was never initialized: it has no device/resources to dispose.
	}
}

