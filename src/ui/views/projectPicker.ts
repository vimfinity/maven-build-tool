import type { View } from '../view-manager';
import { renderHeader } from './header';
import { renderSelect } from '../widgets/select';
import { getProjects, getGoalsForProject, DATA_WIP } from '../data';

export const ProjectPicker: View = {
  title: 'Projekte',
  components: ['select'],
  render() {
    const header = renderHeader();
    let state = (this as any).state as Record<string, any> | undefined;
    if (!state) state = (this as any).state = {};
    const current = typeof state.current === 'number' ? state.current : 0;
    const projects = getProjects();
    if (projects.length === 0) {
      // no projects discovered yet — show WIP placeholder
      if (DATA_WIP) {
        return header + '\n' + '\n' + 'Keine Projekte gefunden.' + '\n' + '\n' + '\x1b[33mWork in progress: Projekte werden noch erkannt\x1b[0m\n';
      }
      return header + '\n' + '\n' + 'Keine Projekte gefunden.' + '\n';
    }
    const body = renderSelect(projects, current, new Set<number>(), false, 'Projekte', false);
    return header + '\n' + body;
  },
  onMount(vm) {
    let state = (this as any).state as Record<string, any> | undefined;
    if (!state) state = (this as any).state = {};
    if (typeof state.current === 'undefined') state.current = 0;
  },
  onUnmount(vm) {
    // keep state so selection is preserved when navigating back to this view
  },
  async onInput(chunk: string, vm) {
    if (!chunk) return;
    const projects = getProjects();
    let state = (this as any).state as Record<string, any> | undefined;
    if (!state) state = (this as any).state = {};
    let current: number = typeof state.current === 'number' ? state.current : 0;
    if (chunk === '\u001b[A') {
      current = Math.max(0, current - 1);
    } else if (chunk === '\u001b[B') {
      current = Math.min(projects.length - 1, current + 1);
    } else if (chunk === '\r' || chunk === '\n') {
      const project = getProjects()[current];
      // open goals view using same select component
      const goals = getGoalsForProject(project);
      const goalsView: View = {
        title: `Goals: ${project}`,
        components: ['multiselect'],
        render() {
          const header = renderHeader();
          let childState = (this as any).state as Record<string, any> | undefined;
          if (!childState) childState = (this as any).state = {};
          const current = typeof childState.current === 'number' ? childState.current : 0;
          const selected: Set<number> = (childState.selected as Set<number>) || new Set<number>();
          const body = renderSelect(goals, current, selected, true, `Goals: ${project}`, false);
          if (DATA_WIP) {
            return header + '\n' + body + '\n\n\x1b[33mWork in progress: goal execution and real data are placeholders\x1b[0m\n';
          }
          return header + '\n' + body;
        },
        onMount() {
          let childState = (this as any).state as Record<string, any> | undefined;
          if (!childState) childState = (this as any).state = {};
          if (typeof childState.current === 'undefined') childState.current = 0;
          if (!childState.selected) childState.selected = new Set<number>();
        },
        onUnmount() {
          // anonymous view: cleanup state for this view instance
          delete (this as any).state;
        },
        footerHints() {
          return ['↑/↓: bewegen', 'Leertaste: markieren/unmarkieren', 'Enter: ausführen', 'Esc: Zurück'];
        },
        onInput(innerChunk: string, innerVm) {
          if (!innerChunk) return;
          let childState = (this as any).state as Record<string, any> | undefined;
          if (!childState) childState = (this as any).state = {};
          let idx: number = typeof childState.current === 'number' ? childState.current : 0;
          const selected: Set<number> = (childState.selected as Set<number>) || new Set<number>();
          if (innerChunk === '\u001b[A') idx = Math.max(0, idx - 1);
          else if (innerChunk === '\u001b[B') idx = Math.min(goals.length - 1, idx + 1);
          else if (innerChunk === ' ') {
            if (selected.has(idx)) selected.delete(idx); else selected.add(idx);
          } else if (innerChunk === '\r' || innerChunk === '\n') {
            const chosen = Array.from(selected).map((i) => goals[i]);
            innerVm.open({
              render() {
                const header = renderHeader();
                const lines = ['Wird ausgeführt: ' + chosen.join(', '), '', 'Logs will appear here. Press Esc to go back.'];
                return header + '\n' + lines.join('\n') + '\n';
              },
              onInput(c, vm2) {
                if (c === '\u001b') vm2.back();
              },
            });
            return;
          } else if (innerChunk === '\u001b') {
            innerVm.back();
            return;
          }
          childState.current = idx;
          childState.selected = selected;
          innerVm.redraw(this as any);
        },
      };
      vm.open(goalsView);
      return;
    } else if (chunk === '\u001b') {
      vm.back();
      return;
    }
    (this as any).__current = current;
    vm.redraw(this as any);
  },
};

export default ProjectPicker;
