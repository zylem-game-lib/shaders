# Retro effects: second implementation batch

Eight more components from the [100-effect catalog](retro-game-effects.md),
bringing coverage after this batch to **16 catalog entries**. The
[third batch](retro-effects-batch-3.md) adds 25 more for a total of **41**. These are original visual
interpretations; no original game code or art is included.

| Catalog | Factory | Application | Work and limits |
| --- | --- | --- | --- |
| 3 | `createIrisTransition` | Close the outgoing stage around a screen-space point. Use a black destination for a classic level-exit iris. | One distance mask; handles off-center targets and viewport aspect. Uses the two frames supplied by the transition pipeline. |
| 7 | `createLanternConeEffect` | Darken the screen outside a directional cone and small pool around the character. | Color-only operation, no new samples/passes. Does not calculate wall occlusion; game projects the origin/facing to screen UVs. |
| 16 | `createWaterRipple` | Place two expanding rings above a water surface when a character enters. | One additive quad, no textures. Ring component only; splash particles and refraction are separate. |
| 38 | `createBlobShadow` | Put a soft dark disk on the receiving ground under a character; update height to shrink/fade it. | One normally blended quad, no shadow map. Game supplies ground position/normal; cannot wrap over discontinuous terrain. |
| 55 | `createRainbowRoad` | Color a UV-mapped road with repeated, optionally moving rainbow bands. | One opaque material, no textures. Track geometry and longitudinal UVs belong to the game. |
| 62 | `createHitSpark` | Billboard a short star-shaped flash at an impact. | One additive quad, no textures. Game supplies hit-stop, timing, camera facing and contact placement. |
| 86 | `createThermalVisionEffect` | Apply a false-color temperature ramp to the current view. | No added sample using luminance; one sample with a caller-owned heat texture. Luminance is only a visual proxy, not target/temperature detection. |
| 88 | `createChaffInterferenceEffect` | Disrupt a radar or electronic camera view with static and row dropouts. | Two hashes, no textures/history/intermediate pass. Apply to the feed's pipeline if the rest of the screen should stay unchanged. |

All three screen effects preserve input alpha and transform the **current**
pipeline node. They can follow a warp effect without forcing another texture
conversion. Transparent materials still cost fill rate and blending bandwidth;
multiple large overlapping quads can be expensive despite their small geometry.
No measured speedup is claimed.

## Materials and lifetimes

```ts
import {
  createWaterRipple, createBlobShadow, createRainbowRoad, createHitSpark,
} from '@zylem/shaders';

const ripple = createWaterRipple({ progress: 0 });
const shadow = createBlobShadow({ height: 2, opacity: 0.6 });
const road = createRainbowRoad({ repeats: 3, speed: 0 });
const spark = createHitSpark({ progress: 0, rotation: Math.PI / 4 });
// Zylem entity: material: { shader: ripple } (or shadow/road/spark)

// Drive progress from elapsed / duration, clamped to 0..1.
ripple.uniforms.progress.value = 0.35;
spark.uniforms.progress.value = 0.2;
shadow.uniforms.height.value = 1.5;
```

Ripple and spark are invisible at progress 0 and 1. Their factories do not own
a timer, spawn particles, destroy entities or pause the game. Hide/remove the
mesh after its lifetime so invisible quads stop consuming fragment work.

Use square 0..1 UV planes for ripple, shadow and spark. Scale the whole plane
to size the effect. Rotate ripple/shadow planes to match the receiving surface
and offset them slightly along its normal to prevent z-fighting. Billboard
sparks toward the camera. A road's V coordinate should follow its length;
`axis: 'u'` is a baked alternative. `repeats` controls complete rainbow cycles.

With raw Three.js, use `MeshBasicNodeMaterial` and copy `colorNode`,
`transparent`, `blending` and `side` from the factory result. Disable
`depthWrite` for ripple, shadow and spark, while retaining depth testing. Road
is opaque and should write depth. Dispose caller-created materials/geometry.

`createRainbowRoad` and `createChaffInterferenceEffect` accept
`manualTime: true`; set `uniforms.time.value` in seconds for deterministic
captures. `speed` applies to either manual or renderer time.

## Iris transition

```ts
import { createIrisTransition } from '@zylem/shaders';

const iris = createIrisTransition({ center: { x: 0.35, y: 0.6 }, softness: 0.015 });
game.nextStage({ transition: { duration: 1.2, shader: iris } });
// Project the player's position to the transition frame's UV convention:
iris.uniforms.center.value.set(0.4, 0.55);
```

This follows the same `{ shader, uniforms }` contract as
`createStageTransition`. Progress 0 returns the outgoing frame and 1 returns
the incoming frame, including zero softness and off-center irises. Softness is
measured in screen-height units. The center is clamped to the viewport; the
farthest corner sets the starting radius. The effect closes from outside inward;
it does not add a black intermediate frame automatically.

## Vision and interference

```ts
import {
  createLanternConeEffect, createThermalVisionEffect, createChaffInterferenceEffect,
} from '@zylem/shaders/postprocessing';

const lantern = createLanternConeEffect({ radius: 0.7, halfAngle: 0.5 });
// Stage config: postProcessingEffects: [lantern.effect]
lantern.uniforms.center.value.set(0.5, 0.4);
lantern.uniforms.angle.value = Math.PI / 2; // +V; 0 points toward +U

const thermal = createThermalVisionEffect({ heatTexture: optionalHeatTexture });
const chaff = createChaffInterferenceEffect({ strength: 0.7, blockSize: 3 });
// Use separately or compose intentionally, e.g. [thermal.effect, chaff.effect].
chaff.uniforms.strength.value = 0; // original input
```

Lantern radius uses screen-height units, with aspect correction. Project game
positions and facing into the same UV convention as the postprocessing frame;
the shader does not inspect the camera or world geometry. The cone is a
visibility treatment, not a light source/shadow caster.

`heatTexture` is an optional linear-data (`NoColorSpace`) red-channel texture
aligned with the current input's UVs: 0 is cold, 1 hot. Keep its dimensions and
orientation aligned when resizing or composing with screen warps. Rendering a
separate heat map has its own cost, outside this shader. The factory never
allocates, changes or disposes the texture. Without it, gain/bias apply to scene
luminance. These three effects return the incoming color at strength 0.

## Showcase and validation

The **Retro Game Effects** section includes:

- `/demos/iris-wipe`: two stages, editable center, softness and duration.
- `/demos/lantern-cone`: editable origin, facing, angle, range and ambient level.
- `/demos/water-ripple`: ring lifetime/width controls over a water-colored plane.
- `/demos/blob-shadow`: moving caster with height and softness controls.
- `/demos/rainbow-road`: tilted track with repeats, palette phase and speed.
- `/demos/hit-spark`: contact-flash lifetime and rotation controls.
- `/demos/thermal-vision`: luminance-proxy demo with gain/bias controls.
- `/demos/chaff-interference`: static size, dropout, color and speed controls.

`pnpm build && pnpm test:shaders` runs eleven source-generation checks. They
build these lazy TSL graphs through Three's WGSL builder, including the optional
heat-texture path, manual clocks, transition endpoints and composition with an
upstream color operation. CI also runs library typechecking and the production
showcase build. The test harness uses a device-free baseline feature profile;
it does **not** validate WGSL with a GPU driver or verify rendered pixels.

Before assigning performance ratings, inspect the demos in a WebGPU browser
and follow the [benchmark recipe](ability-effects.md). Check wide/portrait
viewports, zero-strength/lifetime endpoints, transparent overlap and resource
cleanup. GPU timings and rendered visual fidelity remain unverified.
