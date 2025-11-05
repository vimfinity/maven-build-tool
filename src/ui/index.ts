export type Renderable = string | Promise<string>;

export interface ComponentProps {
  className?: string; // placeholder for future styling
}

export type Component<T extends ComponentProps = ComponentProps> = (props: T) => Renderable;

export { renderHeader } from './views/header';
export { renderFooter } from './views/footer';
export { renderMainMenu } from './views/mainMenu';
export { renderStatus } from './views/status';

// Small helpers
export function joinLines(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join('\n') + '\n';
}
