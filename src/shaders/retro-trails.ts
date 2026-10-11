import { BufferAttribute, BufferGeometry, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Matrix4, Mesh, Vector3, type Texture } from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, attribute, mix, texture, uniform, uv, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { catalogBand, catalogContext, catalogShader, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface AfterimageTrailOptions extends RetroVfxOptions {
	/** Required static/baked pose geometry. This factory owns a clone. */ geometry: BufferGeometry;
	baseTexture?: Texture; count?: number; duration?: number; interval?: number;
}
export interface AfterimageTrail {
	mesh: InstancedMesh; shader: ZylemParameterizedShader<RetroVfxUniforms>; uniforms: RetroVfxUniforms;
	/** Absolute seconds and transform LOCAL to the trail mesh's parent. At most one snapshot/update. */
	update(seconds: number, transform: Matrix4, emitting?: boolean): void;
	reset(): void; dispose(): void;
}
function validateCapacity(count: number, maximum: number): void {
	if (!Number.isInteger(count) || count < 2 || count > maximum) throw new RangeError(`capacity must be an integer from 2 to ${maximum}`);
}
function validateDuration(n: number): void { if (!Number.isFinite(n) || n <= 0) throw new RangeError('duration/interval must be positive and finite'); }
function afterimages(options: AfterimageTrailOptions, spectral: boolean): AfterimageTrail {
	const count = options.count ?? (spectral ? 8 : 6); validateCapacity(count, 32);
	const duration = options.duration ?? (spectral ? 0.8 : 0.35); const interval = options.interval ?? 0.05;
	validateDuration(duration); validateDuration(interval);
	const geometry = options.geometry.clone();
	const fades = new InstancedBufferAttribute(new Float32Array(count), 1).setUsage(DynamicDrawUsage);
	geometry.setAttribute('retroFade', fades);
	const { u } = catalogContext(options, spectral ? '#7181ed' : '#518bff');
	const colorNode: any = Fn(() => {
		const sample: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(1);
		return vec4(mix(sample.rgb.mul(u.color), u.hotColor, spectral ? 0 : 0.15).mul(u.intensity), sample.a.mul(attribute('retroFade', 'float')).mul(u.opacity));
	})();
	const shader = catalogShader<RetroVfxUniforms>(u, colorNode, !spectral);
	const material = new MeshBasicNodeMaterial(); material.colorNode = shader.colorNode; material.transparent = true;
	material.side = shader.side!; if (shader.blending !== undefined) material.blending = shader.blending;
	material.depthWrite = false; material.toneMapped = false; material.forceSinglePass = true;
	const mesh = new InstancedMesh(geometry, material, count); mesh.instanceMatrix.setUsage(DynamicDrawUsage); mesh.frustumCulled = false;
	const born = new Float64Array(count).fill(-Infinity); let cursor = 0; let lastTime = -Infinity; let nextSample = 0; let disposed = false;
	const reset = (): void => { if (disposed) throw Error('Trail is disposed'); born.fill(-Infinity); fades.array.fill(0); fades.needsUpdate = true; cursor = 0; lastTime = -Infinity; nextSample = 0; };
	const update = (seconds: number, transform: Matrix4, emitting = true): void => {
		if (disposed) throw Error('Trail is disposed');
		if (!Number.isFinite(seconds) || seconds < 0 || seconds < lastTime) throw new RangeError('time must be nonnegative and monotonic; reset before rewinding');
		if (emitting && seconds >= nextSample) {
			mesh.setMatrixAt(cursor, transform); mesh.instanceMatrix.needsUpdate = true;
			born[cursor] = seconds; cursor = (cursor + 1) % count; nextSample = seconds + interval;
		}
		for (let i = 0; i < count; i++) {
			const remaining = Math.max(0, 1 - (seconds - born[i]!) / duration);
			fades.setX(i, (spectral ? remaining : remaining * remaining) * 0.65);
		}
		fades.needsUpdate = true; u.time.value = seconds; lastTime = seconds;
	};
	return { mesh, shader, uniforms: u, update, reset, dispose() { if (disposed) return; disposed = true; mesh.removeFromParent(); mesh.dispose(); geometry.dispose(); material.dispose(); } };
}
export const createSpeedAfterimages = (o: AfterimageTrailOptions): AfterimageTrail => afterimages(o, false);
export const createAlucardAfterimages = (o: AfterimageTrailOptions): AfterimageTrail => afterimages(o, true);

export interface SwordRibbonOptions extends RetroVfxOptions { segments?: number; duration?: number }
export interface SwordRibbon {
	mesh: Mesh<BufferGeometry, MeshBasicNodeMaterial>; shader: ZylemParameterizedShader<RetroVfxUniforms>; uniforms: RetroVfxUniforms;
	/** Two blade endpoints LOCAL to mesh. emitting=false ages the existing ribbon without extending it. */
	update(seconds: number, start: Vector3, end: Vector3, emitting?: boolean): void;
	reset(): void; dispose(): void;
}
/** #45: bounded endpoint history, no particles and no allocations per update. */
export function createSwordRibbon(options: SwordRibbonOptions = {}): SwordRibbon {
	const capacity = (options.segments ?? 24) + 1; validateCapacity(capacity, 129);
	const duration = options.duration ?? 0.22; validateDuration(duration);
	const geometry = new BufferGeometry();
	const points = new Float32Array(capacity * 6); const stamps = new Float64Array(capacity);
	const positions = new BufferAttribute(new Float32Array(capacity * 6), 3).setUsage(DynamicDrawUsage);
	const coords = new BufferAttribute(new Float32Array(capacity * 4), 2);
	const alpha = new BufferAttribute(new Float32Array(capacity * 2), 1).setUsage(DynamicDrawUsage);
	const indices: number[] = [];
	for (let i = 0; i < capacity; i++) {
		coords.setXY(i * 2, 0, i / (capacity - 1)); coords.setXY(i * 2 + 1, 1, i / (capacity - 1));
		if (i < capacity - 1) { const j = i * 2; indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
	}
	geometry.setAttribute('position', positions); geometry.setAttribute('uv', coords); geometry.setAttribute('retroFade', alpha); geometry.setIndex(indices); geometry.setDrawRange(0, 0);
	const { u, finish } = catalogContext(options, '#ccecff');
	const fadeNode: any = attribute('retroFade', 'float');
	const colorNode: any = finish(fadeNode.mul(uv().x.mul(uv().x.oneMinus()).mul(4)), uv().x);
	const shader = catalogShader<RetroVfxUniforms>(u, colorNode);
	const material = new MeshBasicNodeMaterial(); material.colorNode = colorNode; material.transparent = true; material.blending = shader.blending!; material.side = shader.side!; material.depthWrite = false; material.toneMapped = false; material.forceSinglePass = true;
	const mesh = new Mesh(geometry, material); mesh.frustumCulled = false;
	let length = 0; let lastTime = -Infinity; let disposed = false;
	const reset = (): void => { if (disposed) throw Error('Ribbon is disposed'); length = 0; lastTime = -Infinity; geometry.setDrawRange(0, 0); };
	const update = (seconds: number, start: Vector3, end: Vector3, emitting = true): void => {
		if (disposed) throw Error('Ribbon is disposed');
		if (!Number.isFinite(seconds) || seconds < 0 || seconds < lastTime) throw new RangeError('time must be nonnegative and monotonic; reset before rewinding');
		if (emitting && seconds !== lastTime) {
			points.copyWithin(6, 0, (capacity - 1) * 6); stamps.copyWithin(1, 0, capacity - 1);
			points[0] = start.x; points[1] = start.y; points[2] = start.z; points[3] = end.x; points[4] = end.y; points[5] = end.z;
			stamps[0] = seconds; length = Math.min(capacity, length + 1);
		}
		while (length > 0 && seconds - stamps[length - 1]! >= duration) length--;
		positions.array.set(points);
		for (let i = 0; i < length; i++) { const fade = Math.max(0, 1 - (seconds - stamps[i]!) / duration); alpha.setX(i * 2, fade); alpha.setX(i * 2 + 1, fade); }
		positions.needsUpdate = alpha.needsUpdate = true; geometry.setDrawRange(0, Math.max(0, length - 1) * 6); lastTime = seconds; u.time.value = seconds;
	};
	return { mesh, shader, uniforms: u, update, reset, dispose() { if (disposed) return; disposed = true; mesh.removeFromParent(); geometry.dispose(); material.dispose(); } };
}

export interface WatercraftWakeOptions extends RetroVfxOptions { strength?: number; spread?: number }
export interface WatercraftWakeUniforms extends RetroVfxUniforms { strength: { value: number }; spread: { value: number } }
/** #63: twin widening foam rails and central churn; orient a quad on the water behind the hull. */
export function createWatercraftWake(options: WatercraftWakeOptions = {}): ZylemParameterizedShader<WatercraftWakeUniforms> {
	const { u, clock, finish } = catalogContext(options, '#d4f5ff'); u.strength = uniform(options.strength ?? 1); u.spread = uniform(options.spread ?? 0.4);
	const p: any = uv(); const x: any = p.x.sub(0.5).abs(); const y: any = p.y;
	const rails: any = catalogBand(x.sub(y.mul(u.spread.clamp(0, 0.45))), y.mul(0.025).add(0.006));
	const churn: any = x.smoothstep(0, y.mul(0.13).add(0.001)).oneMinus().mul(y.mul(50).sub(clock.mul(10)).sin().abs());
	return catalogShader(u, finish(rails.add(churn.mul(0.5)).mul(y.smoothstep(0, 0.08)).mul(y.oneMinus()).mul(u.strength.clamp(0, 1))), false);
}
