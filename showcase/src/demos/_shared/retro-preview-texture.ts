import { DataTexture, LinearFilter, NoColorSpace, RGBAFormat, SRGBColorSpace } from 'three';

/** Original procedural destination image and screen-space target mask. Caller disposes both. */
export function createRetroPreviewTextures(): { preview: DataTexture; mask: DataTexture } {
	const size = 64;
	const pixels = new Uint8Array(size * size * 4);
	const maskPixels = new Uint8Array(pixels.length);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const u = (x + 0.5) / size;
			const v = (y + 0.5) / size;
			const sun = Math.hypot(u - 0.68, v - 0.7) < 0.11;
			const hill = v < 0.22 + Math.sin(u * 9) * 0.08;
			const rgb = sun ? [255, 226, 125] : hill ? [26, 57, 67] : [80 + v * 80, 55 + v * 75, 100 + v * 110];
			const i = (y * size + x) * 4;
			pixels.set([...rgb.map(Math.round), 255], i);
			const m = Math.hypot(u - 0.5, v - 0.5) < 0.17 ? 255 : 0;
			maskPixels.set([m, m, m, 255], i);
		}
	}
	const preview = new DataTexture(pixels, size, size, RGBAFormat);
	const mask = new DataTexture(maskPixels, size, size, RGBAFormat);
	preview.colorSpace = SRGBColorSpace;
	mask.colorSpace = NoColorSpace;
	for (const map of [preview, mask]) {
		map.minFilter = LinearFilter;
		map.magFilter = LinearFilter;
		map.generateMipmaps = false;
		map.needsUpdate = true;
	}
	return { preview, mask };
}
