import type { View } from '../view-manager';
import { renderHeader } from './header';

const StatisticsView: View = {
  render() {
    const header = renderHeader();
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    const lines: string[] = [];
    lines.push('\x1b[1mStatistiken — Work in progress\x1b[22m');
    lines.push('');
    lines.push('Diese Ansicht ist noch in Arbeit.');
    lines.push('Hier werden zukünftig Metriken und Kennzahlen erscheinen.');
    lines.push('');
    lines.push('Vorschläge / Datenquellen:');
    lines.push('- Laufzeit von Builds');
    lines.push('- Anzahl analysierter Projekte');
    lines.push('- Test- und Build-Statistiken');
    lines.push('');
    while (lines.length < rows - 2) lines.push('');
    return header + '\n' + lines.join('\n') + '\n';
  },
  onInput(chunk: string, vm) {
    if (!chunk) return;
    if (chunk === '\u001b' || chunk === 'q' || chunk === '\u0003') {
      vm.back();
    }
  },
  footerHints() {
    return ['Esc: Zurück'];
  },
};

export default StatisticsView;
