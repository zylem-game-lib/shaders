/** Catalog #7, #86 and #88. Color-only transforms of the current input. */
import { Color, Vector2, type ColorRepresentation, type Texture } from 'three';
import { Fn, dot, mix, screenCoordinate, screenSize, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { ZylemPostEffect, ZylemShaderUniforms } from '../types';
import { retroClock, type RetroAnimationOptions, type RetroAnimationUniforms } from '../shaders/retro-common.tsl';
import { hash2 } from '../shaders/utils.tsl';

export interface LanternConeOptions {
	center?: { x: number; y: number };
	/** Facing radians: 0 = +U, PI/2 = +V. Default PI/2. */
	angle?: number;
	/** Half of the cone's opening angle in radians. Default 0.5. */
	halfAngle?: number;
	/** Range in screen-height units. Default 0.7. */
	radius?: number;
	/** Outside brightness, 0..1. Default 0.12. */
	ambient?: number;
	/** 0 = unchanged scene, 1 = full effect. Default 1. */
	strength?: number;
}
export interface LanternConeUniforms extends ZylemShaderUniforms {
	center: { value: Vector2 };
	angle: { value: number };
	halfAngle: { value: number };
	radius: { value: number };
	ambient: { value: number };
	strength: { value: number };
}
export interface LanternConeEffect {
	effect: ZylemPostEffect;
	uniforms: LanternConeUniforms;
}

/** Screen-space light mask; caller projects the character and facing into screen UVs. No occlusion. */
export function createLanternConeEffect(options: LanternConeOptions = {}): LanternConeEffect {
	const u: any = {
		center: uniform(new Vector2(options.center?.x ?? 0.5, options.center?.y ?? 0.4)),
		angle: uniform(options.angle ?? Math.PI / 2), halfAngle: uniform(options.halfAngle ?? 0.5),
		radius: uniform(options.radius ?? 0.7), ambient: uniform(options.ambient ?? 0.12),
		strength: uniform(options.strength ?? 1),
	};
	const effect: ZylemPostEffect = inputNode => Fn(() => {
		const base: any = vec4(inputNode);
		const delta: any = uv().sub(u.center).mul(vec2(screenSize.x.div(screenSize.y.max(1)), 1));
		const distance: any = delta.length();
		const facing: any = vec2(u.angle.cos(), u.angle.sin());
		const cosine: any = dot(delta, facing).div(distance.max(0.0001));
		const halfAngle: any = u.halfAngle.clamp(0.02, Math.PI - 0.02);
		const cone: any = cosine.smoothstep(halfAngle.cos(), halfAngle.mul(0.8).cos());
		const radius: any = u.radius.max(0.0001);
		const reach: any = distance.smoothstep(radius.mul(0.7), radius).oneMinus();
		// Small pool around the origin prevents an undefined dark point at the caster.
		const near: any = distance.smoothstep(radius.mul(0.04), radius.mul(0.12)).oneMinus();
		const light: any = cone.mul(reach).max(near);
		const brightness: any = mix(u.ambient.clamp(0, 1), 1, light);
		return vec4(base.rgb.mul(mix(1, brightness, u.strength.clamp(0, 1))), base.a);
	})();
	return { effect, uniforms: u };
}

export interface ThermalVisionOptions {
	/** Optional caller-owned, linear red-channel heat map aligned with screen UVs. */
	heatTexture?: Texture;
	/** Gain applied to heat map or fallback luminance. Default 1.5. */
	gain?: number;
	/** Offset applied after gain, in heat units. Default 0. */
	bias?: number;
	strength?: number;
}
export interface ThermalVisionUniforms extends ZylemShaderUniforms {
	gain: { value: number };
	bias: { value: number };
	strength: { value: number };
}
export interface ThermalVisionEffect {
	effect: ZylemPostEffect;
	uniforms: ThermalVisionUniforms;
}

/** False-color ramp, not heat detection. Supply a heat map to distinguish targets by game logic. */
export function createThermalVisionEffect(options: ThermalVisionOptions = {}): ThermalVisionEffect {
	const u: any = {
		gain: uniform(options.gain ?? 1.5), bias: uniform(options.bias ?? 0),
		strength: uniform(options.strength ?? 1),
	};
	const effect: ZylemPostEffect = inputNode => Fn(() => {
		const base: any = vec4(inputNode);
		const heat: any = options.heatTexture ? texture(options.heatTexture, uv()).r
			: dot(base.rgb, vec3(0.2126, 0.7152, 0.0722));
		const t: any = heat.mul(u.gain.max(0)).add(u.bias).clamp(0, 1);
		const cold: any = mix(vec3(0.01, 0, 0.15), vec3(0, 0.2, 1), t.smoothstep(0, 0.25));
		const warm: any = mix(cold, vec3(0, 1, 0.55), t.smoothstep(0.25, 0.5));
		const hot: any = mix(warm, vec3(1, 0.12, 0), t.smoothstep(0.5, 0.75));
		const ramp: any = mix(hot, vec3(1, 1, 0.8), t.smoothstep(0.75, 1));
		return vec4(mix(base.rgb, ramp, u.strength.clamp(0, 1)), base.a);
	})();
	return { effect, uniforms: u };
}

export interface ChaffInterferenceOptions extends RetroAnimationOptions {
	color?: ColorRepresentation;
	strength?: number;
	/** Noise block width in render-target pixels. Default 3. */
	blockSize?: number;
	/** Fraction of row bands replaced by static, 0..1. Default 0.15. */
	dropout?: number;
}
export interface ChaffInterferenceUniforms extends RetroAnimationUniforms {
	color: { value: Color };
	strength: { value: number };
	blockSize: { value: number };
	dropout: { value: number };
}
export interface ChaffInterferenceEffect {
	effect: ZylemPostEffect;
	uniforms: ChaffInterferenceUniforms;
}

/** Animated static/dropout for a radar or camera feed; no extra pass or history buffer. */
export function createChaffInterferenceEffect(options: ChaffInterferenceOptions = {}): ChaffInterferenceEffect {
	const { uniforms: u, clock } = retroClock(options);
	u.color = uniform(new Color(options.color ?? '#b7ffd0'));
	u.strength = uniform(options.strength ?? 0.7);
	u.blockSize = uniform(options.blockSize ?? 3);
	u.dropout = uniform(options.dropout ?? 0.15);
	const effect: ZylemPostEffect = inputNode => Fn(() => {
		const base: any = vec4(inputNode);
		const cell: any = screenCoordinate.div(u.blockSize.max(1)).floor();
		const frame: any = clock.mul(24).floor();
		const noise: any = hash2(cell.add(vec2(frame, frame.mul(0.37))));
		const row: any = hash2(vec2(cell.y.div(3).floor(), frame));
		const drop: any = row.lessThan(u.dropout.clamp(0, 1)).select(1, 0);
		const amount: any = drop.mul(0.65).add(0.35).mul(u.strength.clamp(0, 1));
		return vec4(mix(base.rgb, u.color.mul(noise), amount), base.a);
	})();
	return { effect, uniforms: u };
}
