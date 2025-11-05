import { renderHeader, renderFooter, renderMainMenu, renderStatus, joinLines } from '..';

export default async function runDemo() {
	const header = renderHeader();
	const menu = renderMainMenu(['Build', 'Clean', 'Test', 'Exit']);
	const status = renderStatus('Ready');
	const footer = renderFooter();

	const out = joinLines([header, menu, status, footer]);
	console.log(out);
}

