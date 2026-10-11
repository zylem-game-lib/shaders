import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox, createLight, createSphere } from '@zylem/game-lib/entity';
import {
	createBoostExhaust, createChargeGlow, createStagedAura, createFacetedBarrier, createWindMarker,
	createShieldBubble, createMuzzleFlash, createHolyPillars, createSpinSmear, createForegroundMist,
	createPsiOverlay, createLayeredRain, createSnowLayers, createRotatingTunnel, createSwimmingWake,
	createSunsetSilhouette, createDefeatDissolve, createTwistedCorridor, createGoldenGlint,
	createMistForm, createPortalPreview, createQuakeWave, type ZylemParameterizedShader,
} from '@zylem/shaders';
import { Color, CylinderGeometry, DataTexture, IcosahedronGeometry, Mesh, NearestFilter, NoColorSpace, PlaneGeometry, SphereGeometry, TorusKnotGeometry } from 'three';
import type { ShowcaseControl, ShowcaseDemo } from '../../demo-types';
import { rangeControl, colorControl } from './controls';
import { createRetroSprite } from './retro-sprite';
import { createRetroPreviewTextures } from './retro-preview-texture';

const factories = {
	'boost-exhaust': createBoostExhaust, 'charge-glow': createChargeGlow, 'staged-aura': createStagedAura,
	'faceted-barrier': createFacetedBarrier, 'wind-marker': createWindMarker, 'shield-bubble': createShieldBubble,
	'muzzle-flash': createMuzzleFlash, 'holy-pillars': createHolyPillars, 'spin-smear': createSpinSmear,
	'foreground-mist': createForegroundMist, 'psi-overlay': createPsiOverlay, 'layered-rain': createLayeredRain,
	'snow-layers': createSnowLayers, 'rotating-tunnel': createRotatingTunnel, 'swimming-wake': createSwimmingWake,
	'sunset-silhouette': createSunsetSilhouette, 'defeat-dissolve': createDefeatDissolve,
	'twisted-corridor': createTwistedCorridor, 'golden-glint': createGoldenGlint,
	'mist-form': createMistForm, 'portal-preview': createPortalPreview, 'quake-wave': createQuakeWave,
};
export type RetroCatalogKind = keyof typeof factories;
const descriptions: Record<RetroCatalogKind, string> = {
	'boost-exhaust': '#6 · Engine plume attached at V=0; Boost controls length and brightness.',
	'charge-glow': '#14 · Weapon charge orb; Charge 0 removes the glow.',
	'staged-aura': '#33 · Character aura changes size/color at one-third and two-thirds charge.',
	'faceted-barrier': '#42 · Protective shell using a low-poly shape and flat facet normals.',
	'wind-marker': '#43 · Rotating spiral ground marker; the game stores and restores the teleport location.',
	'shield-bubble': '#60 · Shield sphere shrinks and fades as strength decreases.',
	'muzzle-flash': '#66 · Muzzle fan. Scrub Progress; the game triggers a new lifetime for each shot.',
	'holy-pillars': '#79 · Vertical light shafts. Scrub Progress for the rise/fade envelope.',
	'spin-smear': '#91 · Rotating slash segments around a spinning character.',
	'foreground-mist': '#19 · Two fog layers drift independently over contrasting scenery.',
	'psi-overlay': '#21 · Concentric diamond pulses over the battle view; scrub Progress.',
	'layered-rain': '#22 · Two rain layers, with density and wind controls.',
	'snow-layers': '#23 · Two flake layers imply depth through size, opacity and speed.',
	'rotating-tunnel': '#27 · Rotating polar tunnel backdrop with radial rings.',
	'swimming-wake': '#39 · Widening foam and a waterline ripple on a ground-aligned quad.',
	'sunset-silhouette': '#24 · Original sprite darkened against a warm backdrop; Strength restores its source shading.',
	'defeat-dissolve': '#31 · Original sprite erodes in coarse cells; Progress 0 is intact and 1 is gone.',
	'twisted-corridor': '#48 · Subdivided tunnel twists around local Z. Unlit checker surface exposes the deformation.',
	'golden-glint': '#65 · Moving glints on a rotating gold knot; no environment capture.',
	'mist-form': '#81 · Vapor replaces the original sprite silhouette using a linear mask.',
	'portal-preview': '#96 · A procedural destination image inside a soft portal. Supply a render-target texture for a live view.',
	'quake-wave': '#98 · Localized traveling disturbance on a subdivided road. Front scrubs the wave position.',
};

