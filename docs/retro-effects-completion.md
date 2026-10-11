# Retro catalog completion: the remaining 59 effects

This batch supplies reusable components and demos for every remaining row of the
[100-entry catalog](retro-game-effects.md). Coverage is now **100/100**: 36
material factories (including the flare core/light pair), 15 particle/card
systems, two mesh-afterimage systems, one sword ribbon, four transitions and
one directional reveal effect in this batch.

These are modern interpretations of the catalog's visual ideas. A component is
not a complete original-game sequence: game logic still triggers attacks,
changes scenes, updates collisions and provides animation sockets or alternate
scene images. No original game artwork is included. Visual review and measured
GPU performance remain pending.

## Factories and application

Import factories from `@zylem/shaders`, except `createXRayScopeEffect`, which is
in `@zylem/shaders/postprocessing`. Every route is under `/demos/`.

| # | Factory | Demo route | Application |
| --- | --- | --- | --- |
| 4 | `createPerspectiveTrack` | `/demos/perspective-track` | Project a caller-owned map with heading and offset controls; a checker map is the fallback. |
| 5 | `createItemRoulette` | `/demos/item-roulette` | Scroll a horizontal item atlas with cubic deceleration; progress 1 lands on Target. |
| 8 | `createMirrorWarpTransition` | `/demos/mirror-warp` | Ripple and brighten the view while transitioning between two world scenes. |
| 9 | `createEtherBurst` | `/demos/ether-burst` | Strike a vertical bolt, then expand jagged arcs around the caster. |
| 10 | `createBombosRing` | `/demos/bombos-ring` | Expand a segmented flame ring across a ground-aligned card. |
| 11 | `createGroundShock` | `/demos/ground-shock` | Send concentric shocks across the floor; add camera shake in the game if desired. |
| 13 | `createSpeedAfterimages` | `/demos/speed-afterimages` | Stamp tinted snapshots of a supplied static or baked-pose mesh during a dash. |
| 15 | `createXRayScopeEffect` | `/demos/xray-scope` | Reveal an alternate scene image inside an aimable scan cone. |
| 18 | `createBossGrowth` | `/demos/boss-growth` | Grow the visible boss mesh with a flashing transformation envelope; gameplay bounds stay external. |
| 25 | `createBrambleParallax` | `/demos/bramble-parallax` | Scroll two bramble image layers at different rates using a camera-driven offset. |
| 26 | `createRotatingRoom` | `/demos/rotating-room` | Rotate room imagery around its center; camera heading and collision remain application responsibilities. |
| 28 | `createChainedExplosions` | `/demos/chained-explosions` | Stagger expanding fire cards over the boss before the game removes it. |
| 29 | `createOverheadRotation` | `/demos/overhead-rotation` | Rotate the overhead map image and move its focus with heading and offset. |
| 32 | `createAirshipMap` | `/demos/airship-map` | Project a map from a higher apparent altitude with a fogged horizon. |
| 34 | `createDashDust` | `/demos/dash-dust` | Stamp expanding dust at a moving runner; combine with SpeedAfterimages for a full dash sequence. |
| 37 | `createVanishCap` | `/demos/vanish-cap` | Fade a character into a scan-lined rim silhouette while retaining readable edges. |
| 40 | `createCollectibleBurst` | `/demos/collectible-burst` | Emit a bounded radial star burst when a collectible is acquired. |
| 41 | `createDinsFire` | `/demos/dins-fire` | Expand a translucent fiery sphere from the caster and fade its shell. |
| 45 | `createSwordRibbon` | `/demos/sword-ribbon` | Join recent blade endpoints into a short fading ribbon; feed animation socket positions. |
| 46 | `createElementalArrowTrail` | `/demos/elemental-arrow-trail` | Stamp elemental stars at the projectile's previous positions; tint per element. |
| 47 | `createWaterTentacle` | `/demos/water-tentacle` | Bend a rooted subdivided tube with a traveling wave; use a tapered mesh rooted at local Y=0. |
| 49 | `createMaskTransformTransition` | `/demos/mask-transform` | Flash and briefly zoom while changing between transformation scenes. |
| 50 | `createTimeResetTransition` | `/demos/time-reset` | Pull both scenes through a radial vortex during the time reset. |
| 51 | `createMoonDebris` | `/demos/moon-debris` | Drop falling debris cards with gravity over the scene; repeat bursts for a falling moon sequence. |
| 52 | `createDriftSmoke` | `/demos/drift-smoke` | Leave rising smoke at a drifting tire's moving contact point. |
| 53 | `createLightningShrink` | `/demos/lightning-shrink` | Flash and shrink the visible vehicle mesh; the game owns collision and speed changes. |
| 54 | `createBooInvisibility` | `/demos/boo-invisibility` | Blend the vehicle into a pulsing pale rim silhouette. |
| 56 | `createArwingThruster` | `/demos/arwing-thruster` | Attach a tapered flickering engine flare behind the craft. |
| 57 | `createLaserImpact` | `/demos/laser-impact` | Emit a brief radial spray of bright cross-shaped impact sparks. |
| 58 | `createSmartBomb` | `/demos/smart-bomb` | Expand a cool spherical shock shell with moving bands. |
| 59 | `createDamageSmoke` | `/demos/damage-smoke` | Leave dark expanding smoke behind a damaged craft as it moves. |
| 61 | `createKnockbackTrail` | `/demos/knockback-trail` | Stamp pale puffs along the launched character's path. |
| 63 | `createWatercraftWake` | `/demos/watercraft-wake` | Place a twin-rail foam wake with central churn on the water behind a hull. |
| 64 | `createCrestSpray` | `/demos/crest-spray` | Launch droplets upward from a moving wave crest, then pull them down with gravity. |
| 67 | `createDistanceFog` | `/demos/distance-fog` | Blend terrain surfaces toward the fog color using camera-space distance. |
| 69 | `createCureColumn` | `/demos/cure-column` | Raise six staggered sparkle lanes through the target during healing. |
| 70 | `createFireSpell` | `/demos/fire-spell` | Grow a noisy tapered fire plume through a one-shot lifetime. |
| 71 | `createIceSpell` | `/demos/ice-spell` | Raise a faceted crystal from its base, highlight its faces and fade it. |
| 72 | `createBoltStrike` | `/demos/bolt-strike` | Draw a jagged vertical strike and branching arcs at the target. |
| 73 | `createLimitAura` | `/demos/limit-aura` | Wrap the character in a sharp rising charge aura. |
| 74 | `createSummonArenaTransition` | `/demos/summon-arena` | Split the view into alternating horizontal strips while entering the summon arena. |
| 75 | `createDrawStream` | `/demos/draw-stream` | Curve successive magic stars from source positions toward an editable target. |
| 76 | `createGunbladeFlash` | `/demos/gunblade-flash` | Combine a diagonal cross flash and expanding impact ring; the game decides hit timing. |
| 77 | `createTranceAura` | `/demos/trance-aura` | Surround the character with broad pink undulations and rising bands. |
| 78 | `createMistAtmosphere` | `/demos/mist-atmosphere` | Layer low-lying, height-weighted drifting mist cards through a scene. |
| 80 | `createAlucardAfterimages` | `/demos/alucard-afterimages` | Keep a longer blue-purple history of static or baked-pose character silhouettes. |
| 82 | `createShieldSpellFlare` | `/demos/shield-spell-flare` | Burst radial rays and a ring from the shield when its spell triggers. |
| 83 | `createSaveGeometry` | `/demos/save-geometry` | Counter-rotate luminous square and diamond outlines around the save point. |
| 84 | `createSpellbookPages` | `/demos/spellbook-pages` | Orbit a bounded set of rectangular lined pages around the casting point. |
| 85 | `createOpticalCamouflage` | `/demos/optical-camouflage` | Refract a scene image captured without the character; the caller supplies that background texture. |
| 89 | `createSearchlight` | `/demos/searchlight` | Place a fading cone card over the searched area and rotate it with the lamp; no shadow test is implied. |
| 90 | `createMaskCompanion` | `/demos/mask-companion` | Orbit and bob an original stylized mask card around the supplied player position. |
| 92 | `createTntDebris` | `/demos/tnt-debris` | Throw colored debris cards upward and outward under gravity after an explosion. |
| 93 | `createPickupFlight` | `/demos/pickup-flight` | Curve collectible-colored cards toward a target; project HUD targets into the chosen effect plane in the game. |
| 94 | `createFlameBreath` | `/demos/flame-breath` | Extend a noisy widening horizontal flame from the mouth along local +X. |
| 95 | `createGemSparkle` | `/demos/gem-sparkle` | Pulse and rotate a small star glint at a gem's position. |
| 97 | `createColoredBackdrop` | `/demos/colored-backdrop` | Blend colored horizon bands behind distant terrain and match the scene's fog color. |
| 99 | `createSpectralMorph` | `/demos/spectral-morph` | Deform subdivided scenery and tint it toward a spectral palette; authored world variants remain external. |
| 100 | `createFlareIllumination` | `/demos/flare-illumination` | Attach a flickering core and finite-range point light to the flare; surrounding objects need lit materials. |

