import { interactiveSelect } from '..';

export default async function run() {
	const options = ['Build', 'Clean', 'Test', 'Exit'];
	const res = await interactiveSelect(options, { multi: false, prompt: 'Choose an action:' });
	console.log('\nResult:', res);
}

