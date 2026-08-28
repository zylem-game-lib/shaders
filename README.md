# @zylem/shaders

WebGPU-compatible TSL shaders and postprocessing effects for the Zylem game framework.

Every shader is a `ZylemTSLShader` (`{ colorNode, positionNode?, transparent? }`) — structurally identical to the type in `@zylem/game-lib/graphics` — so it can be passed directly to game-lib:

```ts
import { createWaterSurface, createMagicalLandscape } from '@zylem/shaders';

// As an entity material
const water = createWaterSurface({ waveSpeed: 0.8 });
// ... material: { shader: water }

// As a stage background
const landscape = createMagicalLandscape({ speed: 3 });
// ... createStage({ backgroundShader: landscape }, camera)

// Runtime tweaks via uniforms
water.uniforms.waveStrength.value = 2.0;
landscape.uniforms.color1.value.set('#ff8800');
```

## Shaders

| Factory | Use | Source / inspiration |
| --- | --- | --- |
| `createMagicalLandscape(options)` | Fullscreen background | [Magical Landscape by Sabo Sugi](https://codepen.io/sabosugi/pen/OPbXXoN) |
| `createStarryNight(options)` | Skybox background | Procedural: star layers, Milky Way band, nebula tint |
| `createAlienSky(options)` | Skybox background | Zylem examples arena Mars skybox (stars, galaxy, moon, mountains) |
| `createPlanetSurface(options)` | Mesh surface (UV sphere) | Zylem examples planet demo |
| `createPlanetRing(options)` | Transparent disk/annulus | Zylem examples planet demo |
| `createEnergyShield(options)` | Transparent shell (sphere) | Halo-style shield (fresnel rim, hex cells, recharge wave, impact flare/ripple); grew out of the 3d-asteroids ship shield |
| `createDissolve(options)` | Mesh surface (any) | [r3f dissolve-effect sandbox](https://codesandbox.io/p/sandbox/green-resonance-5fgz3d) (CSM + gl-noise) |
| `createFoliage(options)` | Collapsed-quad leaf cluster | [Stylized bush sandbox](https://codesandbox.io/p/sandbox/2u6xi2) — pair with `createFoliageClusterGeometry` |
| `createHolographic(options)` | Transparent mesh surface | [ektogamat/threejs-vanilla-holographic-material](https://github.com/ektogamat/threejs-vanilla-holographic-material) by Anderson Mancini, plus an optional vertex/color glitch (`glitchIntensity`) |
| `createArcadeDissolve(options)` | Subdivided mesh surface | Robotron 2084 enemy-destruction effect (X/Y band shredding, arcade color flash) |
| `createWaterSurface(options)` | Mesh surface (XZ water plane) | [jeantimex/threejs-water](https://github.com/jeantimex/threejs-water) surface shaders |
| `createLava(options)` | Mesh surface (UV-mapped) | [three.js webgl_shader_lava](https://github.com/mrdoob/three.js/blob/master/examples/webgl_shader_lava.html) by TheGameMaker |
| `createShadertoyWaterNoise(options)` | Mesh surface | [Shadertoy Mt2SzR](https://www.shadertoy.com/view/Mt2SzR) |
| `createShadertoyFire(options)` | Mesh surface (transparent) | [Shadertoy 3tcBzH](https://www.shadertoy.com/view/3tcBzH) |
| `createStageTransition(options)` | Stage transition (`game.nextStage({ transition })`) | [three.js webgpu_postprocessing_transition](https://threejs.org/examples/#webgpu_postprocessing_transition) |

All factories accept an options object and return the shader with a `uniforms` bag for runtime tweaking.

`createStageTransition` returns a `ZylemTransitionShader` (not a `ZylemTSLShader`): pass it as `game.nextStage({ transition: { shader: createStageTransition({ pattern: 'noise' }) } })`. Patterns: `fade`, `wipe`, `radial`, `noise`, `cells`; pass a grayscale `texture` mix map to drive the wipe instead (dark texels transition first).

`createWaterSurface` also returns a `positionNode` that displaces vertices by the wave heightfield, so apply it to a subdivided plane (e.g. `createPlane({ subdivisions: 160, ... })`). Set `waveAmplitude: 0` for a flat, normal-mapped-only surface, and pass `envMap` (a cube texture) to reflect an environment instead of the built-in horizon/zenith sky gradient.

## Shadertoy transpiler

Turn raw Shadertoy GLSL into a consumable shader at runtime (wraps the three.js addons `Transpiler` + `ShaderToyDecoder` + `TSLEncoder`):

```ts
import { parseShadertoy } from '@zylem/shaders';

const shader = parseShadertoy(`
  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    fragColor = vec4(uv, 0.5 + 0.5 * sin(iTime), 1.0);
  }
`);
```

Supported inputs: `iTime`, `iResolution`, `fragCoord`. Channels, mouse, and multipass buffers are not supported.

## Postprocessing

```ts
import { createAfterimageEffect } from '@zylem/shaders/postprocessing';

const trails = createAfterimageEffect({ damp: 0.9 });
// stage config: postProcessingEffects: [trails.effect]
trails.uniforms.damp.value = 0.97;
```

| Factory | Effect | Source / inspiration |
| --- | --- | --- |
| `createAfterimageEffect(options)` | Motion trails | three.js `AfterImageNode` (TSL port of `AfterimageShader.js`) |
| `createVhsGrainEffect(options)` | VHS tape: grain, tracking band, color fringe, scanlines | Composed from three.js CRT helpers + FilmNode-style grain |
| `createPixelationEffect(options)` | Pixel-art with normal/depth edge outlines | [three.js webgpu_postprocessing_pixel](https://github.com/mrdoob/three.js/blob/master/examples/webgpu_postprocessing_pixel.html) by Kody King |
| `createRetroEffect(options)` | PS1/CRT: vertex snapping, affine textures, dither, curvature | [three.js webgpu_postprocessing_retro](https://github.com/mrdoob/three.js/blob/master/examples/webgpu_postprocessing_retro.html) |

Effects implement `ZylemPostEffect` — `(inputNode, { scenePass, scene, camera }) => outputNode` — and plug into game-lib's render pipeline via the stage `postProcessingEffects` option or `rendererManager.setPostProcessingEffects()`.

`createPixelationEffect` and `createRetroEffect` are *pass-replacing* effects: they render their own scene pass (for extra channels or altered rasterization) rather than transforming the incoming node, so place them first in the `postProcessingEffects` array.

## Install

```sh
pnpm add @zylem/shaders three
```

`three` is a peer dependency: the library and `@zylem/game-lib` must share a single Three.js copy, because TSL nodes are not interchangeable across copies.

## Repository

This repo is the library itself — `src/` builds to the published `dist/` — plus a
nested [`showcase/`](./showcase) Solid/Vite app that exercises every shader on top
of `@zylem/game-lib`. The showcase resolves `@zylem/shaders` to source, so shader
edits hot-reload without rebuilding.

Requires Node >= 22.12.0, pnpm >= 10.32.1, and a WebGPU-capable browser for the
showcase.

```sh
pnpm install

pnpm build          # bundle the library to dist/
pnpm dev            # rebuild the library on change
pnpm typecheck
pnpm lint

pnpm showcase:dev   # showcase on http://localhost:3332
pnpm showcase:build
```

The showcase deploys as a Render static site (see [`render.yaml`](./render.yaml));
the library publishes to npm from `.github/workflows/publish.yml` on a `v*` tag.
