import { View } from '../view-manager';
import { ViewManager } from '../view-manager';

export function createMainMenu(vm: ViewManager): View {
  const options = ['Start project', 'Settings', 'About', 'Exit'];
  let cursor = 0;

  const render = (w: number, h: number) => {
    const header = 'Maven CLI — maven-build-tool'.padEnd(w).slice(0, w);
    const blankLines = Math.max(0, h - (options.length + 6));
    const lines = [header, '-'.repeat(Math.min(w, header.length)), ''];
    for (let i = 0; i < options.length; i++) {
      const selected = i === cursor ? '› ' : '  ';
      const label = options[i];
      lines.push(selected + label);
    }
    lines.push('', 'Use ↑/↓ to move, Enter to select, Esc to go back/exit');
    for (let i = 0; i < blankLines; i++) lines.push('');
    return lines.join('\n') + '\n';
  };

  const onKey = (key: string) => {
    if (key === '\u001b[A') { // up
      cursor = (cursor - 1 + options.length) % options.length;
      vm.render();
      return true;
    }
    if (key === '\u001b[B') {
      cursor = (cursor + 1) % options.length;
      vm.render();
      return true;
    }
    if (key === '\r' || key === '\n') {
      const sel = options[cursor];
      if (sel === 'Settings') {
        const settings = require('./settingsView').createSettingsView(vm);
        vm.push(settings);
      } else if (sel === 'Exit') {
        vm.shutdown();
        process.exit(0);
      } else {
        // placeholder: push a simple view
        const view = {
          render: (w: number, h: number) => `You selected: ${sel}\n\nPress Esc to go back.\n`,
          onKey: (k: string) => { if (k === '\x1b') { vm.pop(); } }
        };
        vm.push(view);
      }
      return true;
    }
    return false;
  };

  return { render, onKey };
}
