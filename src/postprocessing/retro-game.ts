/** Catalog #17 and #87. Transform the current pipeline; never re-render the scene. */
import { Fn, convertToTexture, dot, mix, screenCoordinate, screenSize, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { ZylemPostEffect } from '../types';
import { retroClock, type RetroAnimationOptions, type RetroAnimationUniforms } from '../shaders/retro-common.tsl';
import { hash2 } from '../shaders/utils.tsl';

export interface FuzzyScreenOptions extends RetroAnimationOptions {
	/** 0 = unchanged input, 1 = full distortion. Default 1. */
	strength?: number;
	/** Horizontal displacement as a fraction of screen width. Default 0.018. */
	amplitude?: number;
	/** Vertical wave cycles. Default 3. */
	frequency?: number;
}
export interface FuzzyScreenUniforms extends RetroAnimationUniforms {
	strength: { value: number };
	amplitude: { value: number };
	frequency: { value: number };
}
export interface FuzzyScreenEffect {
	effect: ZylemPostEffect;
	uniforms: FuzzyScreenUniforms;
}

/**
 * One sample at warped UVs. Put before color-only effects: convertToTexture
 * reuses a texture/pass, but may allocate an intermediate for a composed node.
 */
export function createFuzzyScreenEffect(options: FuzzyScreenOptions = {}): FuzzyScreenEffect {
	const { uniforms: u, clock } = retroClock(options);
	u.strength = uniform(options.strength ?? 1);
	u.amplitude = uniform(options.amplitude ?? 0.018);
	u.frequency = uniform(options.frequency ?? 3);
	const effect: ZylemPostEffect = inputNode => {
		const source: any = convertToTexture(inputNode);
		return Fn(() => {
			const p: any = uv();
			const amount: any = u.amplitude.mul(u.strength.clamp(0, 1));
			const dx: any = p.y.mul(u.frequency).mul(Math.PI * 2).add(clock.mul(2)).sin().mul(amount);
			const dy: any = p.x.mul(Math.PI * 2).sub(clock.mul(1.3)).sin().mul(amount).mul(0.35);
			// Half-texel clamp avoids sampling beyond the input at either edge.
			const inset: any = vec2(0.5).div(screenSize.max(vec2(1)));
			const warped: any = p.add(vec2(dx, dy)).clamp(inset, inset.oneMinus());
			return source.sample(warped);
		})();
	};
	return { effect, uniforms: u };
}

export interface NightVisionOptions extends RetroAnimationOptions {
	/** 0 = original scene, 1 = green treatment. Default 1. */
	strength?: number;
	/** Nonnegative exposure gain. Default 2. */
	gain?: number;
	/** Grain amplitude in linear color. Default 0.025. */
	grain?: number;
	/** Edge darkening, 0..1. Default 0.5. */
	vignette?: number;
}
export interface NightVisionUniforms extends RetroAnimationUniforms {
	strength: { value: number };
	gain: { value: number };
	grain: { value: number };
	vignette: { value: number };
}
export interface NightVisionEffect {
	effect: ZylemPostEffect;
	uniforms: NightVisionUniforms;
}

/** Luminance remap plus one hash; preserves input alpha and needs no history buffer. */
export function createNightVisionEffect(options: NightVisionOptions = {}): NightVisionEffect {
	const { uniforms: u, clock } = retroClock(options);
	u.strength = uniform(options.strength ?? 1);
	u.gain = uniform(options.gain ?? 2);
	u.grain = uniform(options.grain ?? 0.025);
	u.vignette = uniform(options.vignette ?? 0.5);
	const effect: ZylemPostEffect = inputNode => Fn(() => {
		const base: any = vec4(inputNode);
		const luminance: any = dot(base.rgb, vec3(0.2126, 0.7152, 0.0722)).max(0);
		const boosted: any = luminance.mul(u.gain.max(0)).sqrt();
		const noise: any = hash2(screenCoordinate.add(clock.mul(30).floor())).sub(0.5).mul(u.grain.max(0));
		const edge: any = uv().sub(0.5).length().smoothstep(0.2, 0.71);
		const shade: any = edge.mul(u.vignette.clamp(0, 1)).oneMinus();
		const green: any = vec3(0.12, 1, 0.18).mul(boosted.add(noise).max(0)).mul(shade);
		return vec4(mix(base.rgb, green, u.strength.clamp(0, 1)), base.a);
	})();
	return { effect, uniforms: u };
}
