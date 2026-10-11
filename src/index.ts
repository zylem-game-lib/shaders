/**
 * @zylem/shaders — WebGPU-compatible TSL shaders and postprocessing effects
 * for the Zylem game framework.
 */

// Third-party procedural TSL textures
export * from 'tsl-textures';

// Shared contracts
export type {
	ZylemParameterizedShader,
	ZylemPostEffect,
	ZylemShaderUniforms,
	ZylemTSLShader,
	ZylemTransitionShader,
} from './types';

// AbilityCastingThreeJS-inspired effects
export type { AbilityEffectOptions, AbilityEffectUniforms } from './shaders/ability-common.tsl';
export { createAbilityNoiseTexture } from './shaders/ability-noise-texture';
export {
	createAbilitySigil, type AbilitySigilOptions, type AbilitySigilUniforms,
	createAbilityPortal, type AbilityPortalOptions, type AbilityPortalUniforms,
	createAbilityBeam, type AbilityBeamOptions, type AbilityBeamUniforms,
	createAbilityLightning, type AbilityLightningOptions, type AbilityLightningUniforms,
} from './shaders/ability-vector.tsl';
export {
	createAbilityFlame, type AbilityFlameOptions, type AbilityFlameUniforms,
	createAbilityBurst, type AbilityBurstOptions, type AbilityBurstUniforms,
	createAbilityAura, type AbilityAuraOptions, type AbilityAuraUniforms,
	createAbilityCrystal, type AbilityCrystalOptions, type AbilityCrystalUniforms,
} from './shaders/ability-surface.tsl';

// Shaders
export { fireTSL } from './shaders/fire.tsl';
export { starTSL } from './shaders/star.tsl';
export { debugTSL } from './shaders/debug.tsl';
export {
	createGradientSky,
	gradientSkyTSL,
} from './shaders/gradient-sky.tsl';
export {
	createMagicalLandscape,
	type MagicalLandscapeOptions,
	type MagicalLandscapeUniforms,
} from './shaders/magical-landscape.tsl';
export {
	createWaterSurface,
	type WaterSurfaceOptions,
	type WaterSurfaceUniforms,
} from './shaders/water-surface.tsl';
export {
	createLava,
	type LavaOptions,
	type LavaUniforms,
} from './shaders/lava.tsl';
export {
	createAlienSky,
	type AlienSkyOptions,
	type AlienSkyUniforms,
} from './shaders/alien-sky.tsl';
export {
	createArcadeDissolve,
	type ArcadeDissolveOptions,
	type ArcadeDissolveUniforms,
} from './shaders/arcade-dissolve.tsl';
export {
	createHolographic,
	type HolographicOptions,
	type HolographicUniforms,
} from './shaders/holographic.tsl';
export {
	createDissolve,
	type DissolveOptions,
	type DissolveUniforms,
} from './shaders/dissolve.tsl';
export {
	createFoliage,
	type FoliageOptions,
	type FoliageUniforms,
} from './shaders/foliage.tsl';
export {
	createFoliageClusterGeometry,
	type FoliageClusterOptions,
} from './shaders/foliage-geometry';
export {
	createEnergyShield,
	type EnergyShieldOptions,
	type EnergyShieldUniforms,
} from './shaders/energy-shield.tsl';
export {
	createPlanetRing,
	type PlanetRingOptions,
	type PlanetRingUniforms,
} from './shaders/planet-ring.tsl';
export {
	createPlanetSurface,
	type PlanetSurfaceOptions,
	type PlanetSurfaceUniforms,
} from './shaders/planet-surface.tsl';
export {
	createStarryNight,
	type StarryNightOptions,
	type StarryNightUniforms,
} from './shaders/starry-night.tsl';
export {
	createShadertoyWaterNoise,
	type ShadertoyWaterNoiseOptions,
	type ShadertoyWaterNoiseUniforms,
} from './shaders/shadertoy-water-noise.tsl';
export {
	createShadertoyFire,
	type FireColor,
	type ShadertoyFireOptions,
	type ShadertoyFireUniforms,
} from './shaders/shadertoy-fire.tsl';
export {
	createStageTransition,
	type StageTransitionOptions,
	type StageTransitionPattern,
	type StageTransitionUniforms,
	type ZylemStageTransition,
} from './shaders/stage-transition.tsl';

// Shadertoy runtime transpiler
export {
	parseShadertoy,
	parseShadertoyToNodeFactory,
	transpileShadertoy,
} from './shadertoy/shadertoy-node';

// Postprocessing effects
export {
	createAfterimageEffect,
	type AfterimageEffect,
	type AfterimageOptions,
} from './postprocessing/afterimage';

// Retro game catalog: first implementation batch
export type { RetroAnimationOptions, RetroAnimationUniforms } from './shaders/retro-common.tsl';
export {
	createPaletteCycle, type PaletteCycleOptions, type PaletteCycleUniforms,
	createGhost, type GhostOptions, type GhostUniforms,
	createRetroMetal, type RetroMetalOptions, type RetroMetalUniforms,
} from './shaders/retro-character.tsl';
export {
	createPowerBomb, type PowerBombOptions, type PowerBombUniforms,
	createBattleBackdrop, type BattleBackdropOptions, type BattleBackdropUniforms,
	createPaintingRipple, type PaintingRippleOptions, type PaintingRippleUniforms,
} from './shaders/retro-world.tsl';

export {
	createWaterRipple, type WaterRippleOptions, type WaterRippleUniforms,
	createBlobShadow, type BlobShadowOptions, type BlobShadowUniforms,
	createRainbowRoad, type RainbowRoadOptions, type RainbowRoadUniforms,
	createHitSpark, type HitSparkOptions, type HitSparkUniforms,
} from './shaders/retro-vfx.tsl';
export {
	createIrisTransition, type IrisTransitionOptions, type IrisTransitionUniforms, type IrisTransition,
} from './shaders/iris-transition.tsl';

// Retro catalog batch 3: 22 materials and a battle-entry transition.
export type { RetroVfxOptions, RetroVfxUniforms } from './shaders/retro-catalog-common.tsl';
export * from './shaders/retro-energy.tsl';
export * from './shaders/retro-environment.tsl';
export * from './shaders/retro-surfaces.tsl';
export * from './shaders/battle-swirl.tsl';

// Retro catalog completion: material, transition and bounded motion components.
export * from './shaders/retro-projection.tsl';
export * from './shaders/retro-morph.tsl';
export * from './shaders/retro-spells.tsl';
export * from './shaders/retro-world-transitions.tsl';
export * from './shaders/retro-particles';
export * from './shaders/retro-trails';
