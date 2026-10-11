/** Nine catalog effects: #6, #14, #33, #42, #43, #60, #66, #79 and #91. */
import { Color, FrontSide, type ColorRepresentation } from 'three';
import { Fn, atan, dot, mix, normalView, positionLocal, positionViewDirection, uniform, uv, vec2, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { catalogBand, catalogContext, catalogLife, catalogShader, rotateCatalogUV, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface BoostExhaustOptions extends RetroVfxOptions { /** 0 = off, 1 = full boost. */ boost?: number }
export type BoostExhaustUniforms = RetroVfxUniforms & { boost: { value: number } };
/** #6: engine nozzle at V=0; plume extends toward +V. One billboard. */
export function createBoostExhaust(options: BoostExhaustOptions = {}): ZylemParameterizedShader<BoostExhaustUniforms> {
	const { u, clock, finish } = catalogContext(options, '#45aaff');
	u.boost = uniform(options.boost ?? 0.7);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const boost: any = u.boost.clamp(0, 1);
		const height: any = boost.mul(0.65).add(0.2);
		const y: any = p.y.div(height);
		const width: any = y.oneMinus().clamp(0, 1).mul(boost.mul(0.16).add(0.05));
		const flicker: any = y.mul(32).sub(clock.mul(24)).sin().mul(0.08).add(0.92);
		const body: any = p.x.sub(0.5).abs().div(width.max(0.001)).smoothstep(0.2, 1).oneMinus();
		const fade: any = y.smoothstep(0.65, 1).oneMinus().mul(p.y.smoothstep(0, 0.025));
		return finish(body.mul(fade).mul(flicker).mul(boost), body.mul(y.oneMinus()));
	})();
	return catalogShader(u, colorNode);
}

export interface ChargeGlowOptions extends RetroVfxOptions { charge?: number; pulseRate?: number }
export type ChargeGlowUniforms = RetroVfxUniforms & { charge: { value: number }; pulseRate: { value: number } };
/** #14: radial orb/core and orbiting energy ring at a weapon's charge point. */
export function createChargeGlow(options: ChargeGlowOptions = {}): ZylemParameterizedShader<ChargeGlowUniforms> {
	const { u, clock, finish } = catalogContext(options, '#59d5ff');
	u.charge = uniform(options.charge ?? 0.7);
	u.pulseRate = uniform(options.pulseRate ?? 4);
	const colorNode: any = Fn(() => {
		const q: any = uv().sub(0.5);
		const d: any = q.length();
		const charge: any = u.charge.clamp(0, 1);
		const pulse: any = clock.mul(u.pulseRate).mul(Math.PI * 2).sin().mul(0.08).add(0.92);
		const radius: any = charge.mul(0.23).add(0.03).mul(pulse);
		const core: any = d.div(radius.max(0.001)).smoothstep(0, 1).oneMinus().pow(2);
		const ring: any = catalogBand(d.sub(radius.mul(1.35)), 0.008).mul(0.4);
		return finish(core.add(ring).mul(charge), core);
	})();
	return catalogShader(u, colorNode);
}

export interface StagedAuraOptions extends RetroVfxOptions {
	/** 0..1; changes color at 1/3 and 2/3. */ charge?: number;
	midColor?: ColorRepresentation;
}
export type StagedAuraUniforms = RetroVfxUniforms & { charge: { value: number }; midColor: { value: Color } };
/** #33: elongated character aura with three charge tiers, distinct from a weapon orb. */
export function createStagedAura(options: StagedAuraOptions = {}): ZylemParameterizedShader<StagedAuraUniforms> {
	const { u, clock, finish } = catalogContext(options, '#579aff');
	u.charge = uniform(options.charge ?? 0.75);
	u.midColor = uniform(new Color(options.midColor ?? '#ffd83b'));
	const colorNode: any = Fn(() => {
		const q: any = uv().sub(0.5).mul(vec2(1.4, 1));
		const charge: any = u.charge.clamp(0, 1);
		const tier: any = charge.mul(3).floor().min(2);
		const radius: any = tier.mul(0.05).add(0.25);
		const angle: any = atan(q.y, q.x.add(0.00001));
		const fringe: any = angle.mul(10).add(clock.mul(9)).sin().mul(0.018);
		const rim: any = catalogBand(q.length().sub(radius).add(fringe), 0.03);
		const inside: any = q.length().smoothstep(0, radius).oneMinus().mul(0.15);
		const tint: any = mix(u.color, u.midColor, tier.greaterThanEqual(1).select(1, 0));
		const rgb: any = mix(tint, u.hotColor, tier.greaterThanEqual(2).select(1, 0)).mul(u.intensity.max(0));
		const alpha: any = finish(rim.add(inside).mul(charge)).a;
		return vec4(rgb, alpha);
	})();
	return catalogShader(u, colorNode);
}

