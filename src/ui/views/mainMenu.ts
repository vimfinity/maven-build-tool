export function renderMainMenu(options: string[]): string {
  return options.map((opt, i) => `${i + 1}. ${opt}`).join('\n') + '\n';
}
