import { Color, Vector2, type ColorRepresentation } from 'three';
import { Fn, convertToTexture, float, mix, screenSize, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemShaderUniforms, ZylemTransitionShader } from '../types';
import { catalogLife, rotateCatalogUV } from './retro-catalog-common.tsl';

export interface RetroWorldTransitionOptions { strength?: number; color?: ColorRepresentation; center?: { x: number; y: number } }
export interface RetroWorldTransitionUniforms extends ZylemShaderUniforms { strength: { value: number }; color: { value: Color }; center: { value: Vector2 } }
export interface RetroWorldTransition { shader: ZylemTransitionShader; uniforms: RetroWorldTransitionUniforms }
function worldTransition(options: RetroWorldTransitionOptions, kind: 'mirror' | 'mask' | 'time' | 'summon'): RetroWorldTransition {
	const u: any = { strength: uniform(options.strength ?? 1), color: uniform(new Color(options.color ?? '#ffffff')), center: uniform(new Vector2(options.center?.x ?? 0.5, options.center?.y ?? 0.5)) };
	const shader: ZylemTransitionShader = ({ fromNode, toNode, progress }) => {
		const from: any = convertToTexture(fromNode); const to: any = convertToTexture(toNode);
		return Fn(() => {
			const t: any = progress.clamp(0, 1); const life: any = catalogLife(t).mul(u.strength.clamp(0, 1));
			const aspect: any = vec2(screenSize.x.div(screenSize.y.max(1)), 1);
			const q: any = uv().sub(u.center).mul(aspect); const radius: any = q.length();
			let warped: any = q; let flash: any = float(0); let blend: any = t;
			if (kind === 'mirror') {
				warped = q.mul(radius.mul(32).sub(t.mul(20)).sin().mul(life).mul(0.12).add(1));
				flash = life.pow(6).mul(0.65);
			} else if (kind === 'mask') {
				warped = q.mul(float(1).sub(life.mul(0.25))); flash = life.pow(4); blend = t.smoothstep(0.4, 0.6);
			} else if (kind === 'time') {
				warped = rotateCatalogUV(q, life.mul(8).mul(radius.add(0.15).reciprocal())).mul(life.mul(2).add(1));
				flash = life.pow(8).mul(0.25);
			} else {
				const stripe: any = q.y.mul(15).floor().mod(2).mul(2).sub(1);
				warped = q.add(vec2(stripe.mul(life).mul(0.6), 0));
				blend = t.smoothstep(0.25, 0.75); flash = life.pow(4).mul(0.35);
			}
			const sampleUV: any = warped.div(aspect).add(u.center).clamp(0, 1);
			const base: any = mix(from.sample(sampleUV), to.sample(sampleUV), blend);
			// Both endpoint coordinates and RGBA are exact identity at p=0 and p=1.
			return vec4(mix(base.rgb, u.color, flash), base.a);
		})();
	};
	return { shader, uniforms: u };
}
export const createMirrorWarpTransition = (o: RetroWorldTransitionOptions = {}): RetroWorldTransition => worldTransition(o, 'mirror');
export const createMaskTransformTransition = (o: RetroWorldTransitionOptions = {}): RetroWorldTransition => worldTransition(o, 'mask');
export const createTimeResetTransition = (o: RetroWorldTransitionOptions = {}): RetroWorldTransition => worldTransition(o, 'time');
export const createSummonArenaTransition = (o: RetroWorldTransitionOptions = {}): RetroWorldTransition => worldTransition(o, 'summon');
