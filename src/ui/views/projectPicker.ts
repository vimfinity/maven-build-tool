import type { View } from '../view-manager';
import { renderHeader } from './header';
import { renderSelect } from '../widgets/select';

const projects = ['project-a', 'project-b', 'project-c'];

export const ProjectPicker: View = {
  title: 'Projekte',
  components: ['select'],
  render() {
  const header = renderHeader();
  const current = (this as any).__current || 0;
  const body = renderSelect(projects, current, new Set<number>(), false, 'Projekte', false);
  return header + '\n' + body;
  },
  onMount(vm) {
    (this as any).__current = 0;
  },
  onUnmount(vm) {
    delete (this as any).__current;
  },
  async onInput(chunk: string, vm) {
    if (!chunk) return;
    let current: number = (this as any).__current || 0;
    if (chunk === '\u001b[A') {
      current = Math.max(0, current - 1);
    } else if (chunk === '\u001b[B') {
      current = Math.min(projects.length - 1, current + 1);
    } else if (chunk === '\r' || chunk === '\n') {
      const project = projects[current];
      // open goals view using same select component
      const goals = ['clean', 'package', 'test'];
      const goalsView: View = {
        title: `Goals: ${project}`,
        components: ['multiselect'],
        render() {
          const header = renderHeader();
          const current = (this as any).__current || 0;
          const selected: Set<number> = (this as any).__selected || new Set<number>();
          return header + '\n' + renderSelect(goals, current, selected, true, `Goals: ${project}`, false);
        },
        onMount() {
          (this as any).__current = 0;
          (this as any).__selected = new Set<number>();
        },
        onUnmount() {
          delete (this as any).__current;
          delete (this as any).__selected;
        },
        footerHints() {
          return ['↑/↓: bewegen', 'Leertaste: markieren/unmarkieren', 'Enter: ausführen', 'Esc: Zurück'];
        },
        onInput(innerChunk: string, innerVm) {
          if (!innerChunk) return;
          let idx: number = (this as any).__current || 0;
          const selected: Set<number> = (this as any).__selected || new Set<number>();
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
          (this as any).__current = idx;
          (this as any).__selected = selected;
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
