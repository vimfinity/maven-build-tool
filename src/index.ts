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

	// demo flags removed: demos were deprecated and cleaned from the repository

	// default to UI when running in a TTY and no other args supplied
	if (args.includes('--ui') || (args.length === 0 && process.stdin.isTTY)) {
		if (!process.stdin.isTTY) {
			console.log('UI requires a TTY.');
			process.exit(1);
		}

		try {
			const vmMod = await tryImport<typeof import('./ui/view-manager')>('./ui/view-manager');
			const ViewManager = vmMod.default || vmMod.ViewManager;
			const vm = new ViewManager();

			const startMod = await tryImport('./ui/views/startScreen');
			const mainMenuMod = await tryImport('./ui/views/mainMenuView');
			const projectPickerMod = await tryImport('./ui/views/projectPicker');
			const settingsMod = await tryImport('./ui/views/settingsView');
			const statisticsMod = await tryImport('./ui/views/statisticsView');
			vm.register('start', startMod.default || startMod.StartScreen || startMod);
			vm.register('mainMenu', mainMenuMod.default || mainMenuMod.MainMenuView || mainMenuMod);
			vm.register('projectPicker', projectPickerMod.default || projectPickerMod.ProjectPicker || projectPickerMod);
			vm.register('settings', settingsMod.default || settingsMod.SettingsView || settingsMod);
			vm.register('statistics', statisticsMod.default || statisticsMod.StatisticsView || statisticsMod);

			// show main menu immediately after boot
			// start the ViewManager (enter alternate buffer) before drawing the first view
			const runner = vm.start();
			// tiny delay to let the alternate buffer be activated on some terminals
			await new Promise((r) => setTimeout(r, 20));
			await vm.show('mainMenu');
			// wait for the ViewManager to finish (shutdown)
			await runner;
			process.exit(0);
		} catch (err) {
			console.error('Start view failed:', err);
			process.exit(1);
		}
	}

	console.log('Maven CLI bootstrap ready');
}

// run main() but keep top-level sync exit behavior
void main();