export interface FacetedBarrierOptions extends RetroVfxOptions { strength?: number; rimPower?: number }
export type FacetedBarrierUniforms = RetroVfxUniforms & { strength: { value: number }; rimPower: { value: number } };
/** #42: use a low-poly, flat-normal shell for an angular protective barrier. */
export function createFacetedBarrier(options: FacetedBarrierOptions = {}): ZylemParameterizedShader<FacetedBarrierUniforms> {
	const { u, clock, finish } = catalogContext(options, '#6ea6ff');
	u.strength = uniform(options.strength ?? 1);
	u.rimPower = uniform(options.rimPower ?? 2);
	const colorNode: any = Fn(() => {
		const rim: any = dot(normalView, positionViewDirection).abs().clamp(0, 1).oneMinus().pow(u.rimPower.max(0.01));
		const facet: any = normalView.y.mul(5).add(normalView.x.mul(3)).sin().mul(0.15).add(0.85);
		const pulse: any = clock.mul(3).sin().mul(0.15).add(0.85);
		return finish(rim.mul(0.65).add(0.15).mul(facet).mul(pulse).mul(u.strength.clamp(0, 1)), rim);
	})();
	return { ...catalogShader(u, colorNode), side: FrontSide };
}

export interface WindMarkerOptions extends RetroVfxOptions { radius?: number; turns?: number }
export type WindMarkerUniforms = RetroVfxUniforms & { radius: { value: number }; turns: { value: number } };
/** #43: spinning green spiral/ring marker on a ground-aligned quad. */
export function createWindMarker(options: WindMarkerOptions = {}): ZylemParameterizedShader<WindMarkerUniforms> {
	const { u, clock, finish } = catalogContext(options, '#72ff94');
	u.radius = uniform(options.radius ?? 0.36);
	u.turns = uniform(options.turns ?? 3);
	const colorNode: any = Fn(() => {
		const q: any = uv().sub(0.5);
		const d: any = q.length();
		const radius: any = u.radius.clamp(0.05, 0.46);
		const angle: any = atan(q.y, q.x.add(0.00001));
		const spiral: any = angle.add(d.mul(u.turns).mul(24)).sub(clock.mul(5)).sin().abs();
		const field: any = catalogBand(spiral, 0.15).mul(d.smoothstep(radius.mul(0.5), radius).oneMinus());
		const ring: any = catalogBand(d.sub(radius), 0.012);
		return finish(field.mul(0.7).add(ring), ring);
	})();
	return catalogShader(u, colorNode);
}

export interface ShieldBubbleOptions extends RetroVfxOptions { /** Remaining shield fraction. */ strength?: number }
export type ShieldBubbleUniforms = RetroVfxUniforms & { strength: { value: number } };
/** #60: smooth sphere whose local-space radius and alpha follow shield strength. */
export function createShieldBubble(options: ShieldBubbleOptions = {}): ZylemParameterizedShader<ShieldBubbleUniforms> {
	const { u, clock, finish } = catalogContext(options, '#ff759a');
	u.strength = uniform(options.strength ?? 0.8);
	const colorNode: any = Fn(() => {
		const rim: any = dot(normalView, positionViewDirection).abs().clamp(0, 1).oneMinus().pow(2);
		const pulse: any = clock.mul(5).sin().mul(0.06).add(0.94);
		return finish(rim.mul(0.65).add(0.12).mul(pulse).mul(u.strength.clamp(0, 1)), rim);
	})();
	const positionNode: any = positionLocal.mul(u.strength.clamp(0, 1).mul(0.65).add(0.35));
	return { ...catalogShader(u, colorNode), side: FrontSide, positionNode };
}

