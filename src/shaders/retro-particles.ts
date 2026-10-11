/** Fixed-capacity instanced cards. CPU records births; GPU evaluates motion and lifetime. */
import { DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, PlaneGeometry, Vector3 } from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, attribute, float, mix, positionLocal, uniform, uv, vec2, vec3 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { catalogContext, catalogShader, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface RetroParticleOptions extends RetroVfxOptions {
	/** Baked capacity, integer 1..256. */ count?: number;
	/** Positive seconds per particle. */ duration?: number;
	/** Positive local-space card size. */ size?: number;
	/** Positive births/second for continuous emitters. */ rate?: number;
	/** Deterministic integer seed. */ seed?: number;
}
export interface RetroParticleUniforms extends RetroVfxUniforms { duration: { value: number }; size: { value: number }; target: { value: Vector3 }; origin: { value: Vector3 } }
export interface RetroParticleEffect {
	mesh: Mesh<InstancedBufferGeometry, MeshBasicNodeMaterial>;
	shader: ZylemParameterizedShader<RetroParticleUniforms>;
	uniforms: RetroParticleUniforms;
	/** Absolute seconds, monotonic until reset; positions are LOCAL to mesh. */
	update(seconds: number, emitter?: { x: number; y: number; z: number }, target?: { x: number; y: number; z: number }): void;
	/** Replace the current burst. Continuous effects normally need only update(). */
	trigger(origin?: { x: number; y: number; z: number }, seconds?: number): void;
	reset(): void;
	/** Dispose owned geometry/material and detach mesh. Supplied resources are never disposed. */
	dispose(): void;
}
type ParticleKind = 'explosions' | 'dash' | 'collectible' | 'arrow' | 'moon' | 'drift' | 'laser' | 'damage' | 'knockback' | 'spray' | 'draw' | 'pages' | 'companion' | 'tnt' | 'pickup';
const palette: Record<ParticleKind, string> = { explosions: '#ff952f', dash: '#b8a688', collectible: '#ffe674', arrow: '#77caff', moon: '#ad9380', drift: '#c5c0b8', laser: '#ffcb5b', damage: '#656677', knockback: '#dfe0db', spray: '#cbf4ff', draw: '#8ce1ff', pages: '#f1dbb0', companion: '#bc764b', tnt: '#ba6b3c', pickup: '#ffb33e' };
const continuous = new Set<ParticleKind>(['dash', 'arrow', 'drift', 'damage', 'knockback', 'spray', 'draw']);
const orbiting = new Set<ParticleKind>(['pages', 'companion']);
const smoke = new Set<ParticleKind>(['dash', 'drift', 'damage', 'knockback']);
function positive(value: number, label: string): number {
	if (!Number.isFinite(value) || value <= 0) throw new RangeError(label + ' must be positive and finite');
	return value;
}
function particles(options: RetroParticleOptions, kind: ParticleKind): RetroParticleEffect {
	const count = options.count ?? (kind === 'companion' ? 1 : kind === 'pages' ? 8 : 32);
	if (!Number.isInteger(count) || count < 1 || count > 256) throw new RangeError('Particle count must be an integer from 1 to 256');
	const duration = positive(options.duration ?? 1.4, 'duration'); const rate = positive(options.rate ?? 24, 'rate');
	const size = positive(options.size ?? (smoke.has(kind) ? 0.7 : kind === 'pages' || kind === 'companion' ? 0.65 : 0.25), 'size');
	if (!Number.isFinite(options.seed ?? 1)) throw new RangeError('seed must be finite');
	let state = (options.seed ?? 1) >>> 0;
	const random = (): number => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 4294967296; };
	const plane = new PlaneGeometry(1, 1);
	const geometry = new InstancedBufferGeometry();
	geometry.setIndex(plane.index!.clone());
	for (const [name, attr] of Object.entries(plane.attributes)) geometry.setAttribute(name, attr.clone());
	plane.dispose(); geometry.instanceCount = count;
	const origins = new InstancedBufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage);
	const velocities = new InstancedBufferAttribute(new Float32Array(count * 3), 3).setUsage(DynamicDrawUsage);
	const births = new InstancedBufferAttribute(new Float32Array(count).fill(-1e6), 1).setUsage(DynamicDrawUsage);
	const seeds = new InstancedBufferAttribute(Float32Array.from({ length: count }, () => random()), 1);
	geometry.setAttribute('retroOrigin', origins); geometry.setAttribute('retroVelocity', velocities);
	geometry.setAttribute('retroBirth', births); geometry.setAttribute('retroSeed', seeds);
	const { u, finish } = catalogContext({ ...options, manualTime: true }, palette[kind]);
	u.duration = uniform(duration); u.size = uniform(size); u.target = uniform(new Vector3(2, 1, 0)); u.origin = uniform(new Vector3());
	const seed: any = attribute('retroSeed', 'float');
	const elapsed: any = u.time.sub(attribute('retroBirth', 'float'));
	const age: any = elapsed.div(u.duration.max(0.001)); const phase: any = age.clamp(0, 1);
	const live: any = elapsed.greaterThanEqual(0).select(1, 0).mul(age.lessThan(1).select(1, 0));
	const positionNode: any = Fn(() => {
		const origin: any = attribute('retroOrigin', 'vec3'); const velocity: any = attribute('retroVelocity', 'vec3');
		const t: any = elapsed.clamp(0, u.duration.max(0.001));
		let center: any = origin.add(velocity.mul(t));
		if (kind === 'moon' || kind === 'tnt' || kind === 'spray') center = center.add(vec3(0, t.mul(t).mul(kind === 'spray' ? -1.8 : -3), 0));
		if (kind === 'draw' || kind === 'pickup') {
			const eased: any = phase.mul(phase).mul(float(3).sub(phase.mul(2)));
			center = mix(origin, u.target, eased).add(vec3(phase.mul(Math.PI).sin().mul(seed.sub(0.5)).mul(2), phase.mul(Math.PI).sin().mul(1.5), 0));
		}
		if (orbiting.has(kind)) {
			const angle: any = seed.mul(Math.PI * 2).add(u.time.mul(u.speed));
			center = u.origin.add(vec3(angle.cos().mul(kind === 'companion' ? 1.1 : 1.8), angle.sin().mul(0.6).add(kind === 'companion' ? 1 : 0), angle.sin().mul(0.6)));
		}
		const scale: any = smoke.has(kind) || kind === 'explosions' ? phase.mul(2).add(0.5) : float(1);
		// Local XY cards. Orient the emitter's parent toward the camera if billboarding is desired.
		return center.add(positionLocal.mul(u.size.max(0)).mul(scale));
	})();
	const colorNode: any = Fn(() => {
		const p: any = uv().sub(0.5); const r: any = p.length();
		let shape: any = r.smoothstep(0.15, 0.5).oneMinus();
		if (kind === 'collectible' || kind === 'laser' || kind === 'arrow' || kind === 'draw') shape = p.x.abs().mul(p.y.abs()).smoothstep(0.001, 0.015).oneMinus().mul(r.smoothstep(0.1, 0.5).oneMinus());
		if (kind === 'pages') shape = float(1);
		if (kind === 'moon' || kind === 'tnt') shape = p.x.abs().add(p.y.abs()).smoothstep(0.4, 0.5).oneMinus();
		if (kind === 'companion') shape = p.x.abs().smoothstep(0.3, 0.35).oneMinus().mul(p.y.abs().smoothstep(0.4, 0.45).oneMinus());
		const alpha: any = orbiting.has(kind) ? shape : shape.mul(live).mul(phase.oneMinus());
		let heat: any = phase.oneMinus().mul(seed.mul(0.4).add(0.5));
		if (kind === 'pages') heat = uv().y.mul(14).fract().greaterThan(0.3).select(1, 0.3).mul(p.x.abs().lessThan(0.35).select(1, 0.5));
		if (kind === 'companion') heat = vec2(p.x.abs().sub(0.14), p.y.sub(0.08)).length().smoothstep(0.03, 0.075).oneMinus();
		return finish(alpha, heat);
	})();
	const shader = { ...catalogShader<RetroParticleUniforms>(u, colorNode, !smoke.has(kind) && !['moon', 'tnt', 'pages', 'companion', 'pickup'].includes(kind)), positionNode };
	const material = new MeshBasicNodeMaterial();
	material.colorNode = shader.colorNode; material.positionNode = positionNode; material.transparent = true;
	material.side = shader.side!; if (shader.blending !== undefined) material.blending = shader.blending;
	material.depthWrite = false; material.toneMapped = false; material.forceSinglePass = true;
	const mesh = new Mesh(geometry, material); mesh.frustumCulled = false;
	let cursor = 0; let lastTime = 0; let nextBirth = 0; let disposed = false;
	const previousEmitter = new Vector3(); const interpolatedEmitter = new Vector3();
	const check = (seconds: number): void => {
		if (disposed) throw new Error('Particle effect is disposed');
		if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('time must be finite and nonnegative');
	};
	const write = (i: number, when: number, origin: { x: number; y: number; z: number }): void => {
		const angle = random() * Math.PI * 2; const magnitude = 0.8 + random() * 2;
		let vx = Math.cos(angle) * magnitude; let vy = Math.sin(angle) * magnitude; let vz = (random() - 0.5) * 0.8;
		if (continuous.has(kind)) { vx *= 0.15; vy = smoke.has(kind) ? 0.4 + random() * 0.4 : kind === 'spray' ? 2 + random() * 1.5 : 0; vz = 0; }
		if (kind === 'moon') vy = -1 - random() * 2;
		if (kind === 'tnt') vy = 1 + random() * 3;
		const scatter = kind === 'explosions' ? 2 : 0;
		origins.setXYZ(i, origin.x + (random() - 0.5) * scatter, origin.y + (random() - 0.5) * scatter, origin.z);
		velocities.setXYZ(i, kind === 'explosions' ? 0 : vx, kind === 'explosions' ? 0 : vy, kind === 'explosions' ? 0 : vz);
		births.setX(i, when);
	};
	const dirty = (): void => { origins.needsUpdate = velocities.needsUpdate = births.needsUpdate = true; };
	const reset = (): void => {
		check(0); births.array.fill(-1e6); births.needsUpdate = true;
		cursor = 0; lastTime = 0; nextBirth = 0; u.time.value = 0; previousEmitter.set(0, 0, 0);
	};
	const trigger = (origin = { x: 0, y: 0, z: 0 }, seconds = lastTime): void => {
		check(seconds); if (seconds < lastTime) throw new RangeError('time cannot move backward; call reset first');
		u.time.value = seconds; lastTime = seconds; u.origin.value.copy(origin);
		for (let i = 0; i < count; i++) write(i, seconds + (kind === 'explosions' ? i / count * duration : 0), origin);
		dirty(); nextBirth = seconds + 1 / rate; previousEmitter.copy(origin);
	};
	const update = (seconds: number, emitter = { x: 0, y: 0, z: 0 }, target?: { x: number; y: number; z: number }): void => {
		check(seconds); if (seconds < lastTime) throw new RangeError('time cannot move backward; call reset first');
		u.time.value = seconds; u.origin.value.copy(emitter); if (target) u.target.value.copy(target);
		if (continuous.has(kind) && seconds >= nextBirth) {
			// Drop excess catch-up work after a long frame; never emit more than capacity.
			const totalDue = Math.floor((seconds - nextBirth) * rate) + 1;
			const birthsDue = Math.min(count, totalDue);
			for (let n = totalDue - birthsDue; n < totalDue; n++) {
				const when = nextBirth + n / rate;
				const fraction = seconds > lastTime ? Math.max(0, Math.min(1, (when - lastTime) / (seconds - lastTime))) : 1;
				interpolatedEmitter.copy(previousEmitter).lerp(emitter as Vector3, fraction);
				write(cursor, when, interpolatedEmitter); cursor = (cursor + 1) % count;
			}
			nextBirth += totalDue / rate; dirty();
		}
		lastTime = seconds; previousEmitter.copy(emitter);
	};
	const dispose = (): void => { if (disposed) return; disposed = true; mesh.removeFromParent(); geometry.dispose(); material.dispose(); };
	if (!continuous.has(kind)) trigger();
	return { mesh, shader, uniforms: u, update, trigger, reset, dispose };
}
export const createChainedExplosions = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'explosions');
export const createDashDust = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'dash');
export const createCollectibleBurst = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'collectible');
export const createElementalArrowTrail = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'arrow');
export const createMoonDebris = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'moon');
export const createDriftSmoke = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'drift');
export const createLaserImpact = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'laser');
export const createDamageSmoke = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'damage');
export const createKnockbackTrail = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'knockback');
export const createCrestSpray = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'spray');
export const createDrawStream = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'draw');
export const createSpellbookPages = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'pages');
export const createMaskCompanion = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'companion');
export const createTntDebris = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'tnt');
export const createPickupFlight = (o: RetroParticleOptions = {}): RetroParticleEffect => particles(o, 'pickup');
