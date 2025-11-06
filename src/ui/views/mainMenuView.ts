import { View } from '../app';
import { interactiveSelect } from '../widgets/select';

export function createMainMenuView(app: { push: (v: View) => void; pop: () => void; }) : View {
  return {
    render: (w, h) => {
      const lines = [] as string[];
      lines.push('Main Menu');
      lines.push('');
      lines.push('Use ↑/↓ and Enter to navigate.');
      lines.push('');
      lines.push('Options:');
      lines.push('  1) Start');
      lines.push('  2) Settings');
      lines.push('  3) Exit');
      return lines.join('\n');
    },
    onKey: async (key) => {
      // quick select via keys
      if (key === '1') {
        // Start placeholder
      } else if (key === '2') {
        // push settings view
      } else if (key === '3') {
        // exit app by simulating ctrl-c
        process.kill(process.pid, 'SIGINT');
      } else if (key === 'enter') {
        // turn the main menu into an interactive selection to navigate
        const opts = ['Start', 'Settings', 'Exit'];
        const picked = await interactiveSelect(opts, { multi: false, prompt: 'Choose an option:' });
        if (picked === null) return;
        if (picked === 0) {
          // Start: placeholder
        } else if (picked === 1) {
          // push settings view
          app.push(await import('./settingsView').then(m => m.createSettingsView(app)));
        } else if (picked === 2) {
          process.kill(process.pid, 'SIGINT');
        }
      }
    }
  };
}
