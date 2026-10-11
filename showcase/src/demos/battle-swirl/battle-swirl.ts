import { createCamera, createGame, createStage } from '@zylem/game-lib/core';
import { createBox, createLight } from '@zylem/game-lib/entity';
import { createBattleSwirlTransition } from '@zylem/shaders';
import { Color } from 'three';
import type { ShowcaseDemo } from '../../demo-types';
import { rangeControl } from '../_shared/controls';

export default function createDemo(): ShowcaseDemo {
	const swirl = createBattleSwirlTransition();
	const settings = { duration: 1.5, hold: 2 };
	const stages = ['#36658b', '#75446f'].map(color => {
		const stage = createStage({ backgroundColor: color }, createCamera({ position: { x: 0, y: 1, z: 10 }, target: { x: 0, y: 0, z: 0 } }));
		for (const x of [-3, 0, 3]) stage.add(createBox({
			size: { x: 1.5, y: 3, z: 1 }, position: { x, y: 0, z: 0 },
			collision: { static: true, sensor: true }, material: { color: new Color('#dec895') },
		}));
		stage.add(createLight({ type: 'ambient', intensity: 2 }));
		return stage;
	});
	let elapsed = 0;
	let first = true;
	const game = createGame({ id: 'shader-showcase-battle-swirl' }, ...stages).onUpdate(({ delta }) => {
		elapsed += delta;
		if (elapsed < settings.duration + settings.hold) return;
		elapsed = 0;
		const transition = { duration: settings.duration, shader: swirl };
		if (first) game.nextStage({ transition }); else game.previousStage({ transition });
		first = !first;
	});
	return {
		game, description: '#68 · Battle-entry swirl. The outgoing frame twists around an editable center while the incoming stage fades in.',
		controls: [
			rangeControl('Turns', swirl.uniforms.turns, -3, 3, 0.05),
			{ type: 'range', label: 'Center U', min: 0, max: 1, step: 0.01, value: 0.5, onChange: value => { swirl.uniforms.center.value.x = value; } },
			{ type: 'range', label: 'Center V', min: 0, max: 1, step: 0.01, value: 0.5, onChange: value => { swirl.uniforms.center.value.y = value; } },
			{ type: 'range', label: 'Duration', min: 0.2, max: 4, step: 0.1, value: settings.duration, onChange: value => { settings.duration = value; } },
		],
	};
}
