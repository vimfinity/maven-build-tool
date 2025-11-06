import type { View } from '../view-manager';
import { renderHeader } from '..';
import { renderSelect } from '../widgets/select';

const options = ['Einstellungen', 'Beenden'];

export const MainMenuView: View = {
  render() {
    const header = renderHeader();
    // use renderSelect for consistent styling (single select)
    const body = renderSelect(options, 0, new Set<number>(), false, 'Hauptmenü:');
    return header + '\n' + body;
  },
  onMount(vm) {
    // initialize state on mount
    (this as any).__current = 0;
  },
  onUnmount(vm) {
    // clear state
    delete (this as any).__current;
  },
  onInput(chunk: string, vm) {
    const key = chunk;
    let current: number = (this as any).__current || 0;
    if (key === '\u001b[A') { // up
      current = Math.max(0, current - 1);
    } else if (key === '\u001b[B') { // down
      current = Math.min(options.length - 1, current + 1);
    } else if (key === '\r' || key === '\n') { // enter
      const sel = options[current];
      if (sel === 'Einstellungen') {
        vm.show('settings');
        return;
      } else if (sel === 'Beenden') {
        vm.shutdown();
        return;
      }
    } else if (key === '\u001b') { // Esc
      vm.back();
      return;
    }
    (this as any).__current = current;
    // re-render with updated current
    const selected = new Set<number>();
    const rendered = renderHeader() + '\n' + renderSelect(options, current, selected, false, 'Hauptmenü:');
    process.stdout.write('\x1b[H\x1b[2J' + rendered);
  },
};

export default MainMenuView;
