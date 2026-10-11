# Retro effects: third implementation batch

**25 new factories and 25 showcase routes**, bringing the
[catalog](retro-game-effects.md) to **41 entries with reusable components**.
These are original interpretations of the visual ideas, not ports of console
rendering code. No original game art is included.

## Effects and application

Each route below is under `/demos/` in the **Retro Game Effects** section.

| # | Effect / factory | Route | How to apply it and what remains caller-owned |
| --- | --- | --- | --- |
| 6 | Boost exhaust — `createBoostExhaust` | `boost-exhaust` | Attach a quad at an engine nozzle, V=0 at the nozzle and +V pointing aft; `boost` lengthens/brightens the plume. Vehicle attachment and billboarding are external. |
| 14 | Charged beam glow — `createChargeGlow` | `charge-glow` | Place a glowing orb at the arm cannon; `charge` controls radius/alpha and `pulseRate` its pulse. Releasing a projectile is game logic. |
| 19 | Foreground mist — `createForegroundMist` | `foreground-mist` | Drift two normal-blended fog layers on a foreground plane. This suggests depth without volumetric scattering or depth intersections. |
| 21 | PSI attack overlay — `createPsiOverlay` | `psi-overlay` | Overlay pulsing concentric diamonds with a changing palette; drive `progress` with the attack lifetime. |
| 22 | Layered rain — `createLayeredRain` | `layered-rain` | Place a screen-facing plane over the view; two procedural streak grids differ in speed/scale. `wind` changes slant; these are not world-space particles. |
| 23 | Snowstorm layers — `createSnowLayers` | `snow-layers` | Overlay two drifting flake grids with different speeds/sizes/opacities. Apparent depth, without collision or accumulation. |
| 24 | Sunset silhouettes — `createSunsetSilhouette` | `sunset-silhouette` | Apply to a foreground sprite/mesh against a warm sky. `strength` blends source shading into a flat silhouette; the background remains separate. |
| 27 | Rotating tunnel — `createRotatingTunnel` | `rotating-tunnel` | Put an opaque polar tunnel pattern on a background plane. It is a perspective illusion, not navigable geometry. |
| 30 | Spell emphasis — `createSpellEmphasisEffect` | `spell-emphasis` | Darken/tint the current battle image; an optional screen-aligned target mask protects the spell target. The game supplies that mask. |
| 31 | Enemy defeat dissolve — `createDefeatDissolve` | `defeat-dissolve` | Erode a sprite in coarse UV cells with a colored edge; `progress` goes from intact to invisible. Remove the entity when finished. |
| 33 | Multi-stage charge aura — `createStagedAura` | `staged-aura` | Place an elongated aura behind a character. Colors and radius change at charge 1/3 and 2/3; gameplay charge thresholds remain external. |
| 39 | Swimming wake — `createSwimmingWake` | `swimming-wake` | Align a quad with the water surface and swimmer heading, V=1 toward the swimmer. Creates widening V-shaped foam and a waterline ring; no persistent wake history. |
| 42 | Faceted barrier — `createFacetedBarrier` | `faceted-barrier` | Use a low-poly shell with flat normals; facet orientation and rim glow define a pulsing protective barrier. Collision and damage prevention remain external. |
| 43 | Wind marker — `createWindMarker` | `wind-marker` | Place a rotating spiral/ring on the ground at a stored teleport point. The game stores the location and performs teleportation. |
| 44 | Truth lens — `createTruthLensEffect` | `truth-lens` | Composite an alternate scene image inside a movable circular lens. The game renders hidden/revealed objects into `revealTexture`; the shader cannot discover them. |
| 48 | Twisted corridor — `createTwistedCorridor` | `twisted-corridor` | Twist subdivided local XY cross-sections around the Z axis. This changes visible geometry only, not colliders or navigation. |
| 60 | Shield bubble — `createShieldBubble` | `shield-bubble` | Put a smooth shell around a fighter. `strength` shrinks and fades it as shield is consumed; the game handles hits and recovery. |
| 65 | Golden collectible glint — `createGoldenGlint` | `golden-glint` | Apply moving highlights to a collectible mesh. Uses view-space normals, without environment capture or reflections of nearby objects. |
| 66 | Muzzle flash — `createMuzzleFlash` | `muzzle-flash` | Attach a radial flash quad to a muzzle; trigger a short `progress` lifetime per shot. Weapon transforms and optional lights are external. |
| 68 | Battle-entry swirl — `createBattleSwirlTransition` | `battle-swirl` | Rotate the outgoing stage image around a configurable center while blending to the incoming battle. The transition pipeline provides the frames. |
| 79 | Holy light pillars — `createHolyPillars` | `holy-pillars` | Place a wide quad around a target; shafts rise during the first part of `progress`, then fade. No particle emitter or scene illumination. |
| 81 | Mist form — `createMistForm` | `mist-form` | Replace a character's image with a drifting vapor body, optionally constrained by a silhouette mask. Movement/collision changes are game logic. |
| 91 | Spin-attack smear — `createSpinSmear` | `spin-smear` | Place rotating annular slash segments around a spinning character. Set `strength` from attack state; does not sample actual motion history. |
| 96 | Portal preview — `createPortalPreview` | `portal-preview` | Show a destination image/render target inside a circular aperture. The shader samples the supplied texture; the game renders any live destination view. |
| 98 | Quake weapon wave — `createQuakeWave` | `quake-wave` | Propagate a localized vertical disturbance along a subdivided XZ road by updating `front`. Damage, collision and physical track deformation are separate. |

## Imports and controls

