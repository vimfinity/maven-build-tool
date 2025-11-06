import { renderHeader } from './header';
import renderWipNotice from './wip';
import type { View } from '../view-manager';

export const SettingsView: View = {
  render() {
    const header = renderHeader();
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    const lines: string[] = [];
    lines.push('\x1b[1mEinstellungen — Work in progress\x1b[22m');
    lines.push('');
    lines.push('Hier könnten Einstellungen angezeigt werden. Diese Seite ist noch nicht vollständig.');
    while (lines.length < rows - 4) lines.push('');
    return header + '\n' + lines.join('\n') + renderWipNotice();
  },
  onInput(chunk: string, vm) {
    if (!chunk) return;
    if (chunk === '\u001b') {
      vm.back();
    }
  },
  footerHints() {
    return ['Esc: Zurück'];
  },
};

export default SettingsView;
