import { interactiveSelect } from './ui';

async function run() {
  const options = ['Compile', 'Package', 'Test', 'Deploy', 'Run'];
  const res = await interactiveSelect(options, { multi: true, prompt: 'Select actions (space to toggle):' });
  console.log('\nSelected indices:', res);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(err => {
    console.error('Multi-select demo failed:', err);
    process.exit(1);
  });
}

export default run;
