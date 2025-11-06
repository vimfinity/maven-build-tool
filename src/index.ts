// Dynamically load demos so the compiled ESM output can resolve .js files
async function tryImport<T = any>(basePath: string): Promise<T> {
	// first try with explicit .js extension (what tsc emits into dist)
	try {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore dynamic import
		return (await import(basePath + '.js')) as T;
	} catch (err) {
		// fallback to extensionless import (works when running via tsx in dev)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore dynamic import
		return (await import(basePath)) as T;
	}
}

async function main() {
	const args = process.argv.slice(2);

	if (args.includes('--ui-demo')) {
		if (!process.stdin.isTTY) {
			console.log('UI demo requires an interactive TTY. Run in a terminal, not piped.');
			process.exit(1);
		}

		try {
				const mod = await tryImport<{ default: () => Promise<void> }>('./ui/demos/ui-interactive-demo');
				await mod.default();
			process.exit(0);
		} catch (err) {
			console.error('UI demo failed:', err);
			process.exit(1);
		}
	}

	if (args.includes('--ui-multiselect-demo')) {
		if (!process.stdin.isTTY) {
			console.log('Multi-select demo requires a TTY.');
			process.exit(1);
		}

		try {
			const mod = await tryImport<{ default: () => Promise<void> }>('./ui/demos/ui-multiselect-demo');
			await mod.default();
			process.exit(0);
		} catch (err) {
			console.error('UI multi-select demo failed:', err);
			process.exit(1);
		}
	}

	if (args.includes('--ui')) {
		if (!process.stdin.isTTY) {
			console.log('Interactive UI requires a TTY.');
			process.exit(1);
		}

		try {
			const mod = await tryImport<typeof import('./ui')>('./ui');
			// create App and push main menu
			const { App, createMainMenuView } = mod;
			const app = new App();
			app.start(createMainMenuView(app as any));
			// ensure ctrl-c works
			process.on('SIGINT', () => { app.stop(); process.exit(0); });
			return;
		} catch (err) {
			console.error('Failed to start UI:', err);
			process.exit(1);
		}
	}

	console.log('Maven CLI bootstrap ready');
}

// run main() but keep top-level sync exit behavior
void main();
