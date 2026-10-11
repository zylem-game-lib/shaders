/** Texture projection, HUD animation and layered scenery: #4, 5, 25, 26, 29, 32, 97. */
import { Color, Vector2, type ColorRepresentation, type Texture } from 'three';
import { Fn, float, mix, texture, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { catalogContext, rotateCatalogUV, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface RetroMapOptions extends RetroVfxOptions {
	/** Caller-owned repeating map image; otherwise a procedural checker map. */ mapTexture?: Texture;
	heading?: number; offset?: { x: number; y: number }; scale?: number;
	/** Height of the horizon in bottom-origin UV units. */ horizon?: number;
}
export interface RetroMapUniforms extends RetroVfxUniforms {
	heading: { value: number }; offset: { value: Vector2 }; scale: { value: number }; horizon: { value: number };
}
function mapEffect(options: RetroMapOptions, mode: 'track' | 'airship' | 'room' | 'overhead'): ZylemParameterizedShader<RetroMapUniforms> {
	const { u } = catalogContext(options, '#55985b');
	u.heading = uniform(options.heading ?? 0); u.offset = uniform(new Vector2(options.offset?.x ?? 0, options.offset?.y ?? 0));
	u.scale = uniform(options.scale ?? 1); u.horizon = uniform(options.horizon ?? 0.72);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const horizon: any = u.horizon.clamp(0.1, 0.95);
		const perspective = mode === 'track' || mode === 'airship';
		const depth: any = horizon.sub(p.y).max(0.015);
		let q: any = perspective ? vec2(p.x.sub(0.5).div(depth), float(mode === 'airship' ? 0.35 : 0.16).div(depth)) : p.sub(0.5);
		q = rotateCatalogUV(q.mul(u.scale.max(0.001)), u.heading).add(u.offset);
		const checker: any = q.mul(8).floor().x.add(q.mul(8).floor().y).mod(2);
		const map: any = options.mapTexture ? texture(options.mapTexture, q.fract()).rgb : mix(u.color, u.hotColor.mul(0.5), checker);
		if (!perspective) return vec4(map.mul(u.intensity), 1);
		const sky: any = mix(u.hotColor.mul(0.12), u.hotColor, p.y.mul(0.6));
		const fog: any = depth.smoothstep(0.015, 0.22).oneMinus();
		return vec4(mix(mix(map, sky, fog), sky, p.y.greaterThanEqual(horizon).select(1, 0)).mul(u.intensity), 1);
	})();
	return { colorNode, uniforms: u };
}
export const createPerspectiveTrack = (options: RetroMapOptions = {}): ZylemParameterizedShader<RetroMapUniforms> => mapEffect(options, 'track');
export const createAirshipMap = (options: RetroMapOptions = {}): ZylemParameterizedShader<RetroMapUniforms> => mapEffect(options, 'airship');
export const createRotatingRoom = (options: RetroMapOptions = {}): ZylemParameterizedShader<RetroMapUniforms> => mapEffect(options, 'room');
export const createOverheadRotation = (options: RetroMapOptions = {}): ZylemParameterizedShader<RetroMapUniforms> => mapEffect(options, 'overhead');

export interface ItemRouletteOptions extends RetroVfxOptions {
	/** Required horizontal atlas, equal-sized cells, clamp wrapping. */ atlas: Texture;
	items?: number; target?: number; cycles?: number; progress?: number;
}
export interface ItemRouletteUniforms extends RetroVfxUniforms {
	items: { value: number }; target: { value: number }; cycles: { value: number }; progress: { value: number };
}
/** #5: ease-out scrolling atlas; p=1 stops exactly on target. Atlas should have cell gutters. */
export function createItemRoulette(options: ItemRouletteOptions): ZylemParameterizedShader<ItemRouletteUniforms> {
	const { u } = catalogContext(options, '#ffffff');
	u.items = uniform(options.items ?? 4); u.target = uniform(options.target ?? 0);
	u.cycles = uniform(options.cycles ?? 6); u.progress = uniform(options.progress ?? 0);
	const colorNode: any = Fn(() => {
		const n: any = u.items.floor().max(1);
		const target: any = u.target.floor().clamp(0, n.sub(1));
		const t: any = u.progress.clamp(0, 1).oneMinus().pow(3).oneMinus();
		const frame: any = t.mul(n.mul(u.cycles.floor().max(0)).add(target));
		const q: any = vec2(uv().x.add(frame).div(n).fract(), uv().y);
		const sample: any = texture(options.atlas, q);
		return vec4(sample.rgb.mul(u.color).mul(u.intensity), sample.a.mul(u.opacity));
	})();
	return { colorNode, uniforms: u, transparent: true };
}

export interface BrambleParallaxOptions extends RetroVfxOptions { offset?: number; foregroundTexture?: Texture; backgroundTexture?: Texture }
export interface BrambleParallaxUniforms extends RetroVfxUniforms { offset: { value: number } }
/** #25: two independent texture layers or procedural bramble silhouettes. Camera drives offset. */
export function createBrambleParallax(options: BrambleParallaxOptions = {}): ZylemParameterizedShader<BrambleParallaxUniforms> {
	const { u } = catalogContext(options, '#45613b'); u.offset = uniform(options.offset ?? 0);
	const colorNode: any = Fn(() => {
		const layer = (rate: number, map?: Texture): any => {
			const q: any = uv().add(vec2(u.offset.mul(rate), 0));
			if (map) return texture(map, q.fract());
			const vine: any = q.y.sub(q.x.mul(13).sin().mul(0.13).add(0.5)).abs();
			const thorns: any = q.x.mul(12).fract().sub(0.5).abs().mul(0.6).add(vine);
			return vec4(u.color.mul(rate), vine.smoothstep(0.04, 0.05).oneMinus().max(thorns.smoothstep(0.1, 0.12).oneMinus()));
		};
		const back: any = layer(0.3, options.backgroundTexture); const front: any = layer(1, options.foregroundTexture);
		return vec4(mix(mix(u.hotColor.mul(0.12), back.rgb, back.a), front.rgb, front.a).mul(u.intensity), 1);
	})();
	return { colorNode, uniforms: u };
}

export interface ColoredBackdropOptions extends RetroVfxOptions { horizonColor?: ColorRepresentation; horizon?: number }
export interface ColoredBackdropUniforms extends RetroVfxUniforms { horizonColor: { value: Color }; horizon: { value: number } }
/** #97: colored horizon bands for a background quad; pair distant terrain with matching fog. */
export function createColoredBackdrop(options: ColoredBackdropOptions = {}): ZylemParameterizedShader<ColoredBackdropUniforms> {
	const { u } = catalogContext(options, '#5652aa');
	u.horizonColor = uniform(new Color(options.horizonColor ?? '#edb998')); u.horizon = uniform(options.horizon ?? 0.4);
	const p: any = uv().y.sub(u.horizon).abs();
	return { colorNode: vec4(mix(u.horizonColor, u.color, p.smoothstep(0, 0.65)).mul(u.intensity), 1), uniforms: u };
}
