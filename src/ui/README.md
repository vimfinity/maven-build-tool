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
Run the non-interactive demo:
```
pnpm run dev -- --ui-demo
```

Run interactive demos (TTY required):
```
pnpm exec tsx src/ui/demos/ui-interactive-demo.ts
pnpm exec tsx src/ui/demos/ui-multiselect-demo.ts
```

Notes
- Interactive widgets require a TTY (stdin.isTTY). In CI or when piped, they will not function.
