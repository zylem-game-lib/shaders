/** Catalog #24, #31, #48, #65, #81, #96 and #98. */
import { DoubleSide, type Texture } from 'three';
import { Fn, dot, float, mix, normalView, positionLocal, positionViewDirection, texture, uniform, uv, vec3, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { hash2 } from './utils.tsl';
import { catalogContext, catalogNoise, catalogShader, rotateCatalogUV, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface SunsetSilhouetteOptions extends RetroVfxOptions { strength?: number; baseTexture?: Texture }
export type SunsetSilhouetteUniforms = RetroVfxUniforms & { strength: { value: number } };
/** #24: recolor a foreground mesh/sprite into a silhouette; pair with a warm sky. */
export function createSunsetSilhouette(options: SunsetSilhouetteOptions = {}): ZylemParameterizedShader<SunsetSilhouetteUniforms> {
	const { u } = catalogContext(options, '#241528');
	u.strength = uniform(options.strength ?? 1);
	const colorNode: any = Fn(() => {
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(1);
		const rgb: any = mix(base.rgb.mul(u.hotColor), u.color, u.strength.clamp(0, 1)).mul(u.intensity.max(0));
		return vec4(rgb, base.a.mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, side: DoubleSide };
}

export interface DefeatDissolveOptions extends RetroVfxOptions { progress?: number; pixels?: number; baseTexture?: Texture }
export type DefeatDissolveUniforms = RetroVfxUniforms & { progress: { value: number }; pixels: { value: number } };
/** #31: one hash per UV cell erodes a sprite with a colored edge. No noise octaves. */
export function createDefeatDissolve(options: DefeatDissolveOptions = {}): ZylemParameterizedShader<DefeatDissolveUniforms> {
	const { u } = catalogContext(options, '#b271ff');
	u.progress = uniform(options.progress ?? 0.4);
	u.pixels = uniform(options.pixels ?? 32);
	const colorNode: any = Fn(() => {
		const p: any = u.progress.clamp(0, 1);
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(1);
		const field: any = hash2(uv().mul(u.pixels.clamp(2, 256)).floor()).mul(0.75).add(uv().y.mul(0.25));
		const keep: any = p.lessThanEqual(0).select(1, p.greaterThanEqual(1).select(0, field.greaterThan(p).select(1, 0)));
		const edge: any = field.sub(p).abs().smoothstep(0, 0.08).oneMinus().mul(p.mul(10).clamp(0, 1));
		return vec4(mix(base.rgb.mul(u.hotColor), u.color, edge).mul(u.intensity.max(0)), base.a.mul(keep).mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, side: DoubleSide };
}

export interface TwistedCorridorOptions extends RetroVfxOptions { twist?: number; baseTexture?: Texture }
export type TwistedCorridorUniforms = RetroVfxUniforms & { twist: { value: number } };
/** #48: rotate local XY cross-sections around Z. Requires subdivisions along Z; unlit. */
export function createTwistedCorridor(options: TwistedCorridorOptions = {}): ZylemParameterizedShader<TwistedCorridorUniforms> {
	const { u, clock } = catalogContext({ ...options, speed: options.speed ?? 0 }, '#6f9dc4');
	u.twist = uniform(options.twist ?? 0.3);
	const positionNode: any = Fn(() => {
		const p: any = positionLocal;
		const xy: any = rotateCatalogUV(p.xy, p.z.mul(u.twist).add(clock));
		return vec3(xy, p.z);
	})();
	const colorNode: any = Fn(() => {
		const tiles: any = uv().mul(12).floor();
		const checker: any = tiles.x.add(tiles.y).mod(2).mul(0.6).add(0.4);
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()).rgb : vec3(checker);
		return vec4(base.mul(u.color).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, positionNode, uniforms: u, side: DoubleSide };
}

export interface GoldenGlintOptions extends RetroVfxOptions { sharpness?: number }
export type GoldenGlintUniforms = RetroVfxUniforms & { sharpness: { value: number } };
/** #65: moving reflective-looking gold highlight on a mesh, with no environment capture. */
export function createGoldenGlint(options: GoldenGlintOptions = {}): ZylemParameterizedShader<GoldenGlintUniforms> {
	const { u, clock } = catalogContext(options, '#ffc443');
	u.sharpness = uniform(options.sharpness ?? 40);
	const colorNode: any = Fn(() => {
		const direction: any = vec3(clock.mul(0.8).cos(), 0.7, clock.mul(0.8).sin()).normalize();
		const highlight: any = dot(normalView, direction).max(0).pow(u.sharpness.clamp(1, 128));
		const facing: any = dot(normalView, positionViewDirection).abs().clamp(0, 1);
		return vec4(u.color.mul(facing.mul(0.6).add(0.25)).add(u.hotColor.mul(highlight)).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, uniforms: u };
}

export interface MistFormOptions extends RetroVfxOptions { turbulence?: number; maskTexture?: Texture; noiseTexture?: Texture }
export type MistFormUniforms = RetroVfxUniforms & { turbulence: { value: number } };
/** #81: oval vapor body, optionally constrained by a caller-owned linear red silhouette mask. */
export function createMistForm(options: MistFormOptions = {}): ZylemParameterizedShader<MistFormUniforms> {
	const { u, clock, finish } = catalogContext({ ...options, opacity: options.opacity ?? 0.65 }, '#adc4dc');
	u.turbulence = uniform(options.turbulence ?? 0.7);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const cloud: any = catalogNoise(p.mul(6).add(vec3(clock.mul(0.35), clock.mul(-0.15), 0).xy), options.noiseTexture);
		const oval: any = p.sub(0.5).mul(vec3(1.5, 1, 0).xy).length().smoothstep(0.15, 0.48).oneMinus();
		const mask: any = options.maskTexture ? texture(options.maskTexture, p).r.clamp(0, 1) : float(1);
		return finish(oval.mul(mix(1, cloud.smoothstep(0.15, 0.8), u.turbulence.clamp(0, 1))).mul(mask));
	})();
	return catalogShader(u, colorNode, false);
}

export interface PortalPreviewOptions extends RetroVfxOptions {
	/** Required caller-owned destination image/render-target texture. */ previewTexture: Texture;
	/** UV-space portal radius. Default 0.43. */ radius?: number;
	/** Soft boundary width. Default 0.02. */ softness?: number;
}
export type PortalPreviewUniforms = RetroVfxUniforms & { radius: { value: number }; softness: { value: number } };
/** #96: show a destination texture through a circular aperture; destination rendering is external. */
export function createPortalPreview(options: PortalPreviewOptions): ZylemParameterizedShader<PortalPreviewUniforms> {
	const { u, clock } = catalogContext(options, '#a99aff');
	u.radius = uniform(options.radius ?? 0.43);
	u.softness = uniform(options.softness ?? 0.02);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const base: any = texture(options.previewTexture, p);
		const d: any = p.sub(0.5).length();
		const radius: any = u.radius.clamp(0.02, 0.49);
		const width: any = u.softness.clamp(0.001, 0.1);
		const aperture: any = d.smoothstep(radius.sub(width), radius).oneMinus();
		const border: any = d.sub(radius.sub(width)).abs().smoothstep(0, width.mul(2)).oneMinus();
		const pulse: any = clock.mul(3).sin().mul(0.15).add(0.85);
		return vec4(base.rgb.add(u.color.mul(border).mul(pulse)).mul(u.intensity.max(0)), aperture.mul(base.a).mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, side: DoubleSide };
}

export interface QuakeWaveOptions extends RetroVfxOptions {
	/** Wave front along local Z. */ front?: number;
	amplitude?: number;
	/** Envelope half-length in local units. */ width?: number;
}
export type QuakeWaveUniforms = RetroVfxUniforms & { front: { value: number }; amplitude: { value: number }; width: { value: number } };
/** #98: localized traveling track disturbance. Subdivide a local XZ road along Z. */
export function createQuakeWave(options: QuakeWaveOptions = {}): ZylemParameterizedShader<QuakeWaveUniforms> {
	const { u, clock } = catalogContext({ ...options, speed: options.speed ?? 0 }, '#527d9c');
	u.front = uniform(options.front ?? 0);
	u.amplitude = uniform(options.amplitude ?? 0.8);
	u.width = uniform(options.width ?? 2);
	const positionNode: any = Fn(() => {
		const distance: any = positionLocal.z.sub(u.front).sub(clock);
		const width: any = u.width.max(0.001);
		const envelope: any = distance.abs().smoothstep(0, width).oneMinus();
		const lift: any = distance.div(width).mul(Math.PI * 2).cos().mul(envelope).mul(u.amplitude);
		return positionLocal.add(vec3(0, lift, 0));
	})();
	const colorNode: any = Fn(() => {
		const stripes: any = uv().y.mul(24).fract().smoothstep(0.1, 0.2);
		return vec4(mix(u.hotColor, u.color, stripes).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, positionNode, uniforms: u, side: DoubleSide };
}