## Materials and transitions

Material factories return `{ colorNode, positionNode?, uniforms, ... }` and can
be passed as `material: { shader }`. For raw Three.js copy the returned nodes,
`transparent`, `side` and optional `blending` to `MeshBasicNodeMaterial`. Use
`depthWrite = false` for translucent cards, shells and sprites. Opaque map,
backdrop and fog materials retain depth writes. Prefer unlit materials for all
vertex deformation; displaced normals are not reconstructed.

Most materials expose `color`, `hotColor`, `intensity`, `opacity`, `time` and
`speed`. Use nonnegative intensity and opacity in 0..1. `manualTime: true` uses
`uniforms.time.value` in seconds, multiplied by speed. Progress-controlled
materials need the game to advance `uniforms.progress.value` from 0 to 1; they
do not remove or hide their entities when finished. Some shared controls do not
affect static parts: map materials use heading/offset rather than the clock;
fog uses near/far; morphs use progress. The showcase exposes relevant controls.

The spell factories share `RetroSpellOptions`: `progress`, `strength`, `width`
and optional `noiseTexture` for fire. Strength 0 hides all of them. Ether,
Bombos, ground shock, Din's Fire, Smart Bomb, Cure, Fire, Ice, Bolt, gunblade
flash and shield flare have zero alpha at progress 0 and 1. Thruster, Limit,
Trance, save geometry, searchlight, breath, gem sparkle and flare are persistent
and ignore progress. Their width changes line/plume shapes where applicable.

