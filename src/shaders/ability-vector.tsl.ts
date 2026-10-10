/**
 * Analytic sigils, portals and ribbons adapted from AbilityCastingThreeJS.
 * See THIRD_PARTY_NOTICES.md and docs/ability-effects.md.
 */
import { Fn, abs, atan, float, fract, length, max, sin, smoothstep, uniform, uv, vec2 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { abilityBand, abilityContext, abilityShader, type AbilityEffectOptions, type AbilityEffectUniforms } from './ability-common.tsl';
const TAU = Math.PI * 2;

export interface AbilitySigilOptions extends AbilityEffectOptions {
	/** Inscription progress, 0..1. Default 1. */
	progress?: number;
	/** Ring half-width in centered UV coordinates. Default 0.012. */
	lineWidth?: number;
	/** Baked radial ticks, rounded/clamped to 3..64. Default 16. */
	segments?: number;
}
export interface AbilitySigilUniforms extends AbilityEffectUniforms {
	progress: { value: number };
	lineWidth: { value: number };
}

/** Floor/hand sigil on a UV quad: two rings, radial marks and an octagram. */
export function createAbilitySigil(options: AbilitySigilOptions = {}): ZylemParameterizedShader<AbilitySigilUniforms> {
	const c = abilityContext(options, '#ffc85c');
	const u: any = { ...c.uniforms, progress: uniform(options.progress ?? 1), lineWidth: uniform(options.lineWidth ?? 0.012) };
	const requested = options.segments ?? 16;
	const segments = Number.isFinite(requested) ? Math.min(64, Math.max(3, Math.round(requested))) : 16;
	const colorNode = Fn(() => {
		const p: any = uv().mul(2).sub(1).toVar();
		const r: any = length(p).toVar();
		const a: any = atan(p.y, p.x.add(0.00001)).add(c.clock.mul(0.15));
		const rings = abilityBand(r.sub(0.82), u.lineWidth).add(abilityBand(r.sub(0.62), u.lineWidth));
		const ticks = abilityBand(sin(a.mul(segments / 2)).mul(r), u.lineWidth)
			.mul(smoothstep(0.65, 0.68, r)).mul(smoothstep(0.76, 0.79, r).oneMinus());
		const q: any = vec2(p.x.add(p.y), p.y.sub(p.x)).mul(Math.SQRT1_2);
		const star = abilityBand(max(abs(p.x), abs(p.y)).sub(0.42), u.lineWidth)
			.add(abilityBand(max(abs(q.x), abs(q.y)).sub(0.42), u.lineWidth));
		const sweep: any = fract(a.div(TAU).add(0.5));
		const progress = u.progress.clamp(0, 1);
		const reveal = smoothstep(0, 0.015, progress.sub(sweep));
		// Exact endpoints: hidden at 0, no angular seam at 1.
		const drawn = progress.greaterThanEqual(1).select(float(1), reveal);
		return c.finish(rings.add(ticks).add(star.mul(0.7)).mul(drawn), rings.mul(0.3));
	})();
	return abilityShader<AbilitySigilUniforms>(colorNode, u);
}

export interface AbilityPortalOptions extends AbilityEffectOptions {
	/** Aperture radius, 0..1. Default 1. */
	open?: number;
	/** Edge irregularity, 0..1. Default 0.18. */
	turbulence?: number;
}
export interface AbilityPortalUniforms extends AbilityEffectUniforms {
	open: { value: number };
	turbulence: { value: number };
}

/** Swirling quad surface; application handles actual scene holes/teleportation. */
export function createAbilityPortal(options: AbilityPortalOptions = {}): ZylemParameterizedShader<AbilityPortalUniforms> {
	const c = abilityContext(options, '#8055ff');
	const u: any = { ...c.uniforms, open: uniform(options.open ?? 1), turbulence: uniform(options.turbulence ?? 0.18) };
	const colorNode = Fn(() => {
		const opening = u.open.clamp(0, 1);
		const p: any = uv().mul(2).sub(1).div(max(opening, 0.001)).toVar();
		const r: any = length(p).toVar();
		const a: any = atan(p.y, p.x.add(0.00001));
		// Cartesian noise avoids a polar texture seam.
		const n = c.noise(p.mul(4).add(vec2(c.clock.mul(0.3), c.clock.mul(-0.2)))).toVar();
		const edge = r.add(n.sub(0.5).mul(u.turbulence.clamp(0, 1))).toVar();
		const rim = abilityBand(edge.sub(0.73), float(0.035));
		const spiral: any = sin(a.mul(5).add(r.mul(20)).sub(c.clock.mul(3))).mul(0.5).add(0.5);
		const inside: any = smoothstep(0.58, 0.74, edge).oneMinus().mul(spiral.mul(0.3).add(0.12));
		const cutoff = smoothstep(0.88, 0.99, r).oneMinus();
		return c.finish(rim.add(inside).mul(cutoff).mul(smoothstep(0, 0.03, opening)), rim);
	})();
	return abilityShader<AbilityPortalUniforms>(colorNode, u);
}

export interface AbilityBeamOptions extends AbilityEffectOptions {
	/** Leading edge along UV.x, 0..1. Default 1. */
	head?: number;
	/** Trailing edge along UV.x, 0..1. Default 0. */
	tail?: number;
	/** Core width relative to half ribbon width. Default 0.12. */
	coreWidth?: number;
}
export interface AbilityBeamUniforms extends AbilityEffectUniforms {
	head: { value: number };
	tail: { value: number };
	coreWidth: { value: number };
}

/** Single camera-facing ribbon replacing three nested source beam shells.
 * UV.x is length; UV.y spans width. The caller handles orientation. */
export function createAbilityBeam(options: AbilityBeamOptions = {}): ZylemParameterizedShader<AbilityBeamUniforms> {
	const c = abilityContext(options, '#37baff');
	const u: any = { ...c.uniforms, head: uniform(options.head ?? 1), tail: uniform(options.tail ?? 0), coreWidth: uniform(options.coreWidth ?? 0.12) };
	const colorNode = Fn(() => {
		const v: any = uv();
		const d: any = abs(v.y.mul(2).sub(1));
		const core = abilityBand(d, u.coreWidth);
		const halo = d.oneMinus().clamp(0, 1).pow(2);
		const streak = c.noise(vec2(v.x.mul(3).sub(c.clock.mul(4)), v.y.mul(9)));
		const ends: any = smoothstep(0, 0.025, v.x.sub(u.tail.clamp(0, 1)))
			.mul(smoothstep(0, 0.025, u.head.clamp(0, 1).sub(v.x)));
		return c.finish(core.add(halo.mul(streak.mul(0.4).add(0.4))).mul(ends), core);
	})();
	return abilityShader<AbilityBeamUniforms>(colorNode, u);
}

export interface AbilityLightningOptions extends AbilityBeamOptions {
	/** Centerline deflection relative to UV height. Default 0.18. */
	jaggedness?: number;
}
export interface AbilityLightningUniforms extends AbilityBeamUniforms {
	jaggedness: { value: number };
}

/** Bolt on one quad. GPU centerline changes at 12 Hz; no CPU path rebuilding. */
export function createAbilityLightning(options: AbilityLightningOptions = {}): ZylemParameterizedShader<AbilityLightningUniforms> {
	const c = abilityContext(options, '#ad73ff');
	const u: any = { ...c.uniforms, head: uniform(options.head ?? 1), tail: uniform(options.tail ?? 0), coreWidth: uniform(options.coreWidth ?? 0.035), jaggedness: uniform(options.jaggedness ?? 0.18) };
	const colorNode = Fn(() => {
		const v: any = uv();
		const tick = c.clock.mul(12).floor();
		const zig = c.noise(vec2(v.x.mul(22), tick)).sub(0.5)
			.mul(u.jaggedness.clamp(0, 0.4)).mul(sin(v.x.mul(Math.PI)));
		const d: any = abs(v.y.sub(0.5).sub(zig)).mul(2);
		const core = abilityBand(d, u.coreWidth);
		const halo: any = smoothstep(0, 0.3, d).oneMinus().pow(2);
		const ends: any = smoothstep(0, 0.02, v.x.sub(u.tail.clamp(0, 1)))
			.mul(smoothstep(0, 0.02, u.head.clamp(0, 1).sub(v.x)));
		return c.finish(core.add(halo.mul(0.5)).mul(ends), core);
	})();
	return abilityShader<AbilityLightningUniforms>(colorNode, u);
}
