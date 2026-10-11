import { Vector2, type Texture } from 'three';
import { Fn, dot, mix, screenSize, texture, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemPostEffect, ZylemShaderUniforms } from '../types';
export interface XRayScopeOptions { revealTexture: Texture; center?: { x: number; y: number }; angle?: number; aperture?: number; range?: number; strength?: number }
export interface XRayScopeUniforms extends ZylemShaderUniforms { center: { value: Vector2 }; angle: { value: number }; aperture: { value: number }; range: { value: number }; strength: { value: number } }
export interface XRayScopeEffect { effect: ZylemPostEffect; uniforms: XRayScopeUniforms }
/** #15: directional reveal. Align the supplied alternate scene texture with the current view. */
export function createXRayScopeEffect(options: XRayScopeOptions): XRayScopeEffect {
	const u: any = { center: uniform(new Vector2(options.center?.x ?? 0.35, options.center?.y ?? 0.5)), angle: uniform(options.angle ?? 0), aperture: uniform(options.aperture ?? 0.45), range: uniform(options.range ?? 0.65), strength: uniform(options.strength ?? 1) };
	const effect: ZylemPostEffect = input => Fn(() => {
		const p: any = uv(); const q: any = p.sub(u.center).mul(vec2(screenSize.x.div(screenSize.y.max(1)), 1));
		const distance: any = q.length(); const dir: any = vec2(u.angle.cos(), u.angle.sin());
		const angleCos: any = dot(q.div(distance.max(0.0001)), dir);
		const edge: any = u.aperture.clamp(0.01, 1.5).cos();
		const cone: any = angleCos.smoothstep(edge, edge.add(0.02).min(1));
		const mask: any = cone.mul(distance.smoothstep(u.range.max(0), u.range.max(0).add(0.02)).oneMinus()).mul(u.range.greaterThan(0).select(1, 0)).mul(u.strength.clamp(0, 1));
		return mix(vec4(input), texture(options.revealTexture, p), mask);
	})();
	return { effect, uniforms: u };
}
