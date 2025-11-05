import { renderHeader, renderFooter, renderMainMenu, renderStatus, joinLines } from '../ui';

async function runDemo() {
  const header = renderHeader();
  const menu = renderMainMenu(['Build', 'Clean', 'Test', 'Exit']);
  const status = renderStatus('Ready');
  const footer = renderFooter();

  const out = joinLines([header, menu, status, footer]);
  console.log(out);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(err => {
    console.error('Demo failed:', err);
    process.exit(1);
  });
}

export default runDemo;
