/**
 * AbilityCastingThreeJS-inspired effects. See THIRD_PARTY_NOTICES.md.
 * TSL internals use explicit loose node boundaries, like utils.tsl.ts, to
 * avoid expanding Three.js's recursive inferred node types across factories.
 */
import { AdditiveBlending, Color, type ColorRepresentation, DoubleSide, type Texture } from 'three';
import { abs, float, fwidth, max, mix, smoothstep, texture, time, uniform, uv, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { valueNoise2d } from './utils.tsl';

export interface AbilityEffectOptions {
	color?: ColorRepresentation;
	hotColor?: ColorRepresentation;
	/** Nonnegative brightness multiplier. Default 1. */
	intensity?: number;
	/** 0..1. Default 1. */
	opacity?: number;
	speed?: number;
	/** Deterministic phase offset. Default 0. */
	seed?: number;
	/** Baked: one noise layer (low, default) or two (high). */
	detail?: 'low' | 'high';
	/** Baked, caller-owned linear-data texture; red channel, RepeatWrapping. */
	noiseTexture?: Texture;
	/** Baked, caller-owned linear-data texture; red channel masks opacity. */
	maskTexture?: Texture;
	/** Baked: use uniforms.time instead of renderer time. Default false. */
	manualTime?: boolean;
}

export interface AbilityEffectUniforms {
	color: { value: Color };
	hotColor: { value: Color };
	intensity: { value: number };
	opacity: { value: number };
	speed: { value: number };
	seed: { value: number };
	time: { value: number };
	[key: string]: { value: any };
}

interface AbilityContext {
	uniforms: any;
	clock: any;
	noise: (p: any) => any;
	finish: (field: any, heat?: any) => any;
}

export function abilityContext(options: AbilityEffectOptions, color: string): AbilityContext {
	const uniforms: any = {
		color: uniform(new Color(options.color ?? color)),
		hotColor: uniform(new Color(options.hotColor ?? '#ffffff')),
		intensity: uniform(options.intensity ?? 1),
		opacity: uniform(options.opacity ?? 1),
		speed: uniform(options.speed ?? 1),
		seed: uniform(options.seed ?? 0),
		time: uniform(0),
	};
	const clock: any = (options.manualTime ? uniforms.time : time).mul(uniforms.speed);
	// Textures are not allocated, mutated or disposed by shader factories.
	const noiseMap: any = options.noiseTexture ? texture(options.noiseTexture) : null;
	const maskMap: any = options.maskTexture ? texture(options.maskTexture) : null;
	const noise = (p: any): any => {
		const q = p.add(uniforms.seed);
		const first = noiseMap ? noiseMap.sample(q.mul(0.125)).r : valueNoise2d(q);
		if (options.detail !== 'high') return first;
		const second = noiseMap
			? noiseMap.sample(q.mul(0.25).add(0.37)).r
			: valueNoise2d(q.mul(2).add(7.3));
		return first.mul(0.67).add(second.mul(0.33));
	};
	const finish = (field: any, heat: any = float(0)): any => {
		const mask: any = maskMap ? maskMap.sample(uv()).r : float(1);
		const alpha = field.clamp(0, 1).mul(uniforms.opacity.clamp(0, 1)).mul(mask.clamp(0, 1));
		const tint: any = mix(uniforms.color, uniforms.hotColor, heat.clamp(0, 1));
		return vec4(tint.mul(max(uniforms.intensity, 0)), alpha);
	};
	return { uniforms, clock, noise, finish };
}

/** Derivative-antialiased distance band with ordered smoothstep edges. */
export function abilityBand(distance: any, width: any): any {
	const aa: any = max(fwidth(distance), 0.001);
	const w: any = max(width, 0.001);
	return smoothstep(w, w.add(aa), abs(distance)).oneMinus();
}

export function abilityShader<U extends AbilityEffectUniforms>(
	colorNode: any, uniforms: U,
): ZylemParameterizedShader<U> {
	return { colorNode, uniforms, transparent: true, blending: AdditiveBlending, side: DoubleSide, depthTest: true };
}
