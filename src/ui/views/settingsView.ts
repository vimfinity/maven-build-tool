import { renderHeader } from './header';
import type { View } from '../view-manager';

export const SettingsView: View = {
  render() {
    const header = renderHeader();
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    const lines: string[] = [];
    lines.push('Einstellungen');
    lines.push('');
  lines.push('Hier könnten Einstellungen angezeigt werden.');
    while (lines.length < rows - 2) lines.push('');
    return header + '\n' + lines.join('\n') + '\n';
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
