import { createCamera, createGame, createStage, Perspectives } from '@zylem/game-lib/core';
import { createBox, createLight } from '@zylem/game-lib/entity';
import {
	createBattleBackdrop, createGhost, createPaintingRipple, createPaletteCycle,
	createPowerBomb, createRetroMetal, type ZylemParameterizedShader,
} from '@zylem/shaders';
import { Color, Mesh, PlaneGeometry, TorusKnotGeometry } from 'three';
import type { ShowcaseControl, ShowcaseDemo } from '../../demo-types';
import { colorControl, rangeControl } from './controls';
import { createRetroSprite } from './retro-sprite';

export type RetroMaterialKind = 'palette-cycle' | 'ghost' | 'power-bomb' | 'battle-backdrop' | 'painting-ripple' | 'retro-metal';

const descriptions: Record<RetroMaterialKind, string> = {
	'palette-cycle': '#1 · Invincibility palette cycling. Original grayscale sprite retains shading and alpha. Strength 0 restores its base color.',
	ghost: '#2 · Ghost body transparency. The facial mask keeps eyes and mouth opaque as the body fades over the background.',
	'power-bomb': '#12 · Expanding Power Bomb. Scrub Progress from 0 to 1: an additive circular field expands, then fades completely.',
	'battle-backdrop': '#20 · Psychedelic battle backdrop. Scrolling wave bands and an animated palette on one plane.',
	'painting-ripple': '#35 · Painting portal surface. A subdivided checker plane ripples along its normals; all four edges stay pinned.',
	'retro-metal': '#36 · Metallic character treatment on a rotating knot. Reflection-like matcap bands need no environment capture.',
};

export function retroMaterialDemo(kind: RetroMaterialKind): ShowcaseDemo {
	const sprite = kind === 'palette-cycle' || kind === 'ghost' ? createRetroSprite() : null;
	let shader: ZylemParameterizedShader;
	switch (kind) {
		case 'palette-cycle': shader = createPaletteCycle({ baseTexture: sprite!.color, transparent: true, speed: 0.6 }); break;
		case 'ghost': shader = createGhost({ baseTexture: sprite!.color, detailMask: sprite!.detail }); break;
		case 'power-bomb': shader = createPowerBomb(); break;
		case 'battle-backdrop': shader = createBattleBackdrop(); break;
		case 'painting-ripple': shader = createPaintingRipple({ amplitude: 0.5, speed: 0.6 }); break;
		case 'retro-metal': shader = createRetroMetal(); break;
	}
	const u = shader.uniforms;
	const geometry = kind === 'retro-metal' ? new TorusKnotGeometry(1.5, 0.5, 96, 12)
		: kind === 'painting-ripple' ? new PlaneGeometry(5.5, 5.5, 48, 48)
		: new PlaneGeometry(kind === 'battle-backdrop' ? 8 : 5.5, 5.5);
	const entity = createBox({
		size: { x: 1, y: 1, z: 1 }, collision: { static: true, sensor: true }, material: { shader },
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
		if (kind === 'painting-ripple') me.setRotation(0, -0.3, 0);
	});
	if (kind === 'retro-metal') {
		let angle = 0;
		entity.onUpdate(({ me, delta }) => {
			angle += delta * 0.3;
			me.setRotation(angle * 0.3, angle, 0);
		});
	}
	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: { x: 0, y: 0, z: 10 }, target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage({ backgroundColor: '#101627' }, camera);
	// Contrasting bars make ghost alpha and additive falloff easy to inspect.
	if (shader.transparent) {
		for (const [i, color] of ['#16465a', '#87613d', '#3f335f', '#235849'].entries()) {
			stage.add(createBox({
				size: { x: 2, y: 7, z: 0.2 }, position: { x: i * 2 - 3, y: 0, z: -1 },
				collision: { static: true, sensor: true }, material: { color: new Color(color) },
			}));
		}
	}
	stage.add(entity);
	stage.add(createLight({ type: 'ambient', intensity: 2 }));
	stage.onDestroy(() => {
		geometry.dispose();
		sprite?.color.dispose();
		sprite?.detail.dispose();
	});
	const controls: ShowcaseControl[] = [];
	for (const [name, min, max, step] of [
		['strength', 0, 1, 0.01], ['speed', 0, 3, 0.05], ['opacity', 0, 1, 0.01],
		['progress', 0, 1, 0.01], ['width', 0.005, 0.15, 0.005],
		['intensity', 0, 3, 0.05], ['frequency', 1, 14, 0.1],
		['distortion', 0, 0.3, 0.005], ['paletteSpeed', 0, 1, 0.01],
		['amplitude', 0, 1, 0.01], ['contrast', 0, 1, 0.01], ['rimStrength', 0, 1, 0.01],
	] as const) {
		if (u[name]) controls.push(rangeControl(name, u[name], min, max, step));
	}
	for (const name of ['color', 'hotColor']) {
		if (u[name]) controls.push(colorControl(name, u[name]));
	}
	return { game: createGame({ id: 'shader-showcase-' + kind }, stage), controls, description: descriptions[kind] };
}
