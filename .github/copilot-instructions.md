# GitHub Copilot Instructions - maven-build-tool

## Project Overview

This is a **minimal TypeScript CLI tool** for Windows with Single Executable Application (SEA) support. The project follows the **KISS principle** (Keep It Simple, Stupid) and maintains a clean, production-ready baseline.

## Core Principles

1. **KISS First**: Always prefer simplicity over complexity
2. **Windows-Only**: Primary target is Windows platform
3. **Reproducible Builds**: Fixed versions for all tools (Node 25, pnpm 10.20.0)
4. **Type Safety**: Strict TypeScript with ESNext target
5. **Minimal Dependencies**: Only essential packages

## Project Structure

```
├── .github/
│   ├── workflows/          # CI/CD workflows
│   ├── dependabot.yml      # Automated dependency updates
│   └── copilot-instructions.md
├── scripts/
│   └── build-sea.sh        # SEA build script
├── src/
│   └── index.ts            # Entry point
├── package.json            # Fixed pnpm@10.20.0
├── tsconfig.json           # ESNext, strict mode
├── sea-config.json         # SEA configuration
└── .nvmrc                  # Node 25
```

## Technology Stack

- **Runtime**: Node.js 25
- **Package Manager**: pnpm 10.20.0 (locked)
- **Language**: TypeScript 5.9+ with strict mode
- **Build Tool**: tsc (no bundler needed)
- **Packaging**: Node.js SEA (Single Executable Application)
- **CI/CD**: GitHub Actions (Windows runners)

## Development Commands

```bash
pnpm install              # Install dependencies
pnpm run dev              # Run with tsx (hot reload)
pnpm run build            # Compile TypeScript to dist/
pnpm start                # Run compiled dist/index.js
pnpm run build:sea        # Build Windows .exe
```

## Code Style Guidelines

### TypeScript
- Use strict mode (enabled in tsconfig.json)
- Prefer ESNext features (async/await, etc.)
- Use explicit types, avoid `any`
- Keep functions small and focused
- Use descriptive variable names

### File Organization
- One main file philosophy: `src/index.ts`
- Only split into modules when complexity requires it
- Keep CLI logic minimal and testable

### Error Handling
- Use try/catch for async operations
- Provide clear error messages
- Exit with proper codes (0 = success, 1 = error)

## CI/CD Best Practices

### Workflows
- **ci-windows.yml**: Runs on every push/PR
  - Builds TypeScript
  - Creates SEA executable
  - Runs smoke test
  - Uploads artifact

- **release-windows.yml**: Runs on tag push (v*)
  - Builds and publishes release
  - Creates draft release on GitHub

### Performance Optimizations
- pnpm cache enabled (setup pnpm BEFORE setup-node)
- `--frozen-lockfile` for deterministic installs
- postject as devDependency (no npx overhead)
- Expected build time: ~1:30-1:40 minutes

### Dependabot
- Monthly updates for npm dependencies
- Monthly updates for GitHub Actions
- Dependencies grouped by category (typescript, build-tools)

## Single Executable Application (SEA)

### Build Process
The `scripts/build-sea.sh` script:
1. Compiles TypeScript to `dist/`
2. Creates blob with `node --experimental-sea-config`
3. Copies Node binary
4. Injects blob using postject
5. Produces `build/maven-cli.exe`

### Testing SEA
```bash
./build/maven-cli.exe
# Should output: Maven CLI bootstrap ready
```

## Version Management

### Baseline: v0.1.0
- This tag represents the production-ready baseline
- Can be restored at any time: `git checkout v0.1.0`
- Includes all core optimizations and latest dependencies

### Creating Releases
1. Update version in package.json
2. Commit changes
3. Create annotated tag: `git tag -a v0.x.x -m "Description"`
4. Push tag: `git push origin v0.x.x`
5. Release workflow auto-creates draft release
6. Review and publish release on GitHub

## When Making Changes

### Adding Features
1. Keep it minimal - does it fit the project scope?
2. Test locally with `pnpm run dev`
3. Build SEA with `pnpm run build:sea`
4. Verify executable works
5. Commit with conventional commit message

### Updating Dependencies
1. Dependabot creates PRs automatically (monthly)
2. Review changes in PR
3. CI must pass before merging
4. Merge and dependabot closes PR

### Modifying CI/CD
1. Test workflows with `workflow_dispatch` trigger
2. Ensure pnpm setup happens BEFORE node setup (for cache)
3. Keep smoke tests simple and fast
4. Monitor build times (target: < 2 minutes)

## Common Tasks

### Add New CLI Command
```typescript
// src/index.ts
console.log("Maven CLI bootstrap ready");

// Add your logic here
const args = process.argv.slice(2);
if (args[0] === 'help') {
  console.log('Usage: maven-cli [command]');
}
```

### Update Node Version
1. Update `.nvmrc`
2. Update `package.json` engines field
3. Test locally with new Node version
4. Update README if needed

### Add New Dependency
```bash
pnpm add <package>        # production
pnpm add -D <package>     # development
```

**Important**: Keep dependencies minimal! Question every new dependency.

## Troubleshooting

### CI Fails on "Verify executable"
- Check that `build/maven-cli.exe` exists
- Ensure output contains "Maven CLI bootstrap ready"
- PowerShell arrays: use `-join "\n"` before regex match

### SEA Build Fails
- Check Node version (must be 25+)
- Verify postject is in devDependencies
- Check sentinel values in build-sea.sh

### pnpm Cache Not Working
- Ensure pnpm is setup BEFORE actions/setup-node
- Verify `.nvmrc` exists and is valid
- Check cache key in workflow (should use pnpm-lock.yaml)

## Questions to Ask Before Changes

1. **Does this follow KISS?** If it adds complexity, reconsider.
2. **Is this Windows-specific?** Don't add cross-platform logic unless needed.
3. **Will this break reproducibility?** Fixed versions are intentional.
4. **Does CI pass?** Always verify before merging.
5. **Is the baseline still restorable?** Don't break v0.1.0 compatibility.

## Resources

- [Node.js SEA Documentation](https://nodejs.org/api/single-executable-applications.html)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [pnpm Docs](https://pnpm.io/)
- [GitHub Actions Docs](https://docs.github.com/actions)

---

**Remember**: This project prioritizes simplicity, maintainability, and reproducibility over features. When in doubt, keep it simple!
