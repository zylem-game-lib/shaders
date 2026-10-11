/** Catalog #3: close the outgoing frame around a UV-space focal point. */
import { Vector2 } from 'three';
import { Fn, mix, screenSize, uniform, uv, vec2 } from 'three/tsl';
import type { ZylemShaderUniforms, ZylemTransitionShader } from '../types';

export interface IrisTransitionOptions {
	/** Screen UV center, clamped to 0..1. Default { x: 0.5, y: 0.5 }. */
	center?: { x: number; y: number };
	/** Edge width in screen-height units. Default 0.015. */
	softness?: number;
}
export interface IrisTransitionUniforms extends ZylemShaderUniforms {
	center: { value: Vector2 };
	softness: { value: number };
}
export interface IrisTransition {
	shader: ZylemTransitionShader;
	uniforms: IrisTransitionUniforms;
}

/** Pass the returned object as transition.shader, like createStageTransition(). */
export function createIrisTransition(options: IrisTransitionOptions = {}): IrisTransition {
	const u: any = {
		center: uniform(new Vector2(options.center?.x ?? 0.5, options.center?.y ?? 0.5)),
		softness: uniform(options.softness ?? 0.015),
	};
	const shader: ZylemTransitionShader = ({ fromNode, toNode, progress }) => Fn(() => {
		const p: any = progress.clamp(0, 1);
		const center: any = u.center.clamp(0, 1);
		const aspect: any = vec2(screenSize.x.div(screenSize.y.max(1)), 1);
		const distance: any = uv().sub(center).mul(aspect).length();
		// Farthest corner, including off-center irises and portrait/ultrawide targets.
		const farthest: any = center.max(center.oneMinus()).mul(aspect).length();
		const softness: any = u.softness.max(0.0001);
		const radius: any = mix(farthest.add(softness), softness.negate(), p);
		const mask: any = distance.smoothstep(radius.sub(softness), radius.add(softness));
		// Exact endpoint bypass also avoids float roundoff at the farthest corner.
		const blend: any = p.lessThanEqual(0).select(0, p.greaterThanEqual(1).select(1, mask));
		return mix(fromNode, toNode, blend);
	})();
	return { shader, uniforms: u };
}
