/** Catalog #30 and #44: preserve the current chain and use caller-supplied reveal imagery. */
import { Color, Vector2, type ColorRepresentation, type Texture } from 'three';
import { Fn, float, mix, screenSize, texture, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemPostEffect, ZylemShaderUniforms } from '../types';

export interface SpellEmphasisOptions {
	color?: ColorRepresentation;
	strength?: number;
	/** Optional linear red mask: 1 protects the target from darkening. */ targetMask?: Texture;
}
export interface SpellEmphasisUniforms extends ZylemShaderUniforms { color: { value: Color }; strength: { value: number } }
export interface SpellEmphasisEffect { effect: ZylemPostEffect; uniforms: SpellEmphasisUniforms }
/** #30: tint/darken the battle view while optionally protecting the spell target. */
export function createSpellEmphasisEffect(options: SpellEmphasisOptions = {}): SpellEmphasisEffect {
	const u: any = { color: uniform(new Color(options.color ?? '#20233d')), strength: uniform(options.strength ?? 0.8) };
	const effect: ZylemPostEffect = inputNode => Fn(() => {
		const base: any = vec4(inputNode);
		const protectedArea: any = options.targetMask ? texture(options.targetMask, uv()).r.clamp(0, 1) : float(0);
		const amount: any = u.strength.clamp(0, 1).mul(protectedArea.oneMinus());
		return vec4(mix(base.rgb, base.rgb.mul(u.color), amount), base.a);
	})();
	return { effect, uniforms: u };
}

export interface TruthLensOptions {
	/** Required caller-owned alternate scene image, aligned to the current input. */ revealTexture: Texture;
	center?: { x: number; y: number };
	/** In screen-height units. */ radius?: number;
	softness?: number;
	strength?: number;
}
export interface TruthLensUniforms extends ZylemShaderUniforms {
	center: { value: Vector2 }; radius: { value: number }; softness: { value: number }; strength: { value: number };
}
export interface TruthLensEffect { effect: ZylemPostEffect; uniforms: TruthLensUniforms }
/** #44: circular reveal composite. Caller renders hidden/illusory objects into revealTexture. */
export function createTruthLensEffect(options: TruthLensOptions): TruthLensEffect {
	const u: any = {
		center: uniform(new Vector2(options.center?.x ?? 0.5, options.center?.y ?? 0.5)),
		radius: uniform(options.radius ?? 0.25), softness: uniform(options.softness ?? 0.015), strength: uniform(options.strength ?? 1),
	};
	const effect: ZylemPostEffect = inputNode => Fn(() => {
		const p: any = uv();
		const base: any = vec4(inputNode);
		const hidden: any = texture(options.revealTexture, p);
		const d: any = p.sub(u.center).mul(vec2(screenSize.x.div(screenSize.y.max(1)), 1)).length();
		const radius: any = u.radius.max(0);
		const width: any = u.softness.max(0.0001);
		const mask: any = d.smoothstep(radius.sub(width).max(0), radius.max(width)).oneMinus();
		// Radius 0 and strength 0 are exact identity controls.
		const amount: any = mask.mul(u.strength.clamp(0, 1)).mul(radius.greaterThan(0).select(1, 0));
		return mix(base, hidden, amount);
	})();
	return { effect, uniforms: u };
}
