import { renderHeader, joinLines } from './index';

export type ViewRender = (width: number, height: number) => string;

export interface View {
  render: ViewRender;
  onKey?: (key: string, sequence?: string) => Promise<void> | void;
  onEnter?: () => Promise<void> | void;
  onExit?: () => Promise<void> | void;
}

const ESC = '\x1b';

function write(s: string) {
  process.stdout.write(s);
}

function hideCursor() { write('\x1b[?25l'); }
function showCursor() { write('\x1b[?25h'); }
function clearScreen() { write('\x1b[2J\x1b[H'); }
function useAltBuffer() { write(ESC + '[?1049h'); }
function useNormalBuffer() { write(ESC + '[?1049l'); }

export class App {
  private stack: View[] = [];
  private running = false;
  private resizeHandler?: () => void;

  push(view: View) {
    this.stack.push(view);
    this.render();
  }

  pop() {
    const v = this.stack.pop();
    v?.onExit?.();
    this.render();
  }

  replace(view: View) {
    this.stack.pop();
    this.stack.push(view);
    this.render();
  }

  current(): View | undefined {
    return this.stack[this.stack.length - 1];
  }

  start(initial: View) {
    if (this.running) return;
    this.running = true;
    this.stack = [initial];

    // terminal setup
    useAltBuffer();
    hideCursor();
    clearScreen();

    // resize handling
    const onResize = () => this.render();
    process.stdout.on('resize', onResize);
    this.resizeHandler = onResize;

    // key handling
    process.stdin.setRawMode?.(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const onData = (chunk: string) => {
      // ctrl-c
      if (chunk === '\u0003') {
        this.stop();
        return;
      }
      const cur = this.current();
      if (!cur) return;
      // pass raw sequence and a simplified key
      const key = chunk === '\r' ? 'enter' : chunk;
      try { cur.onKey?.(key, chunk); } catch (e) { /* swallow */ }
    };
    process.stdin.on('data', onData);

    // start event
    this.current()?.onEnter?.();
    this.render();

    // store cleanup handles
    this._cleanup = () => {
      process.stdin.off('data', onData);
      process.stdin.setRawMode?.(false);
      process.stdin.pause();
      process.stdout.off('resize', onResize);
    };
  }

  private _cleanup?: () => void;

  stop() {
    if (!this.running) return;
    this.running = false;
    this.current()?.onExit?.();
    this._cleanup?.();
    useNormalBuffer();
    showCursor();
    clearScreen();
  }

  render() {
    const cur = this.current();
    if (!cur) return;
    const width = process.stdout.columns || 80;
    const height = process.stdout.rows || 24;
    // render header + view content sized to remaining space
    const header = renderHeader();
    const body = cur.render(width, height - header.split('\n').length);
    clearScreen();
    write(joinLines([header, body]));
  }
}