export function retroCatalogDemo(kind: RetroCatalogKind): ShowcaseDemo {
	const sprite = ['sunset-silhouette', 'defeat-dissolve', 'mist-form'].includes(kind) ? createRetroSprite() : null;
	const destination = kind === 'portal-preview' ? createRetroPreviewTextures() : null;
	// Use the sprite's alpha as a red-channel mask without changing the existing asset.
	let silhouette = null as ReturnType<typeof createRetroPreviewTextures>['mask'] | null;
	if (kind === 'mist-form' && sprite) {
		const source = sprite.color.image.data as Uint8Array;
		const data = new Uint8Array(source.length);
		for (let i = 0; i < data.length; i += 4) data.set([source[i + 3]!, source[i + 3]!, source[i + 3]!, 255], i);
		silhouette = new DataTexture(data, sprite.color.image.width, sprite.color.image.height);
		silhouette.colorSpace = NoColorSpace;
		silhouette.minFilter = NearestFilter;
		silhouette.magFilter = NearestFilter;
		silhouette.needsUpdate = true;
	}
	const options = kind === 'portal-preview' ? { previewTexture: destination!.preview }
		: kind === 'mist-form' ? { maskTexture: silhouette! }
		: sprite ? { baseTexture: sprite.color } : {};
	const factory = factories[kind] as (options: any) => ZylemParameterizedShader;
	const shader = factory(options);
	const u = shader.uniforms;
	const flatGround = kind === 'wind-marker' || kind === 'swimming-wake';
	const geometry = kind === 'faceted-barrier' ? new IcosahedronGeometry(2, 0)
		: kind === 'shield-bubble' ? new SphereGeometry(2, 32, 16)
		: kind === 'golden-glint' ? new TorusKnotGeometry(1.4, 0.45, 96, 12)
		: kind === 'twisted-corridor' ? new CylinderGeometry(2, 2, 14, 4, 64, true)
		: kind === 'quake-wave' ? new PlaneGeometry(5, 18, 8, 128)
		: new PlaneGeometry(['foreground-mist', 'layered-rain', 'snow-layers', 'holy-pillars', 'psi-overlay'].includes(kind) ? 8 : 5.5, 5.5);
	if (kind === 'faceted-barrier') geometry.computeVertexNormals();
	if (kind === 'twisted-corridor') geometry.rotateX(Math.PI / 2);
	if (kind === 'quake-wave') geometry.rotateX(-Math.PI / 2);
	const entity = createBox({ size: { x: 1, y: 1, z: 1 }, collision: { static: true, sensor: true }, material: { shader } });
	entity.onSetup(({ me }: any) => {
		(me.mesh ?? me.group)?.traverse?.((child: unknown) => {
			if (!(child instanceof Mesh)) return;
			if (child.geometry !== geometry) child.geometry.dispose();
			child.geometry = geometry;
			// Deforming road/corridor may extend beyond the original bounds.
			if (shader.positionNode) child.frustumCulled = false;
			for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
				material.depthWrite = !shader.transparent;
				material.toneMapped = false;
			}
		});
		if (flatGround) me.setRotation(-Math.PI / 2, 0, 0);
	});
	if (kind === 'golden-glint') {
		let angle = 0;
		entity.onUpdate(({ me, delta }) => { angle += delta * 0.3; me.setRotation(angle * 0.4, angle, 0); });
	}
	const ground = flatGround || kind === 'quake-wave';
	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: kind === 'twisted-corridor' ? { x: 0, y: 0.2, z: 10 }
			: ground ? { x: 6, y: 8, z: 12 } : { x: 0, y: 0, z: 10 },
		target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage({ backgroundColor: kind === 'sunset-silhouette' ? '#de865c' : '#11182c' }, camera);
	const overlay = ['foreground-mist', 'layered-rain', 'snow-layers', 'psi-overlay', 'defeat-dissolve', 'mist-form'].includes(kind);
	if (overlay) {
		for (const [i, color] of ['#3d6479', '#93734c', '#537c63'].entries()) stage.add(createBox({
			size: { x: 2.2, y: 4 + i % 2, z: 0.5 }, position: { x: (i - 1) * 2.5, y: -0.5, z: -1 },
			collision: { static: true, sensor: true }, material: { color: new Color(color) },
		}));
	}
	if (kind === 'faceted-barrier' || kind === 'shield-bubble') stage.add(createSphere({
		radius: 0.7, collision: { static: true, sensor: true }, material: { color: new Color('#d8a575') },
	}));
	if (flatGround) stage.add(createBox({
		size: { x: 10, y: 0.2, z: 10 }, position: { x: 0, y: -0.14, z: 0 },
		collision: { static: true, sensor: true }, material: { color: new Color('#294c55') },
	}));
	stage.add(entity);
	stage.add(createLight({ type: 'ambient', intensity: 1.5 }));
	stage.onDestroy(() => {
		geometry.dispose(); sprite?.color.dispose(); sprite?.detail.dispose(); silhouette?.dispose();
		destination?.preview.dispose(); destination?.mask.dispose();
	});
	const controls: ShowcaseControl[] = [rangeControl('Intensity', u.intensity, 0, 3, 0.05), colorControl('Color', u.color)];
	if (shader.transparent) controls.push(rangeControl('Opacity', u.opacity, 0, 1, 0.01));
	if (!['sunset-silhouette', 'defeat-dissolve', 'quake-wave'].includes(kind)) controls.push(rangeControl('Speed', u.speed, 0, 3, 0.05));
	if (u.midColor) controls.push(colorControl('Middle charge color', u.midColor));
	for (const [name, min, max, step] of [
		['boost', 0, 1, 0.01], ['charge', 0, 1, 0.01], ['progress', 0, 1, 0.01], ['strength', 0, 1, 0.01],
		['pulseRate', 0, 10, 0.1], ['rimPower', 0.1, 6, 0.1], ['radius', 0.05, 0.46, 0.01],
		['turns', 0.1, 6, 0.1], ['rays', 3, 16, 1], ['columns', 1, 12, 1], ['scale', 0.5, 12, 0.1],
		['frequency', 1, 16, 0.1], ['density', 4, kind === 'snow-layers' ? 45 : 120, 1], ['wind', -1, 1, 0.01],
		['rings', 1, 20, 1], ['segments', 3, 24, 1], ['spread', 0.05, 0.45, 0.01],
		['pixels', 2, 128, 1], ['twist', -1, 1, 0.01], ['sharpness', 1, 128, 1],
		['turbulence', 0, 1, 0.01], ['softness', 0.001, 0.1, 0.001], ['front', -10, 10, 0.1],
		['amplitude', 0, 2, 0.05], ['width', 0.1, 5, 0.1],
	] as const) {
		if (u[name]) controls.push(rangeControl(name, u[name], min, max, step));
	}
	return { game: createGame({ id: 'shader-showcase-' + kind }, stage), controls, description: descriptions[kind] };
}
