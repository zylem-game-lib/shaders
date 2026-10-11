# Ability casting effects

Eight reusable TSL effects based on visual designs and formulas in
[AbilityCastingThreeJS](https://github.com/achrefelouafi/AbilityCastingThreeJS/tree/e856fac570a219df2f41ef204396a7cb97edff20).
These are simplified interpretations, not pixel-identical ports of the nine
complete spell sequences. Models, ragdolls, targeting, particles, scene holes,
depth prepasses and screen refraction remain application concerns.

## Factories and source mapping

Factories return Zylem-compatible shader objects with runtime uniforms. Each
has its own showcase route under **Ability Effects**.

| Factory | Apply to | Upstream reference | Cost/appearance tradeoff |
| --- | --- | --- | --- |
| `createAbilitySigil` | UV quad on ground or at caster's hands | `LanceMaterials.js` sigil; `ChainMaterials.js` seal | Analytic rings, radial ticks and two squares replace loops over glyph/line segments. Marks replace the source's rune alphabet. |
| `createAbilityPortal` | UV quad at entry/exit location | `WolfMaterials.js` rift; `SharkMaterials.js` portal | One noise field and spiral/rim; no floor cutout, capture or refraction pass. Additive interior leaves the background visible. |
| `createAbilityBeam` | Camera-facing ribbon, UV.x along length | `LanceMaterials.js` beam | Core/halo share one quad instead of three nested cylinder shells; caller handles camera-facing orientation. |
| `createAbilityLightning` | Camera-facing quad between endpoints | `GyroscopeMaterials.js` bolt | GPU noise varies a centerline at 12 Hz. No CPU path rebuilding or fork geometry. |
| `createAbilityFlame` | Upright quad/open cylinder, UV.y=0 at base | `DragonMaterials.js` ring | Height-masked 2D field replaces layered volumetric-looking fire; soft UV.x edges leave a small cylinder seam. |
| `createAbilityBurst` | UV sphere | `effects/BurstSphere.js` | One vertex sine replaces 3D FBM/ridged displacement; UV erosion/rim replace multiple elemental modes and soft-depth intersection. |
| `createAbilityAura` | Open cylinder, UV.y=0 at base | `WolfMaterials.js` column | One streak field, rim and height fade; no scene-depth sampling or softened intersections. |
| `createAbilityCrystal` | Faceted UV mesh | `AmethystMaterials.js` crystal | Opaque stylized directional shading/veins; no PBR, refraction or source-specific vertex attributes. Use flat normals for facets. |

Source paths are under `src/materials/` unless indicated.
The MIT attribution in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) ships
in the npm package. No upstream external art asset is bundled.

## Usage

```ts
import {
  createAbilityNoiseTexture,
  createAbilityPortal,
  createAbilityBeam,
} from '@zylem/shaders';

const noiseTexture = createAbilityNoiseTexture(32, 7); // allocate once
const portal = createAbilityPortal({
  noiseTexture,
  detail: 'low',
  manualTime: true,
  color: '#8055ff',
});
const beam = createAbilityBeam({ noiseTexture, color: '#37baff' });

// Entity configuration: material: { shader: portal }
portal.uniforms.time.value = elapsedSeconds;
portal.uniforms.open.value = openingProgress; // 0..1
beam.uniforms.head.value = projectileProgress; // 0..1 along UV.x
beam.uniforms.tail.value = 0;

// After removing/disposing ALL materials that use this lookup:
noiseTexture.dispose();
```

In raw Three.js, assign the returned nodes/material state to a
`MeshBasicNodeMaterial` from `three/webgpu`. Set `depthWrite = false` for
transparent effects and `toneMapped = false` for untonemapped additive light.
The showcase explicitly configures these flags on its materials. Do not
multiply material opacity a second time: output alpha already contains it.

Geometry must have normals and UVs in 0..1. Sigil/portal quads center on
UV (0.5, 0.5). Beam/lightning UV.x runs from emitter to target and UV.y spans
width. Transforms set world size/orientation. Burst displacement uses local
units and expands with lifetime progress. With `displacement: 0`, its
`positionNode` is omitted; scale the mesh yourself if expansion is required.
Remove/hide expired effects: alpha zero does not remove fragment work.

## Controls and resource ownership

- Common uniforms: color, hotColor, intensity, opacity, speed, seed, time.
  Time uses the renderer clock unless `manualTime: true`; then the caller
  updates `uniforms.time.value`. This supports repeatable paused frames.
- Detail, manualTime, noiseTexture, maskTexture, sigil segments and burst
  displacement are creation-time choices. Recreate the material to change them.
- Low detail uses one 2D noise evaluation; high uses two. Sigil uses none.
  A noise texture replaces these with one/two samples. Optional maskTexture
  adds one red-channel lookup. Opaque crystal ignores opacity/mask.
- Textures must contain linear data (`NoColorSpace`); noise should use
  `RepeatWrapping`. Masks use red, not alpha. Factories never mutate or
  dispose caller textures and do not allocate textures themselves.
- `createAbilityNoiseTexture()` explicitly allocates deterministic noise:
  32×32 RGBA by default, 4 KiB plus mipmaps. Its caller owns disposal.
- Texture sampling trades arithmetic for bandwidth and changes the appearance.
  Benchmark both modes on target devices; neither is universally faster.

## Performance intent

Structural savings: bounded noise detail, optional shared lookup, one mesh per
effect, no added full-screen passes, analytic repeated shapes, and GPU animation
without per-frame CPU vertex uploads. Double-sided transparent Three.js
materials can use two draws, so one mesh does not guarantee one draw.
Screen coverage and overlap can dominate arithmetic savings.

**No numerical speedup against the upstream renderer has been measured.**
The visual complexity and workload differ. Confirm acceptable appearance and
equivalent framing before claiming a speedup on any device.

## Benchmark recipe

1. Fix device/browser, framebuffer dimensions, camera, geometry, antialiasing,
   blend state and revisions. Measure identical animation times.
2. Precompile and warm up about 120 frames; collect at least 300 valid samples.
   Track initial compilation separately.
3. Use optional WebGPU timestamp queries around the relevant render pass;
   read results asynchronously. CPU command submission time is not GPU time.
   Account for timer quantization and reject invalid samples.
4. Report median/p95 GPU milliseconds and a matched simple-material baseline,
   then test the complete game scene with and without the effect.
5. Sweep 720p/1080p/4K, low/high detail, procedural/texture noise, and 1/10/50
   overlapping effects. Compare integrated/mobile and discrete GPUs.
6. Validate visibility: a closed portal or expired burst is not a fair
   comparison with a fully visible upstream spell.

References:
[WebGPU timestamp queries](https://developer.chrome.com/blog/new-in-webgpu-121#timestamp_queries_in_compute_and_render_passes),
[Three.js Renderer](https://threejs.org/docs/pages/Renderer.html).
