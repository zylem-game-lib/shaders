/** Bounded analytic spell shapes. No screen captures or unbounded procedural loops. */
import { FrontSide, PointLight, type Texture } from 'three';
import { Fn, atan, dot, float, mix, normalView, positionLocal, positionViewDirection, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import type { ZylemParameterizedShader } from '../types';
import { catalogBand, catalogContext, catalogLife, catalogNoise, catalogShader, rotateCatalogUV, type RetroVfxOptions, type RetroVfxUniforms } from './retro-catalog-common.tsl';

export interface RetroSpellOptions extends RetroVfxOptions {
	/** 0..1 lifetime for one-shot spells; persistent effects ignore it. */ progress?: number;
	/** 0 disables the effect. */ strength?: number;
	/** Relative line/plume width. */ width?: number;
	/** Optional repeating linear red-channel noise. Used only by fire shapes. */ noiseTexture?: Texture;
}
export interface RetroSpellUniforms extends RetroVfxUniforms {
	progress: { value: number }; strength: { value: number }; width: { value: number };
}
type SpellKind = 'ether' | 'bombos' | 'shock' | 'fire-sphere' | 'thruster' | 'smart-bomb' | 'cure' | 'fire' | 'ice' | 'bolt' | 'limit' | 'gunblade' | 'trance' | 'shield-flare' | 'save' | 'searchlight' | 'breath' | 'gem' | 'flare';
const colors: Record<SpellKind, string> = {
	ether: '#78c9ff', bombos: '#ff682a', shock: '#efcd79', 'fire-sphere': '#ff743a', thruster: '#85baff',
	'smart-bomb': '#84d9ff', cure: '#6bffa2', fire: '#ff622d', ice: '#78ddff', bolt: '#baa1ff', limit: '#efc662',
	gunblade: '#ffc67d', trance: '#fc76cd', 'shield-flare': '#80bcff', save: '#9361eb', searchlight: '#fff0b7',
	breath: '#ff8b2d', gem: '#c3eeff', flare: '#ffa757',
};
const persistent = new Set<SpellKind>(['thruster', 'limit', 'trance', 'save', 'searchlight', 'breath', 'gem', 'flare']);
function spell(options: RetroSpellOptions, kind: SpellKind): ZylemParameterizedShader<RetroSpellUniforms> {
	const { u, clock, finish } = catalogContext(options, colors[kind]);
	u.progress = uniform(options.progress ?? 0.4); u.strength = uniform(options.strength ?? 1); u.width = uniform(options.width ?? 0.04);
	const colorNode: any = Fn(() => {
		const p: any = uv(); const q: any = p.sub(0.5); const r: any = q.length();
		const a: any = atan(q.y, q.x); const t: any = u.progress.clamp(0, 1); const w: any = u.width.clamp(0.001, 0.3);
		const life: any = persistent.has(kind) ? float(1) : catalogLife(t);
		let field: any = float(0); let heat: any = float(0);
		if (kind === 'ether' || kind === 'bolt') {
			const jag: any = p.y.mul(35).add(clock.mul(11).floor()).sin().mul(p.y.mul(13).cos()).mul(0.11);
			const bolt: any = catalogBand(q.x.sub(jag), w.mul(0.35));
			const branches: any = catalogBand(q.x.abs().sub(p.y.sub(0.3).abs().mul(0.5)).sub(jag.mul(0.3)), w.mul(0.15));
			field = bolt.add(branches.mul(0.6));
			if (kind === 'ether') field = field.mul(t.smoothstep(0.2, 0.5).oneMinus()).add(catalogBand(r.sub(t.mul(0.46)).add(a.mul(12).sin().mul(0.018)), w).mul(t.smoothstep(0.1, 0.35)));
			heat = bolt;
		} else if (kind === 'bombos') {
			const radius: any = t.mul(0.35).add(0.05);
			const flame: any = a.mul(10).add(clock.mul(2)).sin().mul(0.5).add(0.5);
			field = catalogBand(r.sub(radius).sub(flame.mul(0.055)), w).mul(flame.mul(0.6).add(0.4)); heat = flame;
		} else if (kind === 'shock') {
			const rings: any = r.mul(24).sub(t.mul(10)).sin().abs();
			field = rings.smoothstep(0.7, 0.95).mul(catalogBand(r.sub(t.mul(0.4)), float(0.1))).mul(r.smoothstep(0, 0.05));
		} else if (kind === 'fire-sphere' || kind === 'smart-bomb' || kind === 'ice') {
			const facing: any = dot(normalView, positionViewDirection).abs().clamp(0, 1);
			const rim: any = facing.oneMinus().pow(kind === 'ice' ? 1 : 2);
			const bands: any = p.y.mul(kind === 'smart-bomb' ? 8 : 17).sub(clock.mul(2)).sin().abs();
			field = kind === 'ice' ? float(0.8) : rim.mul(0.8).add(bands.mul(0.2)); heat = kind === 'ice' ? facing.mul(0.7) : rim;
		} else if (kind === 'cure') {
			// Six staggered star columns; evaluating one cell keeps fragment work bounded.
			const cell: any = p.x.mul(6); const id: any = cell.floor(); const x: any = cell.fract().sub(0.5);
			const y: any = p.y.sub(clock.mul(0.25)).add(id.mul(0.173)).fract().sub(0.5);
			field = x.abs().mul(y.abs()).smoothstep(0.001, 0.004).oneMinus().mul(vec2(x, y).length().smoothstep(0.04, 0.22).oneMinus());
			field = field.add(q.x.abs().smoothstep(0.2, 0.45).oneMinus().mul(0.12)); heat = field;
		} else if (kind === 'fire' || kind === 'breath') {
			const h: any = kind === 'breath' ? p.x : p.y;
			const lateral: any = kind === 'breath' ? q.y : q.x;
			const noise: any = catalogNoise(vec2(lateral.mul(9), h.mul(5).sub(clock.mul(3))), options.noiseTexture);
			const width: any = kind === 'breath' ? h.mul(0.3).add(w) : h.oneMinus().mul(0.32).add(w);
			field = lateral.abs().add(noise.mul(0.13)).smoothstep(width.mul(0.6), width).oneMinus().mul(h.smoothstep(0, 0.08)).mul(h.smoothstep(0.65, 1).oneMinus());
			heat = h.oneMinus().mul(noise);
		} else if (kind === 'thruster' || kind === 'flare') {
			const diamond: any = q.x.abs().div(w.mul(3)).add(q.y.abs().div(kind === 'thruster' ? 0.45 : 0.25));
			field = diamond.smoothstep(0, 1).oneMinus().pow(2).mul(clock.mul(29).sin().mul(0.15).add(0.85));
			heat = diamond.smoothstep(0, 0.3).oneMinus();
		} else if (kind === 'limit' || kind === 'trance') {
			const rim: any = catalogBand(q.mul(vec2(1.2, 0.8)).length().sub(0.32).add(a.mul(kind === 'limit' ? 13 : 6).add(clock.mul(5)).sin().mul(0.025)), w);
			const rise: any = p.y.sub(clock.mul(0.5)).fract();
			field = rim.mul(rise.mul(0.6).add(0.4)).add(q.x.abs().smoothstep(0.1, 0.4).oneMinus().mul(0.1)); heat = rise;
		} else if (kind === 'gunblade' || kind === 'gem') {
			const rotated: any = rotateCatalogUV(q, kind === 'gunblade' ? t.mul(0.5) : clock.mul(0.3));
			const cross: any = rotated.x.abs().mul(rotated.y.abs()).smoothstep(0.0005, w.mul(0.12)).oneMinus();
			field = cross.mul(r.smoothstep(0, kind === 'gunblade' ? 0.48 : 0.38).oneMinus());
			if (kind === 'gem') field = field.mul(clock.mul(3).sin().max(0).pow(6));
			else field = field.add(catalogBand(r.sub(t.mul(0.45)), w.mul(0.3))); heat = cross;
		} else if (kind === 'shield-flare') {
			field = catalogBand(r.sub(t.mul(0.4)), w).add(a.mul(8).sin().abs().pow(16).mul(r.smoothstep(0.05, 0.45).oneMinus())); heat = r.oneMinus();
		} else if (kind === 'save') {
			const a: any = rotateCatalogUV(q, clock); const b: any = rotateCatalogUV(q, clock.negate().mul(0.7));
			field = catalogBand(a.x.abs().max(a.y.abs()).sub(0.27), w.mul(0.5)).add(catalogBand(b.x.abs().add(b.y.abs()).sub(0.39), w.mul(0.5)));
		} else if (kind === 'searchlight') {
			const coneWidth: any = p.y.mul(0.43).add(0.006);
			field = q.x.abs().smoothstep(coneWidth.mul(0.75), coneWidth).oneMinus().mul(p.y.oneMinus()).mul(p.y.smoothstep(0, 0.03));
		}
		return finish(field.mul(life).mul(u.strength.clamp(0, 1)), heat);
	})();
	const shader = catalogShader<RetroSpellUniforms>(u, colorNode, kind !== 'searchlight');
	if (kind === 'fire-sphere' || kind === 'smart-bomb') {
		shader.positionNode = positionLocal.mul(u.progress.clamp(0, 1).mul(kind === 'smart-bomb' ? 3 : 2).add(0.05)); shader.side = FrontSide;
	}
	if (kind === 'ice') {
		shader.positionNode = positionLocal.mul(vec3(1, u.progress.clamp(0, 1).smoothstep(0, 0.45), 1)); shader.side = FrontSide;
	}
	return shader;
}
export const createEtherBurst = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'ether');
export const createBombosRing = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'bombos');
export const createGroundShock = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'shock');
export const createDinsFire = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'fire-sphere');
export const createArwingThruster = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'thruster');
export const createSmartBomb = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'smart-bomb');
export const createCureColumn = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'cure');
export const createFireSpell = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'fire');
export const createIceSpell = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'ice');
export const createBoltStrike = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'bolt');
export const createLimitAura = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'limit');
export const createGunbladeFlash = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'gunblade');
export const createTranceAura = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'trance');
export const createShieldSpellFlare = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'shield-flare');
export const createSaveGeometry = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'save');
export const createSearchlight = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'searchlight');
export const createFlameBreath = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'breath');
export const createGemSparkle = (o: RetroSpellOptions = {}): ZylemParameterizedShader<RetroSpellUniforms> => spell(o, 'gem');

export interface FlareIllumination extends ZylemParameterizedShader<RetroSpellUniforms> {
	/** Attach to the flare's world location. No shadows by default. */ light: PointLight;
	/** Drive both shader clock and light flicker; seconds, not delta. */ update(seconds: number): void;
}
/** #100: visible flare core plus a bounded-range point light for lit surrounding materials. */
export function createFlareIllumination(options: RetroSpellOptions = {}): FlareIllumination {
	const shader = spell({ ...options, manualTime: true }, 'flare');
	const light = new PointLight(options.color ?? '#ffa757', 2, 8, 2);
	const update = (seconds: number): void => {
		if (!Number.isFinite(seconds)) throw new RangeError('Flare time must be finite');
		shader.uniforms.time.value = seconds;
		const u = shader.uniforms;
		light.color.copy(u.color.value);
		light.intensity = Math.max(0, u.intensity.value) * Math.max(0, Math.min(1, u.strength.value)) * Math.max(0, Math.min(1, u.opacity.value)) * (1.7 + 0.3 * Math.sin(seconds * u.speed.value * 29));
	};
	update(0); return { ...shader, light, update };
}
