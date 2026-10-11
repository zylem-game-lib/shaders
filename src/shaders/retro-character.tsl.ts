/**
 * Catalog #1, #2 and #36. Original, inexpensive interpretations; no game assets.
 */
import { Color, type ColorRepresentation, type Texture } from 'three';
import { Fn, dot, float, matcapUV, mix, normalView, positionViewDirection, texture, uniform, uv, vec3, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader, ZylemShaderUniforms } from '../types';
import { retroClock, retroPalette, type RetroAnimationOptions, type RetroAnimationUniforms } from './retro-common.tsl';

export interface PaletteCycleOptions extends RetroAnimationOptions {
	color?: ColorRepresentation;
	/** Caller-owned color texture; set colorSpace to SRGBColorSpace for sRGB art. */
	baseTexture?: Texture;
	/** 0 = original color, 1 = animated palette. Default 1. */
	strength?: number;
	/** Enable alpha blending for a sprite texture. Baked; default false. */
	transparent?: boolean;
}

export interface PaletteCycleUniforms extends RetroAnimationUniforms {
	color: { value: Color };
	strength: { value: number };
}

/** Preserve source luminance and alpha while cycling hue. One optional texture sample. */
export function createPaletteCycle(options: PaletteCycleOptions = {}): ZylemParameterizedShader<PaletteCycleUniforms> {
	const { uniforms: u, clock } = retroClock(options);
	u.color = uniform(new Color(options.color ?? '#ffffff'));
	u.strength = uniform(options.strength ?? 1);
	const colorNode: any = Fn(() => {
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(1);
		const rgb: any = base.rgb.mul(u.color);
		const luminance: any = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
		const hue: any = retroPalette(clock).mul(0.8).add(0.2);
		const tinted: any = hue.mul(luminance.div(dot(hue, vec3(0.2126, 0.7152, 0.0722)).max(0.001)));
		return vec4(mix(rgb, tinted, u.strength.clamp(0, 1)), base.a);
	})();
	return { colorNode, uniforms: u, transparent: options.transparent ?? false };
}

export interface GhostOptions {
	color?: ColorRepresentation;
	baseTexture?: Texture;
	/** Optional linear-data red mask: 1 keeps facial details fully opaque. */
	detailMask?: Texture;
	/** 0..1 body opacity. Default 0.3. */
	opacity?: number;
	/** Rim tint strength. Default 0.6. */
	rimStrength?: number;
}

export interface GhostUniforms extends ZylemShaderUniforms {
	color: { value: Color };
	opacity: { value: number };
	rimStrength: { value: number };
}

/** Translucent body with a view-dependent rim and optional opaque facial details. */
export function createGhost(options: GhostOptions = {}): ZylemParameterizedShader<GhostUniforms> {
	const u: any = {
		color: uniform(new Color(options.color ?? '#b8d9ff')),
		opacity: uniform(options.opacity ?? 0.3),
		rimStrength: uniform(options.rimStrength ?? 0.6),
	};
	const colorNode: any = Fn(() => {
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(1);
		const details: any = options.detailMask ? texture(options.detailMask, uv()).r.clamp(0, 1) : float(0);
		const rim: any = dot(normalView, positionViewDirection).abs().clamp(0, 1).oneMinus().pow(2);
		const rgb: any = base.rgb.mul(mix(u.color, vec3(1), rim.mul(u.rimStrength).clamp(0, 1)));
		const opacity: any = mix(u.opacity.clamp(0, 1), 1, details);
		return vec4(rgb, base.a.mul(opacity));
	})();
	return { colorNode, uniforms: u, transparent: true };
}

export interface RetroMetalOptions {
	color?: ColorRepresentation;
	/** Optional caller-owned matcap. Without one, synthesize reflection-like bands. */
	matcapTexture?: Texture;
	/** Nonnegative brightness. Default 1. */
	intensity?: number;
	/** Contrast of the synthesized bands, 0..1. Default 0.8. */
	contrast?: number;
}

export interface RetroMetalUniforms extends ZylemShaderUniforms {
	color: { value: Color };
	intensity: { value: number };
	contrast: { value: number };
}

/** Opaque matcap-style metal; no environment capture, ray tracing or extra pass. */
export function createRetroMetal(options: RetroMetalOptions = {}): ZylemParameterizedShader<RetroMetalUniforms> {
	const u: any = {
		color: uniform(new Color(options.color ?? '#bddec9')),
		intensity: uniform(options.intensity ?? 1),
		contrast: uniform(options.contrast ?? 0.8),
	};
	const colorNode: any = Fn(() => {
		const p: any = matcapUV;
		let reflection: any;
		if (options.matcapTexture) {
			reflection = texture(options.matcapTexture, p).rgb;
		} else {
			const band: any = p.y.mul(18).add(p.x.mul(5)).sin().mul(0.5).add(0.5);
			const shine: any = p.sub(0.65).length().mul(3).oneMinus().clamp(0, 1).pow(4);
			reflection = vec3(mix(0.45, band.mul(0.85).add(0.08), u.contrast.clamp(0, 1)).add(shine));
		}
		return vec4(reflection.mul(u.color).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, uniforms: u };
}
