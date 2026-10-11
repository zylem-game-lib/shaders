import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox, createLight, createSphere } from '@zylem/game-lib/entity';
import { createSpellEmphasisEffect, createTruthLensEffect } from '@zylem/shaders/postprocessing';
import { Color } from 'three';
import type { ShowcaseControl, ShowcaseDemo } from '../../demo-types';
import { colorControl, rangeControl } from './controls';
import { createRetroPreviewTextures } from './retro-preview-texture';

export function retroRevealDemo(kind: 'spell-emphasis' | 'truth-lens'): ShowcaseDemo {
	const images = createRetroPreviewTextures();
	const fx = kind === 'truth-lens' ? createTruthLensEffect({ revealTexture: images.preview })
		: createSpellEmphasisEffect({ targetMask: images.mask });
	const u = fx.uniforms;
	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: { x: 0, y: 0, z: 12 }, target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage({ backgroundColor: '#42566f', postProcessingEffects: [fx.effect] }, camera);
	stage.add(createSphere({ radius: 1, collision: { static: true, sensor: true }, material: { color: new Color('#e7cba1') } }));
	for (const x of [-4, 4]) stage.add(createBox({
		size: { x: 2, y: 4, z: 1 }, position: { x, y: 0, z: -1 },
		collision: { static: true, sensor: true }, material: { color: new Color('#82abbd') },
	}));
	stage.add(createLight({ type: 'ambient', intensity: 1.5 }));
	stage.onDestroy(() => { images.preview.dispose(); images.mask.dispose(); });
	const controls: ShowcaseControl[] = [rangeControl('Strength', u.strength, 0, 1, 0.01)];
	if (u.color) controls.push(colorControl('Backdrop tint', u.color));
	if (u.radius) {
		controls.push(rangeControl('Radius', u.radius, 0, 0.7, 0.01), rangeControl('Softness', u.softness, 0, 0.15, 0.001));
		for (const axis of ['x', 'y'] as const) controls.push({
			type: 'range', label: 'Center ' + axis, min: 0, max: 1, step: 0.01, value: u.center.value[axis],
			onChange: value => { u.center.value[axis] = value; },
		});
	}
	return {
		game: createGame({ id: 'shader-showcase-' + kind }, stage), controls,
		description: kind === 'truth-lens'
			? '#44 · Circular lens reveals a procedural alternate image. Supply a scene render-target texture to reveal hidden objects in your game.'
			: '#30 · Darkened spell backdrop; a screen-space mask protects the central target. Strength 0 restores the scene.',
	};
}
