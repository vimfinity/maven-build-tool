# UI components

This folder contains small, framework-agnostic UI components for the CLI.

Structure
- `views/` - pure render functions that return strings.
- `widgets/` - interactive widgets that use TTY for input (e.g. select).
- `demos/` - demo entrypoints to exercise widgets.

APIs (short)
- `renderHeader(): string`
- `renderFooter(): string`
- `renderMainMenu(options: string[]): string`
- `renderStatus(message: string): string`
- `interactiveSelect(options, opts?): Promise<number|number[]|null>` - interactive single/multi select.

Usage
Run interactive demos (TTY required):
```
pnpm exec tsx src/ui/demos/ui-interactive-demo.ts
pnpm exec tsx src/ui/demos/ui-multiselect-demo.ts
```

You can also use the CLI flag (in a TTY):
```
pnpm run dev -- --ui-demo
pnpm run dev -- --ui-multiselect-demo
```

Notes
- Interactive widgets require a TTY (stdin.isTTY). In CI or when piped, they will not function.

Cleanup
- Removed unused/placeholder files: `RootApp.ts`, `app.ts`, `root.ts`, `service.ts`, `view-manager.ts`, `viewManager.ts`, `views/mainMenuView.ts`, `views/settingsView.ts`.
	These were empty placeholders and not referenced anywhere in the repository. If you need them again, they can be restored from git history.
