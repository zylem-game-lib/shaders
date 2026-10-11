import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox, createLight } from '@zylem/game-lib/entity';
import {
	createPerspectiveTrack, createItemRoulette, createMirrorWarpTransition, createEtherBurst,
	createBombosRing, createGroundShock, createSpeedAfterimages, createBossGrowth,
	createBrambleParallax, createRotatingRoom, createChainedExplosions, createOverheadRotation,
	createAirshipMap, createDashDust, createVanishCap, createCollectibleBurst,
	createDinsFire, createSwordRibbon, createElementalArrowTrail, createWaterTentacle,
	createMaskTransformTransition, createTimeResetTransition, createMoonDebris, createDriftSmoke,
	createLightningShrink, createBooInvisibility, createArwingThruster, createLaserImpact,
	createSmartBomb, createDamageSmoke, createKnockbackTrail, createWatercraftWake,
	createCrestSpray, createDistanceFog, createCureColumn, createFireSpell,
	createIceSpell, createBoltStrike, createLimitAura, createSummonArenaTransition,
	createDrawStream, createGunbladeFlash, createTranceAura, createMistAtmosphere,
	createAlucardAfterimages, createShieldSpellFlare, createSaveGeometry, createSpellbookPages,
	createOpticalCamouflage, createSearchlight, createMaskCompanion, createTntDebris,
	createPickupFlight, createFlameBreath, createGemSparkle, createColoredBackdrop,
	createSpectralMorph, createFlareIllumination,
} from '@zylem/shaders';
import { createXRayScopeEffect } from '@zylem/shaders/postprocessing';
import { BoxGeometry, Color, CylinderGeometry, DataTexture, Matrix4, Mesh, NearestFilter, PlaneGeometry, SphereGeometry, SRGBColorSpace, Vector3 } from 'three';
import type { ShowcaseControl, ShowcaseDemo } from '../../demo-types';
import { colorControl, rangeControl } from './controls';
import { completionDemos, type CompletionRoute } from './retro-completion-data';
import { createRetroPreviewTextures } from './retro-preview-texture';
import { createRetroSprite } from './retro-sprite';

function itemAtlas(): DataTexture {
	const data = new Uint8Array(64 * 16 * 4);
	const colors = [[244, 112, 76], [102, 210, 133], [109, 151, 239], [255, 210, 91]];
	for (let y = 0; y < 16; y++) for (let x = 0; x < 64; x++) {
		const cell = Math.floor(x / 16); const dx = (x % 16 - 7.5) / 8; const dy = (y - 7.5) / 8;
		const shape = cell % 2 ? Math.abs(dx) + Math.abs(dy) < 0.7 : dx * dx + dy * dy < 0.45;
		data.set([...(shape ? colors[cell]! : [22, 26, 45]), 255], (y * 64 + x) * 4);
	}
	const map = new DataTexture(data, 64, 16); map.colorSpace = SRGBColorSpace;
	map.minFilter = map.magFilter = NearestFilter; map.needsUpdate = true; return map;
}
const factories: Record<string, (options: any) => any> = {
	createPerspectiveTrack, createItemRoulette, createMirrorWarpTransition, createEtherBurst,
	createBombosRing, createGroundShock, createSpeedAfterimages, createBossGrowth,
	createBrambleParallax, createRotatingRoom, createChainedExplosions, createOverheadRotation,
	createAirshipMap, createDashDust, createVanishCap, createCollectibleBurst,
	createDinsFire, createSwordRibbon, createElementalArrowTrail, createWaterTentacle,
	createMaskTransformTransition, createTimeResetTransition, createMoonDebris, createDriftSmoke,
	createLightningShrink, createBooInvisibility, createArwingThruster, createLaserImpact,
	createSmartBomb, createDamageSmoke, createKnockbackTrail, createWatercraftWake,
	createCrestSpray, createDistanceFog, createCureColumn, createFireSpell,
	createIceSpell, createBoltStrike, createLimitAura, createSummonArenaTransition,
	createDrawStream, createGunbladeFlash, createTranceAura, createMistAtmosphere,
	createAlucardAfterimages, createShieldSpellFlare, createSaveGeometry, createSpellbookPages,
	createOpticalCamouflage, createSearchlight, createMaskCompanion, createTntDebris,
	createPickupFlight, createFlameBreath, createGemSparkle, createColoredBackdrop,
	createSpectralMorph, createFlareIllumination,
};