```ts
import {
  createBoostExhaust, createStagedAura, createDefeatDissolve,
  createFacetedBarrier, createPortalPreview, createQuakeWave,
  createBattleSwirlTransition,
} from '@zylem/shaders';
import { createSpellEmphasisEffect, createTruthLensEffect } from '@zylem/shaders/postprocessing';

const exhaust = createBoostExhaust({ boost: 0.8 });
// Entity: material: { shader: exhaust }
exhaust.uniforms.boost.value = 0; // off

const aura = createStagedAura({ color: '#5599ff', midColor: '#ffe14f', hotColor: '#a9ffbc' });
aura.uniforms.charge.value = 0.75;

const defeat = createDefeatDissolve({ baseTexture: enemyTexture, progress: 0 });
// Set progress = clamp(elapsed / duration, 0, 1).
defeat.uniforms.progress.value = 1; // invisible; game removes/hides the entity

const portal = createPortalPreview({ previewTexture: destinationTarget.texture });
const lens = createTruthLensEffect({ revealTexture: alternateSceneTarget.texture });
// Stage config: postProcessingEffects: [lens.effect]
lens.uniforms.center.value.set(0.4, 0.6);

const wave = createQuakeWave({ amplitude: 0.8, width: 2, speed: 0 });
wave.uniforms.front.value = -4; // local Z; advance this in the game update

const swirl = createBattleSwirlTransition({ turns: 1.5 });
game.nextStage({ transition: { duration: 1.2, shader: swirl } });
```

Material factories return the existing `{ colorNode, positionNode?, uniforms,
... }` shape. For raw Three.js, assign those nodes and the returned render flags
to `MeshBasicNodeMaterial`. Transparent quads/shells should normally have
`depthWrite = false`, with depth testing enabled; opaque tunnel, corridor,
gold and road materials keep depth writes. Screen-overlay quads may instead
disable depth testing as a deliberate application choice.

Most materials share `color`, `hotColor`, `intensity`, `opacity`, `speed` and
`time` uniforms. `hotColor` applies where the effect has a core/highlight;
opacity applies to transparent materials. Clock controls only affect animated
parts: silhouette and defeat dissolve are driven by strength/progress. Use
`manualTime: true` and set `uniforms.time.value` in seconds for repeatable
captures. Speed multiplies either manual time or renderer time.

Muzzle flash, PSI overlay and holy pillars have zero alpha at progress 0 and 1.
Defeat dissolve is intact at 0 and gone at 1. Exhaust, charge glow, staged aura,
barrier, bubble, swimming wake and spin smear have explicit off controls.
Factories do not advance lifetimes or remove invisible meshes.

## Geometry and textures

- Use square 0..1 UV quads for circular effects; scaling one axis stretches
  their shapes. Use a wide quad for the light pillars or weather overlay.
- Use flat-normal low-poly geometry for the faceted barrier and smooth normals
  for the shield bubble. Both render front faces to reduce shell overdraw.
- Twisted corridor needs subdivisions along **local Z**. Quake wave needs an
  **XZ** road subdivided along Z; it moves vertices in local Y. These shaders
  intentionally leave normals unchanged, so use unlit materials. Expand bounds
  or disable frustum culling when deformation exceeds the original bounds.
- Color artwork and static destination images should use `SRGBColorSpace` when
  their bytes are sRGB. Renderer-produced textures retain their renderer's
  color-space configuration. Do not relabel a linear render target as sRGB.
- Mist noise and character/target masks use linear data (`NoColorSpace`).
  `noiseTexture` reads red and expects repeat wrapping. `maskTexture` and
  `targetMask` read red: 1 includes vapor or protects the target, respectively.
- Truth-lens `revealTexture` must align with the current input's view, aspect
  and UV orientation. Rendering the alternate view is an additional cost owned
  by the caller. The lens blends **RGBA**, including the revealed image's alpha.
  Radius 0 or strength 0 returns the current input.
- Portal preview requires a supplied texture; it never starts a second camera
  or allocates a render target. Keep its UV orientation/aspect appropriate for
  the portal plane.

Factories never dispose supplied textures. The game owns their lifetime and
any associated render targets. Showcase-generated sprites, masks, destination
images and geometry are disposed on stage teardown.

## Rendering cost and review

The 22 new materials use one mesh each. Rain and snow have exactly two
procedural layers; mist has at most two noise evaluations, or two lookups when
a shared noise texture is supplied. No new effect stores frame history,
simulates particles on the CPU, ray-marches, or captures an environment.

Spell emphasis transforms the existing color and optionally samples one mask.
Truth lens adds one reveal-image sample. Battle swirl samples the two supplied
frames; Three's `convertToTexture` reuses texture/pass inputs but can allocate an
intermediate for a composed node. Shared frame/heat/reveal textures are not free:
include the caller's production passes when benchmarking.

These costs are implementation descriptions, **not measured performance
ratings**. Large transparent areas, overlap, geometry subdivision and extra
destination rendering can dominate frame time. Compare equal viewport, pixel
ratio, visible coverage and animation phase using the
[GPU benchmark recipe](ability-effects.md).

`pnpm build && pnpm test:shaders` now runs **42 WGSL source-generation tests**
across batches 2 and 3. The tests exercise all new factories, optional texture
paths, manual clocks, composition and selected boundary configurations. They
generate WGSL with a device-free feature profile; they do not validate it with a
GPU driver, render pixels, or establish exact original-game fidelity.

Browser visual review and GPU timing remain pending. Inspect all 25 routes,
particularly deformation bounds, the true/preview image UVs, alpha endpoints,
flat/smooth shell normals and stage-transition cleanup. The showcase uses
original procedural images for portal/lens demonstrations, not live secondary
scene captures.
