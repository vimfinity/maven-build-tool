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
Interactive demos were removed from the repository as deprecated. Use the UI directly via `pnpm start` or `pnpm run dev` and the in-app views.

Notes
- Interactive widgets require a TTY (stdin.isTTY). In CI or when piped, they will not function.

Cleanup
- Removed unused/placeholder files: `RootApp.ts`, `app.ts`, `root.ts`, `service.ts`, `view-manager.ts`, `viewManager.ts`, `views/mainMenuView.ts`, `views/settingsView.ts`.
	These were empty placeholders and not referenced anywhere in the repository. If you need them again, they can be restored from git history.

Extending the UI — adding new Views
----------------------------------

Views are plain objects implementing a small interface. Example template:

```ts
// src/ui/views/myView.ts
import type { View } from '../view-manager';
import { renderHeader } from './header';

export const MyView: View = {
	render() {
		return renderHeader() + '\n' + 'My View content here\n';
	},
	onMount(vm) {
		// optional: initialize state
	},
	onInput(chunk, vm) {
		// optional: handle keys (Enter, Esc, arrows)
		if (chunk === '\u001b') vm.back(); // Esc to go back
	}
}

export default MyView;
```

Registering multiple views
--------------------------

The `ViewManager` exposes `register(name, view)` and `registerAll(map)` so you can bulk-register views from a single file:

```ts
import vm from './ui/view-manager';
vm.registerAll({ myView: MyView, other: OtherView });
```

Dynamic child views
-------------------

Use `vm.open(view)` to open anonymous child views (the manager will assign a name and manage cleanup). Use `vm.back()` or Esc to return.

Example: `vm.open({ render() { return '...'; }, onInput(c, vm) { if (c === '\u001b') vm.back(); } })`

Best practices
--------------
- Keep `render()` pure and side-effect free — return a string only.
- Handle input in `onInput` or `onMount`/`onUnmount` for lifecycle needs.
- Avoid global state — store view-local state on the view object itself (e.g. `this.__current`).