Boss growth, lightning shrink, water tentacle and spectral morph share
`RetroMorphOptions`: progress, amount and optional baseTexture. Growth scales
by `1 + amount * easedProgress`; shrink removes at most 95% of the size. Their
endpoint meshes persist. Growth/shrink leave gameplay and physics bounds alone.

```ts
import {
  createPerspectiveTrack, createItemRoulette, createWaterTentacle,
  createMirrorWarpTransition,
} from '@zylem/shaders';

const track = createPerspectiveTrack({ mapTexture: trackMap });
track.uniforms.heading.value = vehicleHeading; // radians
track.uniforms.offset.value.set(mapX, mapY);   // map UV units

const roulette = createItemRoulette({ atlas: itemAtlas, items: 4, target: 2 });
roulette.uniforms.progress.value = 1; // stops on cell 2 (zero-based)

const tentacle = createWaterTentacle({ amount: 0.2 });
// Root a subdivided, tapered Y-axis tube at y=0. Use an unlit material.

const warp = createMirrorWarpTransition();
game.nextStage({ transition: { duration: 1.5, shader: warp } });
```

Geometry conventions:

- Circular spells use square 0..1 UV quads. Ground shock, Bombos and watercraft
  wake use a quad rotated onto the ground; the wake begins at V=0 and widens
  toward V=1. Its parent follows the hull and rotates with heading.
- Thrusters/auras/columns use local XY cards. Flame breath grows along +U (+X).
  Searchlight begins at U=0.5, V=0 and widens toward V=1. It is a visible cone
  card, without volumetric integration, occlusion or a shadow-map pass.
- Din's Fire and Smart Bomb use smooth spheres; Ice uses flat-normal low-poly
  geometry rooted at Y=0. The showcase supplies a five-sided crystal.
- Water tentacle needs a tapered tube subdivided along Y, rooted at Y=0.
  Spectral morph needs subdivided geometry. Expand bounds or disable frustum
  culling for displaced meshes; the demos disable it. Deformations do not move
  colliders, author alternate worlds or snapshot skeletal animation.
