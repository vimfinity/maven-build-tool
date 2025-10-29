# maven-build-tool

Minimal TypeScript CLI prototype.

Requirements
- Node >= 25 (project set to use Node 25 engine)
- pnpm 9+

Install

    pnpm install

Scripts

- pnpm run build   # compile TypeScript to dist/
- pnpm run dev     # run source with tsx
- pnpm start       # run compiled dist/index.js

Notes
- tsconfig targets ESNext and uses moduleResolution: Bundler.
- Dev dependencies: typescript, tsx, @types/node

Local Node 25 usage

If you want to run the project with the target Node version (25) locally, use nvm:

```bash
nvm install 25
nvm use 25
pnpm install
pnpm run build
pnpm run dev
```

The repository also includes an `.nvmrc` with `25` and a GitHub Actions workflow that runs on Node 25 to ensure CI builds use the same runtime.
