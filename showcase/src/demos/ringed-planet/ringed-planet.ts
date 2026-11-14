/** Blue ocean world using the reusable Zylem graphics API. Requires game-lib 0.9.12+. */
import {
	createCamera,
	createGame,
	createStage,
	Perspectives,
} from "@zylem/game-lib/core";
import { createPlanet } from "@zylem/game-lib/graphics";
import type { ShowcaseDemo } from "../../demo-types";

export default function createDemo(): ShowcaseDemo {
	const planet = createPlanet({
		name: "Zylem",
		radius: 20,
		surface: {
			oceanColor: "#075daf",
			landColor: "#454e89",
			oceanCoverage: 0.8,
		},
		atmosphere: { color: "#8edbff", thickness: 0.035 },
		rings: { innerRadius: 25, outerRadius: 36, tilt: 26, color: "#9cadd2" },
		moons: "crossed",
	});

	const camera = createCamera({
		perspective: Perspectives.ThirdPerson,
		position: { x: 0, y: 25, z: -115 },
		target: { x: 0, y: 0, z: 0 },
	});
	const stage = createStage(
		{
			defaultLighting: false,
			background: {
				type: "space",
				color: "#02040c",
				stars: { count: 4500, seed: 42, brightness: 1.5 },
				sun: {},
			},
		},
		camera,
		planet,
	);

	return {
		game: createGame({ id: "shader-showcase-ringed-planet" }, stage),
		description:
			"A blue ocean planet with purple-blue land, drifting clouds, a light-blue atmosphere, and shadowed rings. Two natural moons follow crossed orbits; the inner moon travels just outside the ring.",
		controls: [
			{
				type: "range",
				label: "Animation speed",
				min: 0,
				max: 3,
				step: 0.05,
				value: 1,
				onChange: (value) => planet.setTimeScale(value),
			},
			{
				type: "range",
				label: "Animation time (seconds)",
				min: 0,
				max: 150,
				step: 0.5,
				value: 0,
				onChange: (value) => planet.setTime(value),
			},
		],
	};
}
