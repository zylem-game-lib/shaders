import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createLight } from '@zylem/game-lib/entity';
import { createIrisTransition } from '@zylem/shaders';
import { Color } from 'three';
import type { ShowcaseDemo } from '../../demo-types';
import { rangeControl } from '../_shared/controls';

export default function createDemo(): ShowcaseDemo {
	const iris = createIrisTransition();
	const settings = { duration: 1.5, hold: 2 };
	const stages = ['#38668d', '#9a4b44'].map(color => {
		const cube = createBox({ size: { x: 3, y: 3, z: 3 }, collision: { static: true, sensor: true }, material: { color: new Color('#f6d789') } });
		let angle = 0;
		cube.onUpdate(({ me, delta }) => { angle += delta * 0.4; me.setRotation(angle, angle, 0); });
		const stage = createStage({ backgroundColor: color }, createCamera({ position: { x: 0, y: 1, z: 10 }, target: { x: 0, y: 0, z: 0 } }));
		stage.add(cube);
		stage.add(createLight({ type: 'ambient', intensity: 2 }));
		return stage;
	});
	let elapsed = 0;
	let first = true;
	const game = createGame({ id: 'shader-showcase-iris-wipe' }, ...stages).onUpdate(({ delta }) => {
		elapsed += delta;
		if (elapsed < settings.duration + settings.hold) return;
		elapsed = 0;
		const transition = { duration: settings.duration, shader: iris };
		if (first) game.nextStage({ transition }); else game.previousStage({ transition });
		first = !first;
	});
	return {
		game,
		description: '#3 · Circular level-exit wipe. The outgoing view closes around a configurable focal point. Auto-transitions between two stages; use a black destination for a classic iris-to-black.',
		controls: [
			rangeControl('Softness', iris.uniforms.softness, 0, 0.15, 0.001),
			{ type: 'range', label: 'Center U', min: 0, max: 1, step: 0.01, value: 0.5, onChange: value => { iris.uniforms.center.value.x = value; } },
			{ type: 'range', label: 'Center V', min: 0, max: 1, step: 0.01, value: 0.5, onChange: value => { iris.uniforms.center.value.y = value; } },
			{ type: 'range', label: 'Duration (seconds)', min: 0.2, max: 4, step: 0.1, value: settings.duration, onChange: value => { settings.duration = value; } },
		],
	};
}