- Distance fog is a surface material using camera-space distance. Apply it to
  the relevant scene meshes and match the background color. `far` is clamped
  above `near`; this factory does not sample scene depth or fog unrelated meshes.
- Bramble parallax accepts optional foreground/background RGBA textures; offset
  scrolls them at rates 1 and 0.3. The fallback is original procedural vines.
  Rotating room and overhead rotation intentionally share a centered map
  transform; their different gameplay/camera contexts stay in the application.

Textures are caller-owned. Color artwork uses `SRGBColorSpace`; noise and masks
use `NoColorSpace`. Map sampling wraps UVs explicitly; author repeating images.
The optional fire/mist noise reads red and expects repeat wrapping. Item roulette
expects one horizontal atlas of equal cells, clamp wrapping and gutters around
artwork to limit filtering bleed. Integer `items`, `target` and `cycles` control
its cubic ease-out; progress 1 aligns the selected item cell exactly.

Optical camouflage requires a scene capture **without the camouflaged object**;
it samples that image in screen UVs and adds a small normal-based offset. X-ray
requires a view-aligned alternate image including hidden terrain; its cone
blends RGBA over the current postprocessing input. Aperture is a half-angle in
radians, range is in screen-height units, and center is normalized UV. Strength
0 or range 0 returns the input. Neither effect creates or disposes render targets.
Demos use a labeled static procedural substitute, so they do not prove live
capture alignment. The game owns camera matching, aspect, UV orientation,
refresh cadence and the extra capture cost. Never relabel a linear render-target
texture as sRGB just because static artwork uses that color space.

All four transitions take `{ strength, color, center }`, return
`{ shader, uniforms }`, and use two supplied frame samples. Their deformation and
flash envelopes are zero at both endpoints, preserving the corresponding
outgoing/incoming RGBA frame. `convertToTexture` can allocate an intermediate
when its input is a composed node rather than an existing texture/pass.

## Particle and card systems

The 15 systems return `{ mesh, shader, uniforms, update, trigger, reset, dispose }`.
Add `mesh` to a Three scene/group. They own a fixed-capacity instanced quad
geometry and unlit node material. Default capacity is 32, except eight pages and
one mask. Counts must be integers from 1 to 256 and cannot change after creation.
`duration`, `size` and `rate` must be positive and finite; deterministic `seed`
controls birth layout. CPU updates record births in reusable typed arrays;
vertex shaders calculate motion from birth time. No per-frame particle objects
are allocated and no render target is created.

```ts
import { createElementalArrowTrail, createTntDebris, createDrawStream } from '@zylem/shaders';
const trail = createElementalArrowTrail({ count: 48, rate: 30, duration: 0.8 });
scene.add(trail.mesh);
// Absolute seconds; emitter coordinates are LOCAL to trail.mesh.
trail.update(elapsedSeconds, projectilePosition);

const debris = createTntDebris({ count: 24, seed: 7 });
scene.add(debris.mesh);
debris.trigger(explosionPosition, elapsedSeconds);
debris.update(elapsedSeconds);

const stream = createDrawStream();
scene.add(stream.mesh);
stream.update(elapsedSeconds, casterPosition, targetPosition);
// On teardown:
trail.dispose(); debris.dispose(); stream.dispose();
```

Continuous emitters are dash dust, elemental arrow, drift smoke, damage smoke,
knockback trail, crest spray and Draw. Call `update(seconds, emitter, target?)`
each frame. Birth times keep their cadence and positions interpolate between
the last two emitter samples. A long frame drops excess births and writes at
most capacity entries; this is bounded catch-up, not an exact simulation of the
missing path. Teleports should call `reset()` before restarting the clock/path.

Explosions, collectible sparks, moon debris, laser impacts, TNT and pickup
flights are bursts. They start at local origin/time 0; call `trigger(origin,
seconds)` to replace that burst. Chained explosions stagger births over one
configured duration. Gravity applies to moon debris, TNT and spray. Draw and
pickup use curved source-to-target interpolation. A HUD destination must first
be projected into the effect's coordinate plane by the game. Pages and the mask
orbit the supplied origin continuously; they are lightweight original cards,
not animated page meshes or extracted game artwork.

