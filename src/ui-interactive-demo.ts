import { interactiveSelect } from './ui';

async function run() {
  const options = ['Build', 'Clean', 'Test', 'Exit'];
  const res = await interactiveSelect(options, { multi: false, prompt: 'Choose an action:' });
  console.log('\nResult:', res);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(err => {
    console.error('Interactive demo failed:', err);
    process.exit(1);
  });
}

export default run;
