import { DataTexture, LinearFilter, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, RGBAFormat, UnsignedByteType } from 'three';

/** Allocate once, share across effects, dispose after the last material.
 * Default 32x32: 4 KiB before mipmaps. No DOM/canvas dependency.
 */
export function createAbilityNoiseTexture(size = 32, seed = 1): DataTexture {
	if (!Number.isInteger(size) || size < 2 || size > 256) {
		throw new RangeError('Ability noise texture size must be an integer from 2 to 256.');
	}
	let state = seed >>> 0;
	const data = new Uint8Array(size * size * 4);
	for (let i = 0; i < data.length; i += 4) {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		const value = state >>> 24;
		data[i] = value;
		data[i + 1] = value;
		data[i + 2] = value;
		data[i + 3] = 255;
	}
	const map = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
	map.name = 'AbilityNoise';
	map.wrapS = map.wrapT = RepeatWrapping;
	map.magFilter = LinearFilter;
	map.minFilter = LinearMipmapLinearFilter;
	map.generateMipmaps = true;
	map.colorSpace = NoColorSpace;
	map.needsUpdate = true;
	return map;
}