All cards face **local XY**. Orient the effect parent for your camera if needed;
these are not automatic camera-facing particles. Keeping the parent transform
stable while supplying local positions preserves trails. Moving the whole mesh
moves its history too. GPU lifetimes use absolute seconds; `speed` only controls
orbital page/mask movement. To change a particle simulation's playback rate,
scale the seconds supplied to update. Avoid changing `duration` mid-burst unless
retiming existing particles is intended.

`reset()` clears births/history and permits rewinding the clock. `dispose()` is
idempotent, detaches the mesh, and releases owned geometry/material. Updates
after disposal throw. Inactive slots remain in the fixed draw, with zero alpha;
hide or remove a completed emitter when it is no longer needed. Transparency
overdraw and unsorted overlapping cards remain costs even with one draw call.

## Histories, ribbons and illumination

Afterimage factories require a static or baked-pose `geometry`, with optional
`baseTexture`. They clone the geometry, create one InstancedMesh, and retain at
most 32 transforms (defaults: six speed echoes or eight Alucard echoes). The
texture is borrowed. Feed local-to-parent matrices in `update(seconds, matrix,
emitting = true)`; the echo mesh itself should remain at identity relative to
that parent. Only one snapshot is taken per update, so long frames cannot
produce a stack of identical catch-up poses. Speed echoes decay quadratically;
Alucard echoes last longer and use ordinary alpha blending.

```ts
const echoes = createSpeedAfterimages({ geometry: bakedPose, baseTexture: sprite });
scene.add(echoes.mesh);
echoes.update(seconds, character.matrixWorld); // correct when parent is world/identity
// Stop recording but let existing history expire:
echoes.update(seconds, character.matrixWorld, false);

const ribbon = createSwordRibbon({ segments: 24, duration: 0.22 });
scene.add(ribbon.mesh);
ribbon.update(seconds, bladeBaseInRibbonSpace, bladeTipInRibbonSpace);
// On teleport/weapon change: ribbon.reset(); On teardown: ribbon.dispose().
```

Afterimages do not copy a changing skeleton, morph-target pose or custom source
material. Bake the pose or supply a sprite; a live skinned-mesh snapshot system
is outside this component. Both afterimage systems fade history even when
emission stops and own only their geometry clone/material. Sword ribbon retains
2..129 endpoint pairs, updates preallocated arrays, and draws only live segments.
Call it once per frame with endpoints in its mesh's local space. Stop emission
with the optional false argument, and keep updating until it expires. Reset
before teleporting to avoid a long connecting ribbon. They all disable frustum
culling because dynamic positions can exceed original geometry bounds.

`createFlareIllumination()` returns a material-compatible shader plus a
`PointLight` and `update(seconds)`. Attach the light to the flare's location; it
has distance 8, decay 2 and no shadows by default. Update synchronizes brightness
and color with the visible core, including strength/opacity 0. Nearby surfaces
must use lit materials to receive illumination. The shader itself remains
unlit. Remove the light when the flare ends; enable shadows only after measuring
their extra rendering cost.

## Cost and validation

Material-only effects use one mesh and bounded analytic work. Fire/mist have one
noise evaluation (four hashes) or one optional texture lookup per fragment.
Map/atlas materials use one color lookup when supplied; parallax uses at most
two. Particle systems use one instanced draw and a fixed capacity. Afterimages
use one instanced draw of the supplied geometry, so vertex cost still scales
with geometry size times capacity. Ribbons upload a small fixed vertex history.
Large transparent screen coverage can dominate all of these effects.

The tests generate WGSL for all 59 new factories, including both endpoint and
midpoint transition graphs, optional texture paths, and actual InstancedMesh
source generation for echoes. CPU tests cover particle cadence/interpolation,
capacity, deterministic bursts, invalid configuration, history expiry, ribbon
draw ranges, resource ownership/disposal and flare-light synchronization. The
catalog gate checks 59 unique routes, their exports/docs and all 100 reference
IDs. Library typecheck, declaration build and showcase production build are
required alongside the suite.

Device-free WGSL generation is **not** GPU-driver validation or a rendered
image test. Source generation at an endpoint does not numerically evaluate its
pixels. Browser review, capture alignment, scene-transition cleanup and GPU
timing remain pending. No measured speedup or exact historical fidelity is
claimed. Use the [benchmark recipe](ability-effects.md) with equal viewport,
pixel ratio, geometry and covered area; include any caller-owned capture passes.
