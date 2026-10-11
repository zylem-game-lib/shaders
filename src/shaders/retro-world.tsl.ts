/** Catalog #12, #20 and #35. Bounded procedural work with no noise octaves. */
import { AdditiveBlending, Color, DoubleSide, Vector2, type ColorRepresentation, type Texture } from 'three';
import { Fn, float, fwidth, mix, normalLocal, positionLocal, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader, ZylemShaderUniforms } from '../types';
import { retroClock, retroPalette, type RetroAnimationOptions, type RetroAnimationUniforms } from './retro-common.tsl';

export interface PowerBombOptions {
	color?: ColorRepresentation;
	hotColor?: ColorRepresentation;
	/** Lifetime 0..1; both endpoints are invisible. Default 0.35. */
	progress?: number;
	intensity?: number;
	opacity?: number;
	/** UV-space front thickness. Default 0.045. */
	width?: number;
	/** Plane width / height. Keeps the ring circular on rectangular planes. */
	aspect?: number;
}

export interface PowerBombUniforms extends ZylemShaderUniforms {
	color: { value: Color };
	hotColor: { value: Color };
	progress: { value: number };
	intensity: { value: number };
	opacity: { value: number };
	width: { value: number };
	aspect: { value: number };
}

/** One additive quad. Animate progress; billboard/place it at the bomb yourself. */
export function createPowerBomb(options: PowerBombOptions = {}): ZylemParameterizedShader<PowerBombUniforms> {
	const u: any = {
		color: uniform(new Color(options.color ?? '#ff7829')),
		hotColor: uniform(new Color(options.hotColor ?? '#fff4a3')),
		progress: uniform(options.progress ?? 0.35),
		intensity: uniform(options.intensity ?? 2),
		opacity: uniform(options.opacity ?? 1),
		width: uniform(options.width ?? 0.045),
		aspect: uniform(options.aspect ?? 1),
	};
	const colorNode: any = Fn(() => {
		const p: any = u.progress.clamp(0, 1);
		const aspect: any = u.aspect.max(0.001);
		const radius: any = p.mul(0.68).add(0.02);
		const d: any = uv().sub(0.5).mul(vec2(aspect, 1)).length();
		const aa: any = fwidth(d).max(0.001);
		const width: any = u.width.max(0.001);
		const ring: any = d.sub(radius).abs().smoothstep(width, width.add(aa)).oneMinus();
		const interior: any = d.smoothstep(float(0), radius.max(0.001)).oneMinus().mul(0.35);
		const life: any = p.mul(p.oneMinus()).mul(4);
		const field: any = ring.add(interior).clamp(0, 1).mul(life);
		// AdditiveBlending multiplies RGB by alpha; do not pre-multiply it here.
		return vec4(mix(u.color, u.hotColor, ring).mul(u.intensity.max(0)), field.mul(u.opacity.clamp(0, 1)));
	})();
	return { colorNode, uniforms: u, transparent: true, blending: AdditiveBlending, side: DoubleSide };
}

export interface BattleBackdropOptions extends RetroAnimationOptions {
	/** Pattern cycles across the plane. Default 7. */
	frequency?: number;
	/** Horizontal wave displacement in UV units. Default 0.12. */
	distortion?: number;
	/** Palette cycle multiplier. Default 0.15. */
	paletteSpeed?: number;
	intensity?: number;
}

export interface BattleBackdropUniforms extends RetroAnimationUniforms {
	frequency: { value: number };
	distortion: { value: number };
	paletteSpeed: { value: number };
	intensity: { value: number };
}

/** EarthBound-inspired procedural battle plane; keep combatants on a separate layer. */
export function createBattleBackdrop(options: BattleBackdropOptions = {}): ZylemParameterizedShader<BattleBackdropUniforms> {
	const { uniforms: u, clock } = retroClock(options);
	u.frequency = uniform(options.frequency ?? 7);
	u.distortion = uniform(options.distortion ?? 0.12);
	u.paletteSpeed = uniform(options.paletteSpeed ?? 0.15);
	u.intensity = uniform(options.intensity ?? 0.7);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const wave: any = p.y.mul(Math.PI * 6).add(clock).sin().mul(u.distortion);
		const x: any = p.x.add(wave).mul(u.frequency).add(clock.mul(0.15));
		const pattern: any = x.mul(Math.PI * 2).sin().add(p.y.mul(u.frequency).mul(Math.PI).sub(clock).cos()).mul(0.25);
		return vec4(retroPalette(pattern.add(clock.mul(u.paletteSpeed))).mul(u.intensity.max(0)), 1);
	})();
	return { colorNode, uniforms: u };
}

export interface PaintingRippleOptions extends RetroAnimationOptions {
	/** Caller-owned painting texture. Without one, show a UV checker. */
	baseTexture?: Texture;
	color?: ColorRepresentation;
	/** Displacement in local-space units. Default 0.25. */
	amplitude?: number;
	/** Ripple cycles per UV unit. Default 4. */
	frequency?: number;
	/** 0 disables displacement; animate after a touch. Default 1. */
	strength?: number;
	/** UV-space touch point. Default { x: 0.5, y: 0.5 }. */
	center?: { x: number; y: number };
}

export interface PaintingRippleUniforms extends RetroAnimationUniforms {
	color: { value: Color };
	amplitude: { value: number };
	frequency: { value: number };
	strength: { value: number };
	center: { value: Vector2 };
}

/** Subdivided UV plane; displaces vertices along local normals, pins all four edges. */
export function createPaintingRipple(options: PaintingRippleOptions = {}): ZylemParameterizedShader<PaintingRippleUniforms> {
	const { uniforms: u, clock } = retroClock(options);
	u.color = uniform(new Color(options.color ?? '#78b3ff'));
	u.amplitude = uniform(options.amplitude ?? 0.25);
	u.frequency = uniform(options.frequency ?? 4);
	u.strength = uniform(options.strength ?? 1);
	u.center = uniform(new Vector2(options.center?.x ?? 0.5, options.center?.y ?? 0.5));
	const positionNode: any = Fn(() => {
		const p: any = uv().clamp(0, 1);
		const distance: any = p.sub(u.center).length();
		const pinnedEdges: any = p.x.mul(p.x.oneMinus()).mul(p.y).mul(p.y.oneMinus()).mul(16);
		const wave: any = distance.mul(u.frequency).sub(clock).mul(Math.PI * 2).sin();
		const offset: any = wave.mul(pinnedEdges).mul(u.amplitude).mul(u.strength.clamp(0, 1));
		return positionLocal.add(normalLocal.mul(offset));
	})();
	const colorNode: any = Fn(() => {
		if (options.baseTexture) return vec4(texture(options.baseTexture, uv()).rgb.mul(u.color), 1);
		const tiles: any = uv().mul(8).floor();
		const checker: any = tiles.x.add(tiles.y).mod(2);
		return vec4(mix(u.color, vec3(1), checker.mul(0.65)), 1);
	})();
	return { colorNode, positionNode, uniforms: u, side: DoubleSide };
}
