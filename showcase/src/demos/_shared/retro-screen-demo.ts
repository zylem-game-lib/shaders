import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox, createLight, createSphere } from '@zylem/game-lib/entity';
import { createFuzzyScreenEffect, createNightVisionEffect } from '@zylem/shaders/postprocessing';
import { Color } from 'three';
import type { ShowcaseControl, ShowcaseDemo } from '../../demo-types';
import { rangeControl } from './controls';

export type RetroScreenKind = 'fuzzy-screen' | 'night-vision';

export function retroScreenDemo(kind: RetroScreenKind): ShowcaseDemo {
	const fx = kind === 'fuzzy-screen' ? createFuzzyScreenEffect() : createNightVisionEffect();
	const u = fx.uniforms;
	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: { x: 0, y: 1.5, z: 13 }, target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage({ backgroundColor: '#09121e', postProcessingEffects: [fx.effect] }, camera);
	for (const [i, color] of ['#cb4c49', '#379786', '#c7ac49', '#577fcc', '#9258ad'].entries()) {
		stage.add(createBox({
			size: { x: 1.2, y: 4 + i % 2, z: 1 },
			position: { x: (i - 2) * 2.2, y: -0.5, z: -1 },
			collision: { static: true, sensor: true }, material: { color: new Color(color) },
		}));
	}
	const orb = createSphere({
		radius: 1, position: { x: 0, y: 0, z: 2 },
		collision: { static: true, sensor: true }, material: { color: new Color('#e0e9ef') },
	});
	let elapsed = 0;
	orb.onUpdate(({ me, delta }) => {
		elapsed += delta;
		me.setPosition(Math.sin(elapsed) * 3, Math.cos(elapsed * 0.6), 2);
	});
	stage.add(orb);
	stage.add(createLight({ type: 'ambient', intensity: 0.35 }));
	stage.add(createLight({ type: 'directional', intensity: 2, position: { x: 4, y: 6, z: 8 } }));
	const controls: ShowcaseControl[] = [];
	for (const [name, min, max, step] of [
		['strength', 0, 1, 0.01], ['speed', 0, 3, 0.05], ['amplitude', 0, 0.1, 0.001],
		['frequency', 0.5, 10, 0.1], ['gain', 0, 6, 0.05],
		['grain', 0, 0.2, 0.005], ['vignette', 0, 1, 0.01],
	] as const) {
		if (u[name]) controls.push(rangeControl(name, u[name], min, max, step));
	}
	return {
		game: createGame({ id: 'shader-showcase-' + kind }, stage), controls,
		description: kind === 'fuzzy-screen'
			? '#17 · Fuzzy intoxication screen warp. Two animated wave offsets and one input sample; Strength 0 restores the scene.'
			: '#87 · Night vision. Green luminance, exposure lift, fine grain and vignette; Strength 0 restores the scene.',
	};
}
