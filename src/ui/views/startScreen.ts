import { renderHeader } from './header';
import type { ViewManager } from '../view-manager';

export const StartScreen = {
  render() {
    const header = renderHeader();
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;

    const title = 'Welcome to Maven CLI';
    const subtitle = 'Enter: Open main menu  •  Q: Quit';

    const bodyRows = Math.max(0, rows - 4);
    const contentLines: string[] = [];
    const topPad = Math.floor((bodyRows - 2) / 2);
    for (let i = 0; i < topPad; i++) contentLines.push('');

    const pad = Math.max(0, Math.floor((cols - title.length) / 2));
    contentLines.push(' '.repeat(pad) + title);
    contentLines.push(' '.repeat(Math.max(0, Math.floor((cols - subtitle.length) / 2))) + subtitle);

    while (contentLines.length < bodyRows) contentLines.push('');

    return [header, ...contentLines, ''].join('\n') + '\n';
  },
  onInput(chunk: string, vm: ViewManager) {
    if (!chunk) return;
    const key = chunk;
    if (key === '\r' || key === '\n') {
      // show a placeholder main menu via the manager
      if (vm && vm.has('mainMenu')) {
        vm.show('mainMenu');
      }
    }
  },
};

export default StartScreen;
