import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox } from '@zylem/game-lib/entity';
import { createAbilityAura, createAbilityBeam, createAbilityBurst, createAbilityCrystal, createAbilityFlame, createAbilityLightning, createAbilityNoiseTexture, createAbilityPortal, createAbilitySigil } from '@zylem/shaders';
import { CylinderGeometry, IcosahedronGeometry, Mesh, PlaneGeometry, SphereGeometry } from 'three';
import type { ShowcaseDemo } from '../../demo-types';
import { colorControl, rangeControl } from './controls';

const factories = {
	sigil: createAbilitySigil, portal: createAbilityPortal, beam: createAbilityBeam,
	lightning: createAbilityLightning, flame: createAbilityFlame,
	burst: createAbilityBurst, aura: createAbilityAura, crystal: createAbilityCrystal,
};
export type AbilityDemoKind = keyof typeof factories;

/** Each route isolates one effect. A caller-owned texture demonstrates lookup mode. */
export function abilityDemo(kind: AbilityDemoKind): ShowcaseDemo {
	const noiseTexture = createAbilityNoiseTexture();
	const shader = factories[kind]({ noiseTexture });
	const u = shader.uniforms;
	const geometry = kind === 'burst' ? new SphereGeometry(2, 32, 16)
		: kind === 'crystal' ? new IcosahedronGeometry(2, 0)
		: kind === 'aura' ? new CylinderGeometry(1.5, 1.5, 4, 32, 1, true)
		: new PlaneGeometry(kind === 'beam' || kind === 'lightning' ? 8 : 5, kind === 'beam' || kind === 'lightning' ? 2 : 5);
	const entity = createBox({
		size: { x: 1, y: 1, z: 1 },
		collision: { static: true, sensor: true },
		material: { shader },
	});
	entity.onSetup(({ me }: any) => {
		const target = me.mesh ?? me.group;
		target?.traverse?.((child: unknown) => {
			if (child instanceof Mesh) {
				if (child.geometry !== geometry) child.geometry.dispose();
				child.geometry = geometry;
				// Explicit for these translucent VFX; keep opaque crystal depth.
				const materials = Array.isArray(child.material) ? child.material : [child.material];
				for (const material of materials) {
					material.depthWrite = !shader.transparent;
					material.toneMapped = false;
				}
			}
		});
	});
	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: { x: 0, y: 0.5, z: 10 }, target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage({ backgroundColor: '#080c18' }, camera);
	stage.add(entity);
	stage.onDestroy(() => { geometry.dispose(); noiseTexture.dispose(); });
	const controls = [
		rangeControl('Intensity', u.intensity, 0, 4, 0.05),
		rangeControl('Speed', u.speed, 0, 4, 0.05),
		colorControl('Color', u.color), colorControl('Hot color', u.hotColor),
	];
	if (kind !== 'crystal') controls.push(rangeControl('Opacity', u.opacity, 0, 1, 0.01));
	for (const [name, min, max, step] of [
		['progress', 0, 1, 0.01], ['open', 0, 1, 0.01], ['head', 0, 1, 0.01],
		['tail', 0, 1, 0.01], ['height', 0, 1, 0.01], ['charge', 0, 1, 0.01],
		['coreWidth', 0.005, 0.4, 0.005], ['lineWidth', 0.003, 0.06, 0.001],
		['jaggedness', 0, 0.4, 0.01], ['turbulence', 0, 0.6, 0.01],
		['noiseScale', 1, 16, 0.25], ['rimPower', 0.1, 6, 0.1],
	] as const) {
		if (u[name]) controls.push(rangeControl(name, u[name], min, max, step));
	}
	return {
		game: createGame({ id: 'shader-showcase-ability-' + kind }, stage), controls,
		description: 'AbilityCastingThreeJS-inspired ' + kind + '. Single mesh, low detail, 32×32 noise lookup. Adjust lifetime controls to inspect cast phases.',
	};
}
