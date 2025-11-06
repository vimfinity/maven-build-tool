import type { View } from '../view-manager';
import { renderHeader } from '..';
import { renderSelect } from '../widgets/select';

const options = ['Projekt wählen', 'Statistiken', 'Einstellungen', 'Beenden'];

export const MainMenuView: View = {
  title: 'Hauptmenü',
  render() {
  const header = renderHeader();
  // use renderSelect for consistent styling (single select). Footer will show help.
  const current = (this as any).__current || 0;
  const body = renderSelect(options, current, new Set<number>(), false, 'Hauptmenü:', false);
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
      if (sel === 'Projekt wählen') {
        vm.show('projectPicker');
        return;
      } else if (sel === 'Statistiken') {
        vm.show('statistics');
        return;
      } else if (sel === 'Einstellungen') {
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
    // ask ViewManager to redraw the current view (which overlays footer)
    vm.redraw(this as any);
  },
  footerHints() {
    return ['↑/↓: bewegen', 'Enter: auswählen'];
  },
};

export default MainMenuView;
