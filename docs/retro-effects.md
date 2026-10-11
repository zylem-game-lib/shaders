# Retro effects: first implementation batch

Eight original TSL interpretations of entries in the
[100-effect catalog](retro-game-effects.md). These are reusable materials and
postprocessing components, not reproductions of the games' rendering code or
complete scripted sequences. No original game art is included.

## Available effects

| Catalog | Factory | Apply to | Cost and limits |
| --- | --- | --- | --- |
| 1 | `createPaletteCycle` | UV sprite or mesh; animate hue while retaining source luminance and alpha. | Zero samples without a texture; one with `baseTexture`. Strong saturated colors can exceed 1 in linear HDR color. |
| 2 | `createGhost` | Character or sprite; blend its body, optionally keep facial details opaque. | Zero to two samples. Transparent sorting and overdraw still matter; default front faces only. |
| 12 | `createPowerBomb` | One square billboard quad centered on a bomb; drive `progress` from 0 to 1. | No textures; derivative-smoothed radial front and fading interior. This is the field component, without damage, camera shake or particles. |
| 20 | `createBattleBackdrop` | A UV plane behind battle sprites. | No textures or noise loops; wave distortion and cosine palette. Does not distort combatants. |
| 35 | `createPaintingRipple` | Subdivided UV plane with a painting texture. | One vertex wave; zero/one fragment samples. Four edges are pinned; touch detection and destination transition are caller-owned. |
| 36 | `createRetroMetal` | Mesh with normals; preferably unlit material. | Procedural matcap bands or one `matcapTexture` sample. No environment capture; reflections do not show nearby objects. |
| 17 | `createFuzzyScreenEffect` | Stage postprocessing; fade `strength` after the status effect ends. | One warped input sample. Arbitrary composed input may require an intermediate render target. |
| 87 | `createNightVisionEffect` | Stage postprocessing while goggles are active. | Luminance remap, grain hash and vignette. No history buffer; cannot reveal geometry the scene never rendered. |

The catalog still contains exactly 100 ideas. This page documents the first
eight components; the [second batch](retro-effects-batch-2.md) adds eight more,
bringing coverage to 16 entries. Existing ability effects can supply parts of
later spells, but are not counted as complete catalog implementations.

## Material usage

```ts
import { createPaletteCycle, createPaintingRipple, createPowerBomb } from '@zylem/shaders';

const invincibility = createPaletteCycle({
  baseTexture: characterTexture,
  transparent: true, // sprite alpha; omit for an opaque mesh
  speed: 0.6,
});
// Zylem entity: material: { shader: invincibility }
invincibility.uniforms.strength.value = 0; // restore base color

const painting = createPaintingRipple({
  baseTexture: paintingTexture,
  color: '#ffffff', // no extra tint
  amplitude: 0.2,
});
// Use a subdivided plane, e.g. PlaneGeometry(5, 5, 48, 48).
painting.uniforms.center.value.set(0.3, 0.6); // touch position in UV space
painting.uniforms.strength.value = 0; // return to the original geometry

const bomb = createPowerBomb({ progress: 0 });
// Set progress = clamp(elapsed / duration, 0, 1) in your game update.
// Progress 0 and 1 produce zero alpha. Remove/hide the mesh at completion.
bomb.uniforms.progress.value = 0.4;
```

All material factories return `{ colorNode, uniforms, ... }` compatible with
Zylem's `material: { shader }`. With raw Three.js, use
`MeshBasicNodeMaterial`, assign `colorNode`, any `positionNode`, and the
returned transparency/blending/side settings. Set `depthWrite = false` for
ghosts, alpha sprites and additive bomb quads; keep depth testing enabled.
Materials, geometry and optional textures are caller-owned and must be disposed
when no longer used.

Use sRGB color space for sRGB artwork and matcaps; masks are linear data
(`NoColorSpace`). Shader factories never change texture filtering, wrapping or
ownership. `createGhost({ detailMask })` uses the mask's red channel:
1 makes that part of the source fully opaque, 0 uses body opacity; source alpha
still controls the silhouette.

Painting displacement follows local normals and leaves supplied normals
unchanged, so use an unlit material for the intended painted appearance. Keep
UVs in 0..1. If displacement approaches the size of the mesh, expand its bounds
or disable frustum culling to avoid early clipping. Set Power Bomb `aspect` to
plane width / height for circular rings on a rectangular quad.

## Screen effects

```ts
import { createFuzzyScreenEffect, createNightVisionEffect } from '@zylem/shaders/postprocessing';

const fuzzy = createFuzzyScreenEffect({ amplitude: 0.018 });
const night = createNightVisionEffect({ gain: 2 });
// Stage config: postProcessingEffects: [fuzzy.effect, night.effect]
fuzzy.uniforms.strength.value = 0;
night.uniforms.strength.value = 0;
```

Both transform the current pipeline and preserve alpha. Put the Fuzzy warp
before color-only effects: Three.js `convertToTexture` reuses a texture/pass
input, but renders an arbitrary composed node to a texture before resampling
it. Prefer one final postprocessing chain; measure any added intermediate pass.
The warp clamps sampling to the input edges. Strength 0 disables its offset.
Night vision's strength 0 returns the incoming color.

Animated factories accept `manualTime: true`; update `uniforms.time.value`
in seconds for repeatable captures. Otherwise they use renderer time. The
`speed` multiplier works in both modes. Ghost, Power Bomb and metal have no
internal clock; opacity, progress and object motion are controlled by the game.

## Showcase and validation

Open the **Retro Game Effects** section:

- `/demos/palette-cycle`: shaded original sprite and strength/speed controls.
- `/demos/ghost`: same sprite with opaque facial details over colored bars.
- `/demos/power-bomb`: lifetime scrubber, including both invisible endpoints.
- `/demos/battle-backdrop`: palette, frequency, distortion and speed controls.
- `/demos/painting-ripple`: angled 48×48 subdivided checker plane.
- `/demos/retro-metal`: rotating knot to inspect highlight motion.
- `/demos/fuzzy-screen`: moving sphere and straight vertical edges.
- `/demos/night-vision`: colored objects at different light levels.

The showcase generates its small sprite and mask locally and disposes them on
stage teardown. No network image load is needed.

Build/type checks do not compile the lazy TSL graph on a GPU or prove visual
fidelity. Browser rendering and device timings remain to be verified. Inspect
all eight routes on a WebGPU browser, including zero-strength/lifetime
endpoints, transparency against bright backgrounds and route cleanup.

For measurements, use the [GPU benchmark recipe](ability-effects.md):
fix viewport, pixel ratio, geometry, effect coverage and animation phase; warm
up first; compare GPU frame-time distributions with the effect enabled and
disabled, separately from CPU submission time. Test overlapping transparent
instances as well as one effect. Record adapter/backend and sample count.
These designs have bounded work, but **no measured speedup is claimed**.
