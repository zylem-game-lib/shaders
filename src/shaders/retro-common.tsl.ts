import { time, uniform, vec3 } from 'three/tsl';
import type { ZylemShaderUniforms } from '../types';

export interface RetroAnimationOptions {
	/** Cycles/phase multiplier per second. Default 1. */
	speed?: number;
	/** Baked: use uniforms.time (seconds) instead of renderer time. */
	manualTime?: boolean;
}

export interface RetroAnimationUniforms extends ZylemShaderUniforms {
	speed: { value: number };
	time: { value: number };
}

/** Internal loose node boundaries keep Three's recursive types out of declarations. */
export function retroClock(options: RetroAnimationOptions): { uniforms: any; clock: any } {
	const uniforms: any = { speed: uniform(options.speed ?? 1), time: uniform(0) };
	return { uniforms, clock: (options.manualTime ? uniforms.time : time).mul(uniforms.speed) };
}

export function retroPalette(phase: any): any {
	return phase.add(vec3(0, 2 / 3, 1 / 3)).mul(Math.PI * 2).cos().mul(0.5).add(0.5);
}
