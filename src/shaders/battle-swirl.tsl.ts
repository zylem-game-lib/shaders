/** Catalog #68: swirl the outgoing frame while revealing the incoming battle. */
import { Vector2 } from 'three';
import { Fn, convertToTexture, mix, screenSize, uniform, uv, vec2 } from 'three/tsl';
import type { ZylemShaderUniforms, ZylemTransitionShader } from '../types';
import { rotateCatalogUV } from './retro-catalog-common.tsl';

export interface BattleSwirlOptions { turns?: number; center?: { x: number; y: number } }
export interface BattleSwirlUniforms extends ZylemShaderUniforms { turns: { value: number }; center: { value: Vector2 } }
export interface BattleSwirlTransition { shader: ZylemTransitionShader; uniforms: BattleSwirlUniforms }
/** Two frame samples. A composed input may need its own intermediate texture. */
export function createBattleSwirlTransition(options: BattleSwirlOptions = {}): BattleSwirlTransition {
	const u: any = { turns: uniform(options.turns ?? 1.5), center: uniform(new Vector2(options.center?.x ?? 0.5, options.center?.y ?? 0.5)) };
	const shader: ZylemTransitionShader = ({ fromNode, toNode, progress }) => {
		const from: any = convertToTexture(fromNode);
		const to: any = convertToTexture(toNode);
		return Fn(() => {
			const p: any = progress.clamp(0, 1);
			const coord: any = uv();
			const center: any = u.center.clamp(0, 1);
			const aspect: any = vec2(screenSize.x.div(screenSize.y.max(1)), 1);
			const q: any = coord.sub(center).mul(aspect);
			const falloff: any = q.length().smoothstep(0, 1.5).oneMinus();
			const angle: any = falloff.mul(p).mul(u.turns).mul(Math.PI * 2);
			const warped: any = rotateCatalogUV(q, angle).div(aspect).add(center).clamp(0, 1);
			const blend: any = p.smoothstep(0.15, 0.95);
			return mix(from.sample(warped), to.sample(coord), blend);
		})();
	};
	return { shader, uniforms: u };
}
