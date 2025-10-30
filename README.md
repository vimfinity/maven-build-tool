# maven-build-tool

Minimal TypeScript CLI prototype for Windows.

Requirements
- Node >= 25 (project set to use Node 25 engine)
- pnpm 10.20.0 (locked via packageManager)
- Windows (primary target platform)

Install

    pnpm install

Scripts

- pnpm run build   # compile TypeScript to dist/
- pnpm run dev     # run source with tsx
- pnpm start       # run compiled dist/index.js
- pnpm build:sea   # build Single Executable Application (.exe)

Notes
- tsconfig targets ESNext and uses moduleResolution: Bundler.
- Dev dependencies: typescript, tsx, @types/node, postject
- Fixed versions for reproducible builds (pnpm@10.20.0)

Local Node 25 usage

If you want to run the project with the target Node version (25) locally, use nvm:

```bash
nvm install 25
nvm use 25
pnpm install
pnpm run build
pnpm run dev
```

The repository includes an `.nvmrc` with `25` and a GitHub Actions workflow that runs on Node 25 to ensure CI builds use the same runtime.
