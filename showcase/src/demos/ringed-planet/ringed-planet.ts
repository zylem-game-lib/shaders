/** Blue ocean world using the reusable Zylem graphics API. Requires game-lib 0.9.13+. */
import {
	createCamera,
	createGame,
	createStage,
	Perspectives,
} from "@zylem/game-lib/core";
import { createCelestialBody } from "@zylem/game-lib/graphics";
import { createOrbitPath, OrbitBehavior } from "@zylem/game-lib/behavior";
import type { ShowcaseDemo } from "../../demo-types";

export default function createDemo(): ShowcaseDemo {
	const planet = createCelestialBody({
		name: "Zylem",
		radius: 20,
		surface: {
			type: "ocean",
			oceanColor: "#0864c1",
			landColor: "#155bb1",
			oceanCoverage: 0.8,
		},
		atmosphere: { color: "#5aafff", thickness: 0.035 },
		rings: { innerRadius: 25, outerRadius: 36, tilt: -26, color: "#ef493b" },
		gravity: { surfaceAcceleration: 2.5 },
	});

	const innerMoon = createCelestialBody({ name: "Inner moon", radius: 1.4, seed: 84, rotationPeriod: 48, surface: { type: "rock", color: "#c4c9d1" } });
	const outerMoon = createCelestialBody({ name: "Outer moon", radius: 1, seed: 85, rotationPeriod: 71, surface: { type: "rock", color: "#b9beca" } });
	const innerOrbit = innerMoon.use(OrbitBehavior, {
		around: planet,
		path: createOrbitPath({ semiMajorAxis: 39.6, inclination: -26, phase: 35 }),
	});
	const outerOrbit = outerMoon.use(OrbitBehavior, {
		around: planet,
		path: createOrbitPath({ semiMajorAxis: 48, eccentricity: 0.04, inclination: 26, phase: 210 }),
	});
	const bodies = [planet, innerMoon, outerMoon];
	const orbits = [innerOrbit, outerOrbit];

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
		...bodies,
	);

	return {
		game: createGame({ id: "shader-showcase-ringed-planet" }, stage),
		description:
			"A blue ocean planet with subtly darker blue-purple land, soft blue clouds, a light-blue atmosphere, and red rings tilted upward to the right. Two natural moons follow crossed orbits; the inner moon travels just outside the ring.",
		controls: [
			{
				type: "range",
				label: "Animation speed",
				min: 0,
				max: 3,
				step: 0.05,
				value: 1,
				onChange: (value) => { bodies.forEach(body => body.setTimeScale(value)); orbits.forEach(orbit => orbit.setTimeScale(value)); },
			},
			{
				type: "range",
				label: "Animation time (seconds)",
				min: 0,
				max: 150,
				step: 0.5,
				value: 0,
				onChange: (value) => { bodies.forEach(body => body.setTime(value)); orbits.forEach(orbit => orbit.setTime(value)); },
			},
		],
	};
}
