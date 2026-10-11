/** Catalog #16, #38, #55 and #62: one mesh each, no texture reads. */
import { AdditiveBlending, Color, DoubleSide, type ColorRepresentation } from 'three';
import { Fn, float, fwidth, mix, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader, ZylemShaderUniforms } from '../types';
import { retroClock, retroPalette, type RetroAnimationOptions, type RetroAnimationUniforms } from './retro-common.tsl';

/** Internal fragment-only distance band with an antialiased edge. */
function band(distance: any, width: any): any {
	const aa: any = fwidth(distance).max(0.0001);
	const w: any = width.max(0.0001);
	return distance.abs().smoothstep(w, w.add(aa)).oneMinus();
}

export interface WaterRippleOptions {
	color?: ColorRepresentation;
	/** Lifetime 0..1; both endpoints invisible. Default 0.3. */
	progress?: number;
	opacity?: number;
	/** UV-space line half-width. Default 0.012. */
	width?: number;
}
export interface WaterRippleUniforms extends ZylemShaderUniforms {
	color: { value: Color };
	progress: { value: number };
	opacity: { value: number };
	width: { value: number };
}

/** Two expanding rings on a square UV plane placed just above the water. */
export function createWaterRipple(options: WaterRippleOptions = {}): ZylemParameterizedShader<WaterRippleUniforms> {
	const u: any = {
		color: uniform(new Color(options.color ?? '#a0eaff')),
		progress: uniform(options.progress ?? 0.3),
		opacity: uniform(options.opacity ?? 0.8),
		width: uniform(options.width ?? 0.012),
	};
	const colorNode: any = Fn(() => {
		const p: any = u.progress.clamp(0, 1);
		const d: any = uv().sub(0.5).length();
		const radius: any = p.mul(0.4).add(0.04);
		const width: any = u.width.clamp(0.0001, 0.025);
		const rings: any = band(d.sub(radius), width)
			.add(band(d.sub(radius.mul(0.68)), width.mul(0.65)).mul(0.5));
		const life: any = p.mul(p.oneMinus()).mul(4);
		return vec4(u.color, rings.clamp(0, 1).mul(life).mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, blending: AdditiveBlending, side: DoubleSide };
}

export interface BlobShadowOptions {
	color?: ColorRepresentation;
	opacity?: number;
	/** Height above receiver in caller-chosen world units. Default 0. */
	height?: number;
	/** Height attenuation per world unit. Default 0.25. */
	heightFalloff?: number;
	/** Fraction of disk occupied by the soft edge, 0..1. Default 0.6. */
	softness?: number;
}
export interface BlobShadowUniforms extends ZylemShaderUniforms {
	color: { value: Color };
	opacity: { value: number };
	height: { value: number };
	heightFalloff: { value: number };
	softness: { value: number };
}

/** Fake contact shadow. Caller supplies receiver position/orientation; no raycast or shadow map. */
export function createBlobShadow(options: BlobShadowOptions = {}): ZylemParameterizedShader<BlobShadowUniforms> {
	const u: any = {
		color: uniform(new Color(options.color ?? '#080b16')),
		opacity: uniform(options.opacity ?? 0.65), height: uniform(options.height ?? 0),
		heightFalloff: uniform(options.heightFalloff ?? 0.25), softness: uniform(options.softness ?? 0.6),
	};
	const colorNode: any = Fn(() => {
		const attenuation: any = float(1).div(u.height.max(0).mul(u.heightFalloff.max(0)).add(1));
		const radius: any = attenuation.mul(0.3).add(0.15);
		const d: any = uv().sub(0.5).length();
		const edge: any = radius.mul(u.softness.clamp(0, 1)).max(fwidth(d)).max(0.0001);
		const disk: any = d.smoothstep(radius.sub(edge), radius).oneMinus();
		return vec4(u.color, disk.mul(attenuation).mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, side: DoubleSide };
}

export interface RainbowRoadOptions extends RetroAnimationOptions {
	/** Complete rainbow repeats along the selected UV axis. Default 2. */
	repeats?: number;
	/** Color palette offset in turns. Default 0. */
	phase?: number;
	intensity?: number;
	/** Baked longitudinal UV axis. Default 'v'. */
	axis?: 'u' | 'v';
}
export interface RainbowRoadUniforms extends RetroAnimationUniforms {
	repeats: { value: number };
	phase: { value: number };
	intensity: { value: number };
}

/** Opaque colored road surface. Provide UVs that follow the track's length. */
export function createRainbowRoad(options: RainbowRoadOptions = {}): ZylemParameterizedShader<RainbowRoadUniforms> {
	const { uniforms: u, clock } = retroClock({ ...options, speed: options.speed ?? 0.1 });
	u.repeats = uniform(options.repeats ?? 2);
	u.phase = uniform(options.phase ?? 0);
	u.intensity = uniform(options.intensity ?? 1);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const along: any = options.axis === 'u' ? p.x : p.y;
		const phase: any = along.mul(u.repeats.max(0)).add(u.phase).add(clock);
		// Smooth bands avoid hard palette boundaries flickering into the distance.
		return vec4(retroPalette(phase).mul(0.85).add(0.15).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, uniforms: u, side: DoubleSide };
}

export interface HitSparkOptions {
	color?: ColorRepresentation;
	coreColor?: ColorRepresentation;
	/** Lifetime 0..1; both endpoints invisible. Default 0.25. */
	progress?: number;
	intensity?: number;
	opacity?: number;
	/** Rotation in radians. Default 0.3. */
	rotation?: number;
}
export interface HitSparkUniforms extends ZylemShaderUniforms {
	color: { value: Color };
	coreColor: { value: Color };
	progress: { value: number };
	intensity: { value: number };
	opacity: { value: number };
	rotation: { value: number };
}

/** Four-point flash + smaller diagonal rays on one additive billboard. Hit-stop is caller-owned. */
export function createHitSpark(options: HitSparkOptions = {}): ZylemParameterizedShader<HitSparkUniforms> {
	const u: any = {
		color: uniform(new Color(options.color ?? '#ffb92e')),
		coreColor: uniform(new Color(options.coreColor ?? '#ffffff')),
		progress: uniform(options.progress ?? 0.25), intensity: uniform(options.intensity ?? 2),
		opacity: uniform(options.opacity ?? 1), rotation: uniform(options.rotation ?? 0.3),
	};
	const colorNode: any = Fn(() => {
		const p: any = u.progress.clamp(0, 1);
		const q: any = uv().sub(0.5);
		const c: any = u.rotation.cos();
		const s: any = u.rotation.sin();
		const point: any = vec2(q.x.mul(c).sub(q.y.mul(s)), q.x.mul(s).add(q.y.mul(c)));
		const a: any = point.abs();
		const reach: any = p.mul(0.3).add(0.15);
		const width: any = p.oneMinus().mul(0.025).add(0.005);
		const axial: any = band(a.x.min(a.y), width.mul(a.x.max(a.y).div(reach).oneMinus().clamp(0, 1)))
			.mul(a.x.max(a.y).smoothstep(reach.mul(0.8), reach).oneMinus());
		const diagonal: any = band(a.x.sub(a.y).mul(Math.SQRT1_2), width.mul(0.45))
			.mul(point.length().smoothstep(reach.mul(0.35), reach.mul(0.7)).oneMinus());
		const core: any = point.length().smoothstep(0, width.mul(3)).oneMinus();
		const life: any = p.mul(8).clamp(0, 1).mul(p.oneMinus()).mul(p.oneMinus());
		const field: any = axial.add(diagonal.mul(0.7)).add(core).clamp(0, 1).mul(life);
		return vec4(mix(u.color, u.coreColor, core).mul(u.intensity.max(0)), field.mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, blending: AdditiveBlending, side: DoubleSide };
}
