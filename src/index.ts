import runInteractiveDemo from './ui/demos/ui-interactive-demo';
import runMultiSelectDemo from './ui/demos/ui-multiselect-demo';

const args = process.argv.slice(2);
if (args.includes('--ui-demo')) {
	// run interactive demo when running in a TTY
	if (process.stdin.isTTY) {
		// default to single-select interactive demo
		runInteractiveDemo().then(() => process.exit(0)).catch((err: unknown) => {
			console.error('UI demo failed:', err);
			process.exit(1);
		});
	} else {
		console.log('UI demo requires an interactive TTY. Run in a terminal, not piped.');
		process.exit(1);
	}
} else if (args.includes('--ui-multiselect-demo')) {
	if (process.stdin.isTTY) {
		runMultiSelectDemo().then(() => process.exit(0)).catch((err: unknown) => {
			console.error('UI multi-select demo failed:', err);
			process.exit(1);
		});
	} else {
		console.log('Multi-select demo requires a TTY.');
		process.exit(1);
	}
} else {
	console.log('Maven CLI bootstrap ready');
}