export function retroCompletionDemo(route: CompletionRoute): ShowcaseDemo {
	const row = completionDemos.find(item => item.route === route)!;
	if (row.kind === 'transition') return transitionDemo(row);
	const images = row.kind === 'screen' || route === 'optical-camouflage' ? createRetroPreviewTextures() : null;
	const sprite = row.kind === 'echo' ? createRetroSprite() : null;
	const atlas = route === 'item-roulette' ? itemAtlas() : null;
	const echoGeometry = row.kind === 'echo' ? new PlaneGeometry(1.2, 1.6) : null;
	const options: any = { manualTime: true };
	if (images) { options.backgroundTexture = images.preview; options.revealTexture = images.preview; }
	if (atlas) options.atlas = atlas;
	if (row.kind === 'echo') { options.geometry = echoGeometry; options.baseTexture = sprite!.color; }
	if (route === 'pickup-flight') options.count = 6;
	const effect: any = row.kind === 'screen' ? createXRayScopeEffect(options) : factories[row.factory]!(options);
	const runtime = row.kind === 'particles' || row.kind === 'echo' || row.kind === 'ribbon';
	const shader = runtime ? effect.shader : effect; const u = effect.uniforms;
	const geometry = row.geometry === 'sphere' ? new SphereGeometry(0.9, 32, 20)
		: row.geometry === 'tube' ? new CylinderGeometry(0.05, 0.45, 3, 12, 48).translate(0, 1.5, 0)
		: row.geometry === 'crystal' ? new CylinderGeometry(0, 0.75, 3, 5, 1).translate(0, 1.5, 0)
		: row.geometry === 'morph' ? new BoxGeometry(3, 3, 1.2, 20, 20, 8)
		: row.geometry === 'fog' ? new BoxGeometry(2, 3, 2)
		: new PlaneGeometry(row.geometry === 'ground' ? 7 : 6, 5);
	const camera = createCamera({ perspective: Perspectives.ThirdPerson,
		position: row.geometry === 'ground' ? { x: 5, y: 8, z: 10 } : { x: 0, y: 1, z: 10 }, target: { x: 0, y: 0.8, z: 0 } });
	const stage = createStage({ backgroundColor: route === 'colored-backdrop' ? '#5652aa' : '#142237', ...(row.kind === 'screen' ? { postProcessingEffects: [effect.effect] } : {}) }, camera);
	const entity = createBox({ size: { x: 1, y: 1, z: 1 }, collision: { static: true, sensor: true }, material: row.kind === 'screen' || runtime ? { color: new Color('#efca96') } : { shader } });
	entity.onSetup(({ me }: any) => {
		if (runtime) {
			const host = me.group ?? me.mesh;
			// Hide placeholder materials, keeping the parent visible for its new child.
			// Never traverse mesh.parent: for simple entities that can be the whole scene.
			host?.traverse((child: any) => {
				if (!(child instanceof Mesh)) return;
				for (const material of Array.isArray(child.material) ? child.material : [child.material]) material.visible = false;
			});
			host?.add(effect.mesh);
			return;
		}
		if (row.kind === 'screen') return;
		(me.mesh ?? me.group)?.traverse((child: any) => {
			if (!(child instanceof Mesh)) return;
			child.geometry.dispose(); child.geometry = geometry; child.frustumCulled = !shader.positionNode;
			for (const material of Array.isArray(child.material) ? child.material : [child.material]) { material.depthWrite = !shader.transparent; material.toneMapped = false; }
		});
		if (row.geometry === 'ground') me.setRotation(-Math.PI / 2, 0, 0);
		if (route === 'flare-illumination') (me.group ?? me.mesh)?.add(effect.light);
	});
	let seconds = 0; let nextBurst = 3;
	const emitter = new Vector3(); const bladeStart = new Vector3(); const bladeEnd = new Vector3(); const transform = new Matrix4();
	const motion = { emitting: 1 };
	entity.onUpdate(({ delta }) => {
		seconds += delta; emitter.set(Math.sin(seconds * 1.3) * 2, Math.cos(seconds * 0.7) * 0.6, 0);
		if (row.kind === 'particles') {
			if (['chained-explosions', 'collectible-burst', 'moon-debris', 'laser-impact', 'tnt-debris', 'pickup-flight'].includes(route) && seconds >= nextBurst) { effect.trigger(emitter, seconds); nextBurst = seconds + 3.5; }
			effect.update(seconds, emitter);
		} else if (row.kind === 'echo') effect.update(seconds, transform.makeTranslation(emitter.x, emitter.y, 0), motion.emitting > 0.5);
		else if (row.kind === 'ribbon') {
			const a = seconds * 3; bladeStart.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0); bladeEnd.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
			effect.update(seconds, bladeStart, bladeEnd, motion.emitting > 0.5);
		} else if (route === 'flare-illumination') effect.update(seconds);
		else if (u.time) u.time.value = seconds;
	});
	stage.add(entity);
	if (row.geometry === 'fog') for (const [x, z] of [[-3, -5], [3, -11]]) stage.add(createBox({ size: { x: 2, y: 3, z: 2 }, position: { x: x!, y: 0, z: z! }, collision: { static: true, sensor: true }, material: { shader } }));
	if (row.kind === 'screen' || ['vanish-cap', 'boo-invisibility', 'optical-camouflage', 'mist-atmosphere', 'flare-illumination'].includes(route)) {
		for (const x of [-3, 3]) stage.add(createBox({ size: { x: 2, y: 4, z: 1 }, position: { x, y: 0, z: -1 }, collision: { static: true, sensor: true }, material: { color: new Color('#657b9c') } }));
	}
	if (row.geometry === 'ground') stage.add(createBox({ size: { x: 10, y: 0.2, z: 10 }, position: { x: 0, y: -0.14, z: 0 }, collision: { static: true, sensor: true }, material: { color: new Color('#25404e') } }));
	stage.add(createLight({ type: 'ambient', intensity: route === 'flare-illumination' ? 0.15 : 1.5 }));
	stage.onDestroy(() => { if (runtime) effect.dispose(); effect.light?.removeFromParent(); geometry.dispose(); echoGeometry?.dispose(); images?.preview.dispose(); images?.mask.dispose(); sprite?.color.dispose(); sprite?.detail.dispose(); atlas?.dispose(); });
	const controls: ShowcaseControl[] = [];
	if (u.color) controls.push(colorControl('Color', u.color), rangeControl('Intensity', u.intensity, 0, 3, 0.05));
	if (u.opacity) controls.push(rangeControl('Opacity', u.opacity, 0, 1, 0.01));
	for (const [name, min, max, step] of [
		['progress', 0, 1, 0.01], ['strength', 0, 1, 0.01], ['width', 0.002, 0.15, 0.002], ['amount', 0, 3, 0.05],
		['heading', -Math.PI, Math.PI, 0.01], ['scale', 0.1, 3, 0.05], ['horizon', 0.1, 0.9, 0.01],
		['target', 0, 3, 1], ['density', 0, 2, 0.05], ['distortion', 0, 0.1, 0.001], ['near', 0, 15, 0.1], ['far', 1, 30, 0.1],
		['angle', -Math.PI, Math.PI, 0.01], ['aperture', 0.05, 1.5, 0.01], ['range', 0, 1.5, 0.01], ['spread', 0, 0.45, 0.01], ['size', 0.05, 1.5, 0.05],
	] as const) if (u[name] && typeof u[name].value === 'number') controls.push(rangeControl(name, u[name], min, max, step));
	if (u.offset) {
		if (typeof u.offset.value === 'number') controls.push(rangeControl('Camera offset', u.offset, -3, 3, 0.01));
		else for (const axis of ['x', 'y'] as const) controls.push({ type: 'range', label: 'Map offset ' + axis, min: -2, max: 2, step: 0.01, value: 0, onChange: value => { u.offset.value[axis] = value; } });
	}
	if (u.target?.value instanceof Vector3) for (const axis of ['x', 'y'] as const) controls.push({ type: 'range', label: 'Destination ' + axis, min: -3, max: 3, step: 0.1, value: u.target.value[axis], onChange: value => { u.target.value[axis] = value; } });
	if (row.kind === 'echo' || row.kind === 'ribbon') controls.push({ type: 'range', label: 'Emit history', min: 0, max: 1, step: 1, value: 1, onChange: value => { motion.emitting = value; } });
	return { game: createGame({ id: 'shader-showcase-' + route }, stage), controls, description: '#' + row.id + ' · ' + row.description + (route === 'optical-camouflage' || route === 'xray-scope' ? ' This demo uses an original static image as the alternate view.' : '') };
}