export interface MuzzleFlashOptions extends RetroVfxOptions { progress?: number; rays?: number }
export type MuzzleFlashUniforms = RetroVfxUniforms & { progress: { value: number }; rays: { value: number } };
/** #66: irregular radial muzzle fan, attached/billboarded at the weapon muzzle. */
export function createMuzzleFlash(options: MuzzleFlashOptions = {}): ZylemParameterizedShader<MuzzleFlashUniforms> {
	const { u, clock, finish } = catalogContext(options, '#ffca65');
	u.progress = uniform(options.progress ?? 0.2);
	u.rays = uniform(options.rays ?? 7);
	const colorNode: any = Fn(() => {
		const q: any = uv().sub(0.5);
		const angle: any = atan(q.y, q.x.add(0.00001));
		// Integer frequency makes the angular seam continuous.
		const edge: any = angle.mul(u.rays.clamp(3, 16).floor()).add(clock.mul(0.4)).cos().mul(0.09).add(0.28);
		const shape: any = q.length().smoothstep(edge.mul(0.4), edge).oneMinus();
		return finish(shape.mul(catalogLife(u.progress)), shape.pow(2));
	})();
	return catalogShader(u, colorNode);
}

export interface HolyPillarsOptions extends RetroVfxOptions { progress?: number; columns?: number }
export type HolyPillarsUniforms = RetroVfxUniforms & { progress: { value: number }; columns: { value: number } };
/** #79: periodic vertical light shafts on one wide quad; no particle emitter. */
export function createHolyPillars(options: HolyPillarsOptions = {}): ZylemParameterizedShader<HolyPillarsUniforms> {
	const { u, clock, finish } = catalogContext(options, '#ffe8a0');
	u.progress = uniform(options.progress ?? 0.45);
	u.columns = uniform(options.columns ?? 5);
	const colorNode: any = Fn(() => {
		const p: any = uv();
		const count: any = u.columns.clamp(1, 12).floor();
		const x: any = p.x.mul(count);
		const center: any = x.fract().sub(0.5).abs();
		const pulse: any = x.floor().mul(2.4).add(clock.mul(4)).sin().mul(0.2).add(0.8);
		const beam: any = center.smoothstep(0.02, 0.25).oneMinus().pow(2);
		const height: any = u.progress.clamp(0, 1).mul(3).clamp(0.001, 1);
		const vertical: any = p.y.smoothstep(0, 0.04).mul(p.y.div(height).smoothstep(0.6, 1).oneMinus());
		return finish(beam.mul(vertical).mul(pulse).mul(catalogLife(u.progress)), beam);
	})();
	return catalogShader(u, colorNode);
}

export interface SpinSmearOptions extends RetroVfxOptions { strength?: number; radius?: number }
export type SpinSmearUniforms = RetroVfxUniforms & { strength: { value: number }; radius: { value: number } };
/** #91: rotating annular slash segments on a quad around the spinning character. */
export function createSpinSmear(options: SpinSmearOptions = {}): ZylemParameterizedShader<SpinSmearUniforms> {
	const { u, clock, finish } = catalogContext(options, '#ffac3e');
	u.strength = uniform(options.strength ?? 1);
	u.radius = uniform(options.radius ?? 0.34);
	const colorNode: any = Fn(() => {
		const q: any = rotateCatalogUV(uv().sub(0.5), clock.mul(8));
		const d: any = q.length();
		const angle: any = atan(q.y, q.x.add(0.00001));
		const arcs: any = angle.mul(3).sin().smoothstep(-0.5, 0.7);
		const ring: any = catalogBand(d.sub(u.radius.clamp(0.08, 0.43)), 0.04);
		return finish(ring.mul(arcs).mul(u.strength.clamp(0, 1)), ring.mul(0.5));
	})();
	return catalogShader(u, colorNode);
}
