import { View } from '../app';

export function createSettingsView(app: { pop: () => void }) : View {
  return {
    render: (w, h) => {
      const lines = [] as string[];
      lines.push('Settings');
      lines.push('');
      lines.push('Here you can configure settings.');
      lines.push('');
      lines.push('(Press ESC to go back)');
      return lines.join('\n');
    },
    onKey: (key) => {
      if (key === '\x1b') {
        app.pop();
      }
    }
  };
}