function transitionDemo(row: typeof completionDemos[number]): ShowcaseDemo {
	const effect = factories[row.factory]!({}); const settings = { duration: 1.5 }; let elapsed = 0; let forward = true;
	const stages = ['#376c81', '#83558b'].map(color => {
		const stage = createStage({ backgroundColor: color }, createCamera({ position: { x: 0, y: 1, z: 10 }, target: { x: 0, y: 0, z: 0 } }));
		for (const x of [-3, 0, 3]) stage.add(createBox({ size: { x: 1.5, y: 3, z: 1 }, position: { x, y: 0, z: 0 }, collision: { static: true, sensor: true }, material: { color: new Color('#dec895') } }));
		stage.add(createLight({ type: 'ambient', intensity: 1.5 })); return stage;
	});
	const game = createGame({ id: 'shader-showcase-' + row.route }, ...stages).onUpdate(({ delta }) => {
		elapsed += delta; if (elapsed < settings.duration + 2) return; elapsed = 0;
		const transition = { duration: settings.duration, shader: effect }; if (forward) game.nextStage({ transition }); else game.previousStage({ transition }); forward = !forward;
	});
	return { game, description: '#' + row.id + ' · ' + row.description, controls: [rangeControl('Strength', effect.uniforms.strength, 0, 1, 0.01), colorControl('Flash color', effect.uniforms.color), { type: 'range', label: 'Duration', min: 0.2, max: 4, step: 0.1, value: 1.5, onChange: value => { settings.duration = value; } }] };
}
