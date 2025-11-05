import { interactiveSelect } from '..';

export default async function run() {
	const options = ['Compile', 'Package', 'Test', 'Deploy', 'Run'];
	const res = await interactiveSelect(options, { multi: true, prompt: 'Select actions (space to toggle):' });
	console.log('\nSelected indices:', res);
}

