import { DataTexture, NearestFilter, NoColorSpace, RGBAFormat, SRGBColorSpace } from 'three';

/** Small original ghost sprite + facial-detail mask; no downloaded/ripped art. */
export function createRetroSprite(): { color: DataTexture; detail: DataTexture } {
	const size = 64;
	const rgba = new Uint8Array(size * size * 4);
	const mask = new Uint8Array(size * size * 4);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const px = (x + 0.5) / size - 0.5;
			const py = (y + 0.5) / size;
			const inside = py > 0.15 + 0.035 * Math.cos(px * 42)
				&& (py < 0.53 ? Math.abs(px) < 0.32 : px * px + (py - 0.53) ** 2 < 0.32 ** 2);
			const eyes = py > 0.56 && py < 0.66 && (Math.abs(px - 0.11) < 0.035 || Math.abs(px + 0.11) < 0.035);
			const mouth = Math.abs(px) < 0.055 && py > 0.38 && py < 0.45;
			const feature = inside && (eyes || mouth);
			const shade = feature ? 20 : Math.round(130 + py * 100 - Math.abs(px) * 70);
			const i = (y * size + x) * 4;
			rgba.set([shade, shade, shade, inside ? 255 : 0], i);
			const m = feature ? 255 : 0;
			mask.set([m, m, m, 255], i);
		}
	}
	const color = new DataTexture(rgba, size, size, RGBAFormat);
	const detail = new DataTexture(mask, size, size, RGBAFormat);
	color.colorSpace = SRGBColorSpace;
	detail.colorSpace = NoColorSpace;
	for (const map of [color, detail]) {
		map.minFilter = NearestFilter;
		map.magFilter = NearestFilter;
		map.generateMipmaps = false;
		map.needsUpdate = true;
	}
	return { color, detail };
}
