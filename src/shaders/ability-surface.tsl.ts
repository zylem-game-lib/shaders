/**
 * Bounded-cost surface interpretations of AbilityCastingThreeJS materials.
 * See THIRD_PARTY_NOTICES.md. Geometry/resource ownership stays external.
 */
import { FrontSide } from 'three';
import { Fn, abs, cameraPosition, dot, mix, normalLocal, normalWorld, normalize, positionLocal, positionWorld, sin, smoothstep, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { abilityContext, abilityShader, type AbilityEffectOptions, type AbilityEffectUniforms } from './ability-common.tsl';

export interface AbilityFlameOptions extends AbilityEffectOptions {
	/** Flame height in UV.y, 0..1. Default 1. */
	height?: number;
	/** Pattern density. Default 6. */
	noiseScale?: number;
}
export interface AbilityFlameUniforms extends AbilityEffectUniforms {
	height: { value: number };
	noiseScale: { value: number };
}

/** Rising fire on an upright quad or open cylinder. UV.y=0 is the base. */
export function createAbilityFlame(options: AbilityFlameOptions = {}): ZylemParameterizedShader<AbilityFlameUniforms> {
	const c = abilityContext({ hotColor: '#fff3af', ...options }, '#ff4c08');
	const u: any = { ...c.uniforms, height: uniform(options.height ?? 1), noiseScale: uniform(options.noiseScale ?? 6) };
	const colorNode = Fn(() => {
		const v: any = uv();
		const n = c.noise(vec2(v.x.mul(u.noiseScale), v.y.mul(3).sub(c.clock.mul(2)))).toVar();
		const field = u.height.clamp(0, 1).mul(n.mul(0.55).add(0.4)).sub(v.y);
		const edge: any = smoothstep(0, 0.045, v.x).mul(smoothstep(0, 0.045, v.x.oneMinus()));
		const alpha: any = smoothstep(0, 0.12, field).mul(smoothstep(0, 0.03, v.y)).mul(edge);
		return c.finish(alpha, field.mul(1.6));
	})();
	return abilityShader<AbilityFlameUniforms>(colorNode, u);
}

export interface AbilityBurstOptions extends AbilityEffectOptions {
	/** Lifetime progress; invisible at 0 and 1. Default 0.25. */
	progress?: number;
	/** Baked local-unit displacement. Default 0.08; 0 omits positionNode. */
	displacement?: number;
}
export interface AbilityBurstUniforms extends AbilityEffectUniforms {
	progress: { value: number };
}

/** Expanding energy shell on a UV sphere, with dissolving lifetime. */
export function createAbilityBurst(options: AbilityBurstOptions = {}): ZylemParameterizedShader<AbilityBurstUniforms> {
	const c = abilityContext(options, '#ff862b');
	const u: any = { ...c.uniforms, progress: uniform(options.progress ?? 0.25) };
	const colorNode = Fn(() => {
		const p = u.progress.clamp(0, 1);
		const view: any = normalize(cameraPosition.sub(positionWorld));
		const rim: any = abs(dot(normalize(normalWorld), view)).oneMinus().clamp(0, 1).pow(2);
		const n = c.noise(uv().mul(8).add(vec2(0, c.clock.mul(-0.5))));
		const erosion: any = smoothstep(p.mul(1.15).sub(0.15), p.mul(1.15), n);
		const life: any = smoothstep(0, 0.08, p).mul(p.oneMinus());
		return c.finish(rim.mul(0.8).add(0.2).mul(erosion).mul(life), rim);
	})();
	const shader = abilityShader<AbilityBurstUniforms>(colorNode, u);
	shader.side = FrontSide;
	const displacement = options.displacement ?? 0.08;
	if (displacement !== 0) {
		shader.positionNode = Fn(() => {
			const p = u.progress.clamp(0, 1);
			// One vertex-stage sine replaces layered 3D FBM/ridged noise.
			const phase: any = dot(positionLocal, vec3(7, 11, 5));
			const wobble: any = sin(phase.add(c.clock.mul(3))).mul(displacement);
			return positionLocal.mul(p.mul(0.8).add(0.2)).add(normalLocal.mul(wobble.mul(p.oneMinus())));
		})();
	}
	return shader;
}

export interface AbilityAuraOptions extends AbilityEffectOptions {
	/** Fraction revealed from the bottom, 0..1. Default 1. */
	progress?: number;
	/** Rim exponent. Default 2. */
	rimPower?: number;
}
export interface AbilityAuraUniforms extends AbilityEffectUniforms {
	progress: { value: number };
	rimPower: { value: number };
}

/** Summoning column on an open cylinder, UV.y=0 at its base. */
export function createAbilityAura(options: AbilityAuraOptions = {}): ZylemParameterizedShader<AbilityAuraUniforms> {
	const c = abilityContext(options, '#5bffd5');
	const u: any = { ...c.uniforms, progress: uniform(options.progress ?? 1), rimPower: uniform(options.rimPower ?? 2) };
	const colorNode = Fn(() => {
		const v: any = uv();
		const view: any = normalize(cameraPosition.sub(positionWorld));
		const rim: any = abs(dot(normalize(normalWorld), view)).oneMinus().clamp(0, 1).pow(u.rimPower.max(0.1));
		const streak = c.noise(vec2(v.x.mul(16), v.y.mul(2).sub(c.clock.mul(2))));
		const rise: any = smoothstep(0, 0.04, u.progress.clamp(0, 1).sub(v.y));
		const fade = v.y.oneMinus().clamp(0, 1).pow(2).mul(smoothstep(0, 0.02, v.y));
		return c.finish(rim.mul(0.7).add(0.2).mul(streak.mul(0.6).add(0.4)).mul(rise).mul(fade), streak.mul(0.4));
	})();
	return abilityShader<AbilityAuraUniforms>(colorNode, u);
}

export interface AbilityCrystalOptions extends AbilityEffectOptions {
	/** Emissive charge, 0..1. Default 0.5. */
	charge?: number;
}
export interface AbilityCrystalUniforms extends AbilityEffectUniforms {
	charge: { value: number };
}

/** Opaque stylized amethyst; no refraction or lighting pass.
 * opacity/maskTexture do not apply to this opaque material. */
export function createAbilityCrystal(options: AbilityCrystalOptions = {}): ZylemParameterizedShader<AbilityCrystalUniforms> {
	const c = abilityContext(options, '#6929ac');
	const u: any = { ...c.uniforms, charge: uniform(options.charge ?? 0.5) };
	const colorNode = Fn(() => {
		const n = c.noise(uv().mul(9)).toVar();
		const view: any = normalize(cameraPosition.sub(positionWorld));
		const rim: any = abs(dot(normalize(normalWorld), view)).oneMinus().clamp(0, 1).pow(3);
		const veins: any = smoothstep(0.035, 0.085, abs(n.sub(0.5))).oneMinus();
		const facet: any = dot(normalize(normalWorld), normalize(vec3(0.3, 1, 0.5))).mul(0.25).add(0.65);
		const pulse: any = sin(c.clock.mul(3)).mul(0.15).add(0.85);
		const base: any = mix(u.color, u.hotColor, n.mul(0.25)).mul(facet);
		const glow = u.hotColor.mul(veins.mul(0.45).add(rim)).mul(u.charge.clamp(0, 1)).mul(pulse);
		return vec4(base.add(glow).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, uniforms: u, transparent: false, side: FrontSide };
}
