import { AdditiveBlending, Color, DoubleSide, type ColorRepresentation, type Texture } from 'three';
import { float, fwidth, mix, texture, uniform, vec2, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { retroClock, type RetroAnimationOptions, type RetroAnimationUniforms } from './retro-common.tsl';
import { valueNoise2d } from './utils.tsl';

export interface RetroVfxOptions extends RetroAnimationOptions {
	color?: ColorRepresentation;
	hotColor?: ColorRepresentation;
	/** Nonnegative linear brightness. Default 1. */
	intensity?: number;
	/** 0..1 output alpha multiplier. Default 1. */
	opacity?: number;
}
export interface RetroVfxUniforms extends RetroAnimationUniforms {
	color: { value: Color };
	hotColor: { value: Color };
	intensity: { value: number };
	opacity: { value: number };
}

/** Internal node boundaries avoid exposing Three's recursively inferred types. */
export function catalogContext(options: RetroVfxOptions, color: string): { u: any; clock: any; finish: (field: any, heat?: any) => any } {
	const { uniforms: u, clock } = retroClock(options);
	u.color = uniform(new Color(options.color ?? color));
	u.hotColor = uniform(new Color(options.hotColor ?? '#ffffff'));
	u.intensity = uniform(options.intensity ?? 1);
	u.opacity = uniform(options.opacity ?? 1);
	const finish = (field: any, heat: any = float(0)): any => vec4(
		mix(u.color, u.hotColor, heat.clamp(0, 1)).mul(u.intensity.max(0)),
		field.clamp(0, 1).mul(u.opacity.clamp(0, 1)),
	);
	return { u, clock, finish };
}
export function catalogShader<U extends RetroVfxUniforms>(u: U, colorNode: any, additive = true): ZylemParameterizedShader<U> {
	return { colorNode, uniforms: u, transparent: true, side: DoubleSide, ...(additive ? { blending: AdditiveBlending } : {}) };
}
/** Fragment-only antialiasing, always using increasing smoothstep edges. */
export function catalogBand(distance: any, width: any): any {
	const aa: any = fwidth(distance).max(0.0001);
	const w: any = float(width).max(0.0001);
	return distance.abs().smoothstep(w, w.add(aa)).oneMinus();
}
export function catalogLife(progress: any): any {
	const p: any = progress.clamp(0, 1);
	return p.mul(p.oneMinus()).mul(4);
}
export function rotateCatalogUV(p: any, angle: any): any {
	const c: any = angle.cos();
	const s: any = angle.sin();
	return vec2(p.x.mul(c).sub(p.y.mul(s)), p.x.mul(s).add(p.y.mul(c)));
}
/** Optional caller-owned repeating red-channel noise lookup; otherwise four hashes. */
export function catalogNoise(p: any, map?: Texture): any {
	return map ? texture(map, p.mul(0.125)).r : valueNoise2d(p);
}
