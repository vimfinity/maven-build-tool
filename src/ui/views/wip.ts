export function renderWipNotice(): string {
  // unified WIP notice used across several incomplete views
  return '\n\x1b[33mWork in progress: Diese Ansicht ist noch nicht vollständig.\x1b[0m\n';
}

export default renderWipNotice;
