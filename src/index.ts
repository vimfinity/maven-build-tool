import runDemo from './ui-demo';

const args = process.argv.slice(2);
if (args.includes('--ui-demo')) {
	// non-invasive demo mode
	runDemo().then(() => process.exit(0)).catch(err => {
		console.error('UI demo failed:', err);
		process.exit(1);
	});
} else {
	console.log('Maven CLI bootstrap ready');
}
