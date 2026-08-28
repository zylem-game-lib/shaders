import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devPort = Number(process.env.PORT ?? '3332');

export default defineConfig({
	plugins: [solidPlugin()] as any,
	build: {
		target: 'esnext',
	},
	resolve: {
		// Collapse every `three` / `three/webgpu` / `three/tsl` specifier onto a
		// single physical copy so the node system (and its shared `three.core`
		// realm) is never duplicated across the bundle. solid-js is deduped so
		// @zylem/ui (compiled from its shipped TSX source) shares the app's
		// Solid runtime instead of its own copy.
		dedupe: ['three', 'solid-js'],
		alias: [
			// Solid-only: route valtio's React-coupled root entry to vanilla.
			{ find: /^valtio$/, replacement: 'valtio/vanilla' },
			// The library lives one level up in this repo. Resolving it to source
			// rather than `dist` means shader edits hot-reload without a tsup
			// rebuild; the published exports map is covered by CI's build.
			{
				find: /^@zylem\/shaders\/postprocessing$/,
				replacement: path.resolve(__dirname, '../src/postprocessing/index.ts'),
			},
			{
				find: /^@zylem\/shaders$/,
				replacement: path.resolve(__dirname, '../src/index.ts'),
			},
		],
	},
	assetsInclude: ['**/*.wasm'],
	optimizeDeps: {
		// @zylem/ui/components resolves to TypeScript source; keep it out of
		// esbuild prebundling (which would apply the React JSX transform) so
		// vite-plugin-solid compiles it instead.
		// @zylem/behaviors and @zylem/runtime are excluded so the runtime's
		// `new URL('./zylem_runtime.wasm', import.meta.url)` keeps resolving
		// next to the real module instead of vite's prebundle cache.
		// Excluding @zylem/behaviors leaves game-lib's `@zylem/behaviors/core`
		// import bare inside the prebundled chunk, which pnpm can only resolve
		// from here if this app declares @zylem/behaviors itself — hence the
		// direct dependency on what is otherwise a transitive package.
		exclude: ['@zylem/ui', '@zylem/behaviors', '@zylem/runtime'],
	},
	server: {
		port: Number.isFinite(devPort) ? devPort : 3332,
		fs: {
			// Repo root (which owns the shader library source) plus sibling
			// polyrepo dirs when zw-linked.
			allow: [
				path.resolve(__dirname, '..'),
				path.resolve(__dirname, '../../behaviors'),
				path.resolve(__dirname, '../../runtime'),
				path.resolve(__dirname, '../../zylem'),
			],
		},
	},
	root: __dirname,
});
