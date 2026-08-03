# @zylem/shaders

WebGPU-compatible TSL shaders and postprocessing effects for the [Zylem](https://github.com/zylem-game-lib/zylem) game framework.

This repository is a pnpm workspace:

| Package | Path | Role |
| --- | --- | --- |
| [`@zylem/shaders`](./packages/shaders) | `packages/shaders` | Publishable shader library |
| [`@zylem/shader-showcase`](./packages/shader-showcase) | `packages/shader-showcase` | Private Solid/Vite demo app |

## Requirements

- Node >= 22.12.0
- pnpm >= 10.32.1
- A WebGPU-capable browser for the showcase

## Quick start

```bash
pnpm install
pnpm --filter @zylem/shaders build
pnpm dev
```

Showcase runs on [http://localhost:3332](http://localhost:3332) by default.

## Library

```bash
pnpm build:shaders
pnpm typecheck
pnpm lint
```

See [`packages/shaders/README.md`](./packages/shaders/README.md) for the public API.

## Publish

```bash
pnpm build:shaders
pnpm publish:shaders
```

Or push a `v*` tag to trigger the GitHub Actions publish workflow (requires `NPM_TOKEN` secret).

## Local linking

From the polyrepo manager (`zw`), `@zylem/shaders` can be linked into consumers such as `zylem-examples` and the monorepo while you iterate on shader sources.
