/** Catalog #19, #21, #22, #23, #27 and #39. Fixed layer counts, no simulation/history. */
import type { Texture } from 'three';
import { Fn, atan, fwidth, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { retroPalette } from './retro-common.tsl';
import { hash2 } from './utils.tsl';
import { catalogBand, catalogContext, catalogLife, catalogNoise, catalogShader, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface ForegroundMistOptions extends RetroVfxOptions { scale?: number; noiseTexture?: Texture }
export type ForegroundMistUniforms = RetroVfxUniforms & { scale: { value: number } };
/** #19: two independently drifting fog layers on a normal-blended foreground plane. */
export function createForegroundMist(options: ForegroundMistOptions = {}): ZylemParameterizedShader<ForegroundMistUniforms> {
	const { u, clock, finish } = catalogContext({ ...options, opacity: options.opacity ?? 0.45 }, '#c0d1de');
	u.scale = uniform(options.scale ?? 4);
	const colorNode: any = Fn(() => {
		const p: any = uv().mul(vec2(u.scale.max(0.1), u.scale.max(0.1).mul(0.6)));
		const a: any = catalogNoise(p.add(vec2(clock.mul(0.13), 0)), options.noiseTexture);
		const b: any = catalogNoise(p.mul(1.7).add(vec2(clock.mul(-0.09), 7.1)), options.noiseTexture);
		const vertical: any = uv().y.smoothstep(0, 0.1).mul(uv().y.smoothstep(0.5, 1).oneMinus());
		return finish(a.mul(0.6).add(b.mul(0.4)).smoothstep(0.25, 0.8).mul(vertical));
	})();
	return catalogShader(u, colorNode, false);
}

export interface PsiOverlayOptions extends RetroVfxOptions { progress?: number; frequency?: number }
export type PsiOverlayUniforms = RetroVfxUniforms & { progress: { value: number }; frequency: { value: number } };
/** #21: moving concentric diamonds and palette pulses; overlay above the battle view. */
export function createPsiOverlay(options: PsiOverlayOptions = {}): ZylemParameterizedShader<PsiOverlayUniforms> {
	const { u, clock, finish } = catalogContext(options, '#ed62ff');
	u.progress = uniform(options.progress ?? 0.5);
	u.frequency = uniform(options.frequency ?? 7);
	const colorNode: any = Fn(() => {
		const q: any = uv().sub(0.5).abs();
		const diamonds: any = q.x.add(q.y).mul(u.frequency.max(0.1)).sub(clock);
		const line: any = catalogBand(diamonds.fract().sub(0.5), 0.09);
		const rgb: any = retroPalette(diamonds.mul(0.15).add(clock.mul(0.2))).mul(u.color).mul(u.intensity.max(0));
		return vec4(rgb, finish(line.mul(catalogLife(u.progress))).a);
	})();
	return catalogShader(u, colorNode);
}

export interface LayeredRainOptions extends RetroVfxOptions { density?: number; wind?: number }
export type LayeredRainUniforms = RetroVfxUniforms & { density: { value: number }; wind: { value: number } };
/** #22: two streak grids with different scales/speeds, on one screen-facing plane. */
export function createLayeredRain(options: LayeredRainOptions = {}): ZylemParameterizedShader<LayeredRainUniforms> {
	const { u, clock, finish } = catalogContext({ ...options, opacity: options.opacity ?? 0.55 }, '#b4dbf6');
	u.density = uniform(options.density ?? 35);
	u.wind = uniform(options.wind ?? 0.2);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const layer = (scale: number, rate: number): any => {
			const count: any = u.density.clamp(4, 120).mul(scale);
			const q: any = vec2(p.x.add(p.y.mul(u.wind)).mul(count), p.y.mul(count.mul(0.25)).add(clock.mul(rate)));
			const cell: any = q.floor();
			const f: any = q.fract();
			const random: any = hash2(cell);
			const x: any = f.x.sub(random.mul(0.5).add(0.25));
			const streak: any = catalogBand(x, 0.025);
			const length: any = f.y.smoothstep(0, 0.1).mul(f.y.smoothstep(0.2, 0.9).oneMinus());
			return streak.mul(length).mul(random.mul(0.5).add(0.5));
		};
		return finish(layer(1, 5).add(layer(0.6, 3).mul(0.65)));
	})();
	return catalogShader(u, colorNode, false);
}

