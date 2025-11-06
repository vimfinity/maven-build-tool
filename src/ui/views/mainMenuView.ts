import type { View } from '../view-manager';
import { renderHeader } from '..';
import { renderSelect } from '../widgets/select';
import { getProjects } from '../data';
import renderWipNotice from './wip';

const options = ['Projekt wählen', 'Statistiken', 'Einstellungen', 'Beenden'];

export const MainMenuView: View = {
  title: 'Hauptmenü',
  render() {
    const header = renderHeader();
    // use renderSelect for consistent styling (single select). Footer will show help.
    let state = (this as any).state as Record<string, any> | undefined;
    if (!state) state = (this as any).state = {};
    const current = typeof state.current === 'number' ? state.current : 0;
    const body = renderSelect(options, current, new Set<number>(), false, 'Hauptmenü:', false);
    return header + '\n' + body;
  },
  onMount(vm) {
    // initialize state on mount (only if not already set) so selection persists when returning
    let state = (this as any).state as Record<string, any> | undefined;
    if (!state) state = (this as any).state = {};
    if (typeof state.current === 'undefined') state.current = 0;
  },
  onUnmount(vm) {
    // keep state so selection is preserved when navigating back
  },
  onInput(chunk: string, vm) {
    const key = chunk;
    let state = (this as any).state as Record<string, any> | undefined;
    if (!state) state = (this as any).state = {};
    let current: number = typeof state.current === 'number' ? state.current : 0;
    if (key === '\u001b[A') { // up
      current = Math.max(0, current - 1);
    } else if (key === '\u001b[B') { // down
      current = Math.min(options.length - 1, current + 1);
    } else if (key === '\r' || key === '\n') { // enter
      const sel = options[current];
      if (sel === 'Projekt wählen') {
        const projects = getProjects();
        if (projects.length === 0) {
          vm.open({
            render() {
              const header = renderHeader();
              const lines = ['Projekt-Auswahl — Work in progress', '', 'Keine Projekte gefunden.'];
              return header + '\n' + lines.join('\n') + renderWipNotice();
            },
            onInput(c, v2) {
              if (c === '\u001b' || c === 'q') v2.back();
            },
          });
          return;
        }
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
    state.current = current;
    // ask ViewManager to redraw the current view (which overlays footer)
    vm.redraw(this as any);
  },
  footerHints() {
    return ['↑/↓: bewegen', 'Enter: auswählen'];
  },
};

export default MainMenuView;
