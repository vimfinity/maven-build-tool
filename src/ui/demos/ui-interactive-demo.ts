import { interactiveSelect, renderStatus, renderHeader } from '..';

export default async function run() {
	const singleOptions = ['Build', 'Clean', 'Test', 'Exit'];
		const picked = await interactiveSelect(singleOptions, { multi: false, prompt: 'Choose a primary action:', header: renderHeader() });
	if (picked === null) {
		console.log('\nCancelled single-select.');
		return;
	}

	console.log('\nPrimary action chosen:', singleOptions[picked as number]);

	// now multi-select follow-up (optional sub-actions)
	const followOptions = ['Run unit tests', 'Run integration tests', 'Package artifact', 'Deploy'];
		const pickedMulti = await interactiveSelect(followOptions, { multi: true, prompt: 'Choose follow-up actions (space to toggle):', header: renderHeader() });
	if (pickedMulti === null) {
		console.log('\nCancelled multi-select.');
		return;
	}

	const selectedNames = (pickedMulti as number[]).map(i => followOptions[i]);
	console.log('\nSelected follow-up actions:', selectedNames.join(', ') || '(none)');

	console.log('\nSummary:');
	console.log(`- Primary: ${singleOptions[picked as number]}`);
	console.log(`- Follow-up: ${selectedNames.join(', ') || '(none)'}`);

	// show a final status line
	console.log('\n' + renderStatus('Demo complete'));
}

