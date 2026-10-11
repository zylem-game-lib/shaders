import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox, createLight, createSphere } from '@zylem/game-lib/entity';
import { createBlobShadow, createHitSpark, createRainbowRoad, createWaterRipple, type ZylemParameterizedShader } from '@zylem/shaders';
import { Color, Mesh, PlaneGeometry } from 'three';
import type { ShowcaseControl, ShowcaseDemo } from '../../demo-types';
import { colorControl, rangeControl } from './controls';

export type RetroVfxKind = 'water-ripple' | 'blob-shadow' | 'rainbow-road' | 'hit-spark';

const descriptions: Record<RetroVfxKind, string> = {
	'water-ripple': '#16 · Water-entry ripple. Scrub progress to expand and fade two rings above a water-colored surface.',
	'blob-shadow': '#38 · Blob shadow follows a moving sphere on a flat receiver. Height controls sphere elevation and shadow size/opacity.',
	'rainbow-road': '#55 · Rainbow bands follow road UVs. Speed 0 freezes the palette; the road is a single opaque plane.',
	'hit-spark': '#62 · Additive contact flash. Scrub progress to inspect its lifetime. The game supplies hit-stop and impact placement.',
};

export function retroVfxDemo(kind: RetroVfxKind): ShowcaseDemo {
	const shader: ZylemParameterizedShader = kind === 'water-ripple' ? createWaterRipple()
		: kind === 'blob-shadow' ? createBlobShadow({ height: 1.5 })
		: kind === 'rainbow-road' ? createRainbowRoad() : createHitSpark();
	const u = shader.uniforms;
	const groundEffect = kind !== 'hit-spark';
	const geometry = new PlaneGeometry(kind === 'rainbow-road' ? 4 : 4.5, kind === 'rainbow-road' ? 16 : 4.5);
	const entity = createBox({
		size: { x: 1, y: 1, z: 1 }, position: { x: 0, y: groundEffect ? 0.02 : 0, z: 0 },
		collision: { static: true, sensor: true }, material: { shader },
	});
	entity.onSetup(({ me }: any) => {
		(me.mesh ?? me.group)?.traverse?.((child: unknown) => {
			if (!(child instanceof Mesh)) return;
			if (child.geometry !== geometry) child.geometry.dispose();
			child.geometry = geometry;
			for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
				material.depthWrite = !shader.transparent;
				material.toneMapped = false;
			}
		});
		if (groundEffect) me.setRotation(-Math.PI / 2, 0, 0);
	});
	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: groundEffect ? { x: 6, y: 7, z: 10 } : { x: 0, y: 0, z: 8 },
		target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage({ backgroundColor: '#111529' }, camera);
	if (kind === 'blob-shadow' || kind === 'water-ripple') {
		stage.add(createBox({
			size: { x: 12, y: 0.3, z: 12 }, position: { x: 0, y: -0.15, z: 0 },
			collision: { static: true, sensor: true },
			material: { color: new Color(kind === 'blob-shadow' ? '#a29d85' : '#174b6b') },
		}));
	}
	if (kind === 'blob-shadow') {
		const caster = createSphere({ radius: 0.5, collision: { static: true, sensor: true }, material: { color: new Color('#e89a54') } });
		let time = 0;
		entity.onUpdate(({ me, delta }) => {
			time += delta;
			me.setPosition(Math.sin(time * 0.6) * 2, 0.02, 0);
			caster.setPosition(Math.sin(time * 0.6) * 2, 0.5 + u.height.value, 0);
		});
		stage.add(caster);
	}
	stage.add(entity);
	stage.add(createLight({ type: 'ambient', intensity: 1.5 }));
	stage.add(createLight({ type: 'directional', intensity: 2, position: { x: 3, y: 7, z: 5 } }));
	stage.onDestroy(() => geometry.dispose());
	const controls: ShowcaseControl[] = [];
	for (const [name, min, max, step] of [
		['progress', 0, 1, 0.01], ['opacity', 0, 1, 0.01], ['width', 0.001, 0.025, 0.001],
		['height', 0, 5, 0.05], ['heightFalloff', 0, 1, 0.01], ['softness', 0, 1, 0.01],
		['repeats', 0, 8, 0.1], ['speed', 0, 1, 0.01], ['phase', 0, 1, 0.01],
		['intensity', 0, 4, 0.05], ['rotation', 0, Math.PI * 2, 0.01],
	] as const) {
		if (u[name]) controls.push(rangeControl(name, u[name], min, max, step));
	}
	for (const name of ['color', 'coreColor']) {
		if (u[name]) controls.push(colorControl(name, u[name]));
	}
	return { game: createGame({ id: 'shader-showcase-' + kind }, stage), controls, description: descriptions[kind] };
}