export interface SnowLayersOptions extends RetroVfxOptions { density?: number; wind?: number }
export type SnowLayersUniforms = RetroVfxUniforms & { density: { value: number }; wind: { value: number } };
/** #23: two independently drifting layers of procedural flakes. Apparent, not physical, depth. */
export function createSnowLayers(options: SnowLayersOptions = {}): ZylemParameterizedShader<SnowLayersUniforms> {
	const { u, clock, finish } = catalogContext({ ...options, opacity: options.opacity ?? 0.8 }, '#eff6ff');
	u.density = uniform(options.density ?? 12);
	u.wind = uniform(options.wind ?? 0.3);
	const colorNode: any = Fn(() => {
		const layer = (scale: number, rate: number): any => {
			const q: any = uv().mul(u.density.clamp(3, 45).mul(scale))
				.add(vec2(clock.mul(u.wind).mul(rate), clock.mul(rate)));
			const cell: any = q.floor();
			const random: any = hash2(cell);
			const center: any = vec2(random, hash2(cell.add(31.7))).mul(0.5).add(0.25);
			const d: any = q.fract().sub(center).length();
			const radius: any = random.mul(0.06).add(0.035);
			return d.smoothstep(radius, radius.add(fwidth(d).max(0.001))).oneMinus();
		};
		return finish(layer(1, 0.6).add(layer(1.7, 0.35).mul(0.5)));
	})();
	return catalogShader(u, colorNode, false);
}

export interface RotatingTunnelOptions extends RetroVfxOptions { rings?: number; segments?: number }
export type RotatingTunnelUniforms = RetroVfxUniforms & { rings: { value: number }; segments: { value: number } };
/** #27: opaque polar tunnel backdrop; guard the center instead of dividing by radius. */
export function createRotatingTunnel(options: RotatingTunnelOptions = {}): ZylemParameterizedShader<RotatingTunnelUniforms> {
	const { u, clock } = catalogContext(options, '#956bff');
	u.rings = uniform(options.rings ?? 7);
	u.segments = uniform(options.segments ?? 10);
	const colorNode: any = Fn(() => {
		const q: any = uv().sub(0.5);
		const d: any = q.length().max(0.008);
		const angle: any = atan(q.y, q.x.add(0.00001)).add(clock.mul(0.5));
		const radial: any = d.log().mul(u.rings.clamp(1, 20)).add(clock.mul(3)).sin();
		const angular: any = angle.mul(u.segments.clamp(3, 24).floor()).cos();
		const tiles: any = radial.mul(angular).mul(0.5).add(0.5);
		const shade: any = d.smoothstep(0.008, 0.2);
		return vec4(u.color.mul(tiles.mul(0.7).add(0.12)).add(u.hotColor.mul(catalogBand(radial, 0.03).mul(0.15))).mul(shade).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, uniforms: u };
}

export interface SwimmingWakeOptions extends RetroVfxOptions { strength?: number; spread?: number }
export type SwimmingWakeUniforms = RetroVfxUniforms & { strength: { value: number }; spread: { value: number } };
/** #39: V-shaped widening foam and a waterline ring. Align V=1 with the swimmer. */
export function createSwimmingWake(options: SwimmingWakeOptions = {}): ZylemParameterizedShader<SwimmingWakeUniforms> {
	const { u, clock, finish } = catalogContext(options, '#b8f4ff');
	u.strength = uniform(options.strength ?? 0.8);
	u.spread = uniform(options.spread ?? 0.4);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const age: any = p.y.oneMinus();
		const x: any = p.x.sub(0.5).abs();
		const arms: any = catalogBand(x.sub(age.mul(u.spread.clamp(0.05, 0.45))), 0.014);
		const ripples: any = age.mul(35).add(clock.mul(5)).sin().mul(0.25).add(0.75);
		const fade: any = age.smoothstep(0, 0.08).mul(age.smoothstep(0.4, 1).oneMinus());
		const ring: any = catalogBand(p.sub(vec2(0.5, 0.85)).mul(vec2(1, 1.5)).length().sub(0.06), 0.009);
		return finish(arms.mul(ripples).mul(fade).add(ring.mul(0.6)).mul(u.strength.clamp(0, 1)));
	})();
	return catalogShader(u, colorNode);
}
