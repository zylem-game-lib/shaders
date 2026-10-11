/** Character deformations, camouflage and atmosphere. All deformations use unlit materials. */
import { FrontSide, type Texture } from 'three';
import { Fn, dot, float, mix, normalView, positionLocal, positionView, positionViewDirection, screenUV, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { catalogContext, catalogNoise, catalogShader, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface RetroMorphOptions extends RetroVfxOptions { progress?: number; amount?: number; baseTexture?: Texture }
export interface RetroMorphUniforms extends RetroVfxUniforms { progress: { value: number }; amount: { value: number } }
function morph(options: RetroMorphOptions, kind: 'growth' | 'shrink' | 'tentacle' | 'spectral'): ZylemParameterizedShader<RetroMorphUniforms> {
	const { u, clock } = catalogContext(options, kind === 'tentacle' ? '#5fc7e6' : '#ac9adb');
	u.progress = uniform(options.progress ?? 0.5); u.amount = uniform(options.amount ?? (kind === 'growth' ? 2 : 0.7));
	const phase: any = u.progress.clamp(0, 1).smoothstep(0, 1);
	const positionNode: any = Fn(() => {
		const p: any = positionLocal;
		if (kind === 'growth') return p.mul(float(1).add(phase.mul(u.amount.max(0))));
		if (kind === 'shrink') return p.mul(float(1).sub(phase.mul(u.amount.clamp(0, 0.95))));
		if (kind === 'tentacle') {
			// Geometry is a tapered Y-axis tube, rooted at y=0. The root stays fixed.
			const h: any = p.y.max(0); const bend: any = h.mul(h).mul(u.amount).mul(phase);
			return p.add(vec3(h.mul(1.5).sub(clock).sin().mul(bend), 0, h.sub(clock.mul(0.7)).cos().mul(bend).mul(0.4)));
		}
		return p.add(vec3(p.y.mul(2).add(clock).sin(), p.x.mul(2).sub(clock).sin().mul(0.35), p.y.add(clock).cos()).mul(phase).mul(u.amount));
	})();
	const colorNode: any = Fn(() => {
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(u.color, 1);
		const flash: any = phase.mul(phase.oneMinus()).mul(4).mul(clock.mul(18).sin().mul(0.5).add(0.5));
		const rim: any = dot(normalView, positionViewDirection).abs().oneMinus().pow(2);
		const rgb: any = kind === 'spectral' ? mix(base.rgb, base.rgb.mul(u.color).add(u.hotColor.mul(rim).mul(0.3)), phase)
			: kind === 'tentacle' ? base.rgb.mul(0.5).add(u.hotColor.mul(rim)) : mix(base.rgb, u.hotColor, flash);
		return vec4(rgb.mul(u.intensity.max(0)), base.a.mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, positionNode, uniforms: u, transparent: true, side: FrontSide };
}
export const createBossGrowth = (options: RetroMorphOptions = {}): ZylemParameterizedShader<RetroMorphUniforms> => morph(options, 'growth');
export const createLightningShrink = (options: RetroMorphOptions = {}): ZylemParameterizedShader<RetroMorphUniforms> => morph(options, 'shrink');
export const createWaterTentacle = (options: RetroMorphOptions = {}): ZylemParameterizedShader<RetroMorphUniforms> => morph(options, 'tentacle');
export const createSpectralMorph = (options: RetroMorphOptions = {}): ZylemParameterizedShader<RetroMorphUniforms> => morph(options, 'spectral');

export interface RetroInvisibilityOptions extends RetroVfxOptions { strength?: number; baseTexture?: Texture }
export interface RetroInvisibilityUniforms extends RetroVfxUniforms { strength: { value: number } }
function invisible(options: RetroInvisibilityOptions, boo: boolean): ZylemParameterizedShader<RetroInvisibilityUniforms> {
	const { u, clock } = catalogContext(options, boo ? '#dcecff' : '#7499ff'); u.strength = uniform(options.strength ?? 0.8);
	const colorNode: any = Fn(() => {
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(1);
		const s: any = u.strength.clamp(0, 1);
		const rim: any = dot(normalView, positionViewDirection).abs().oneMinus().pow(3);
		const shimmer: any = boo ? clock.mul(4).sin().mul(0.1).add(0.2) : uv().y.mul(120).add(clock.mul(8)).sin().mul(0.05).add(0.15);
		return vec4(mix(base.rgb, u.color.add(u.hotColor.mul(rim)), s).mul(u.intensity), base.a.mul(mix(1, rim.mul(0.3).add(shimmer), s)).mul(u.opacity));
	})();
	return { colorNode, uniforms: u, transparent: true, side: FrontSide };
}
export const createVanishCap = (options: RetroInvisibilityOptions = {}): ZylemParameterizedShader<RetroInvisibilityUniforms> => invisible(options, false);
export const createBooInvisibility = (options: RetroInvisibilityOptions = {}): ZylemParameterizedShader<RetroInvisibilityUniforms> => invisible(options, true);

export interface OpticalCamouflageOptions extends RetroInvisibilityOptions {
	/** Required scene image captured WITHOUT the camouflaged object. */ backgroundTexture: Texture;
	distortion?: number;
}
export interface OpticalCamouflageUniforms extends RetroInvisibilityUniforms { distortion: { value: number } }
/** #85: screen-aligned refraction, not alpha-only invisibility. Caller owns background capture. */
export function createOpticalCamouflage(options: OpticalCamouflageOptions): ZylemParameterizedShader<OpticalCamouflageUniforms> {
	const { u, clock } = catalogContext(options, '#8bbbc8'); u.strength = uniform(options.strength ?? 1); u.distortion = uniform(options.distortion ?? 0.02);
	const colorNode: any = Fn(() => {
		const s: any = u.strength.clamp(0, 1);
		const q: any = screenUV.add(normalView.xy.mul(u.distortion).mul(s).mul(clock.mul(2).sin().mul(0.2).add(0.8))).clamp(0, 1);
		const background: any = texture(options.backgroundTexture, q);
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(u.color, 1);
		const rim: any = dot(normalView, positionViewDirection).abs().oneMinus().pow(5);
		return vec4(mix(base.rgb, background.rgb.add(u.color.mul(rim).mul(0.15)), s).mul(u.intensity), base.a.mul(u.opacity));
	})();
	return { colorNode, uniforms: u, transparent: true, side: FrontSide };
}

export interface DistanceFogOptions extends RetroVfxOptions { near?: number; far?: number; baseTexture?: Texture }
export interface DistanceFogUniforms extends RetroVfxUniforms { near: { value: number }; far: { value: number } }
/** #67: material fog based on camera-space distance. Apply consistently to scene meshes. */
export function createDistanceFog(options: DistanceFogOptions = {}): ZylemParameterizedShader<DistanceFogUniforms> {
	const { u } = catalogContext(options, '#697977'); u.near = uniform(options.near ?? 4); u.far = uniform(options.far ?? 18);
	const colorNode: any = Fn(() => {
		const base: any = options.baseTexture ? texture(options.baseTexture, uv()) : vec4(u.hotColor, 1);
		const near: any = u.near.max(0); const far: any = u.far.max(near.add(0.001));
		return vec4(mix(base.rgb, u.color, positionView.length().smoothstep(near, far)).mul(u.intensity), base.a);
	})();
	return { colorNode, uniforms: u };
}

export interface MistAtmosphereOptions extends RetroVfxOptions { density?: number; noiseTexture?: Texture }
export interface MistAtmosphereUniforms extends RetroVfxUniforms { density: { value: number } }
/** #78: height-weighted drifting mist card. Layer sparingly at different scene depths. */
export function createMistAtmosphere(options: MistAtmosphereOptions = {}): ZylemParameterizedShader<MistAtmosphereUniforms> {
	const { u, clock, finish } = catalogContext(options, '#b3b6cb'); u.density = uniform(options.density ?? 0.65);
	const colorNode: any = Fn(() => {
		const p: any = uv(); const noise: any = catalogNoise(p.mul(vec2(5, 2)).add(vec2(clock.mul(0.08), 0)), options.noiseTexture);
		const edges: any = p.x.mul(p.x.oneMinus()).mul(4).mul(p.y.mul(8).clamp(0, 1)).mul(p.y.oneMinus().pow(2));
		return finish(noise.mul(0.5).add(0.5).mul(edges).mul(u.density.max(0)));
	})();
	return catalogShader(u, colorNode, false);
}
