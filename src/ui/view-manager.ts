import { joinLines } from '.';

export type View = {
  render: () => string;
  onMount?: (vm: ViewManager) => void | Promise<void>;
  onUnmount?: (vm: ViewManager) => void | Promise<void>;
  onInput?: (chunk: string, vm: ViewManager) => void | Promise<void>;
};

export class ViewManager {
  private views: Map<string, View> = new Map();
  private current?: string;
  private running = false;
  private history: string[] = [];
  private anonCounter = 0;

  constructor() {}

  register(name: string, view: View) {
    this.views.set(name, view);
  }

  registerAll(map: Record<string, View>) {
    for (const k of Object.keys(map)) this.register(k, map[k]);
  }

  has(name: string) {
    return this.views.has(name);
  }

  async show(name: string, { replace = false }: { replace?: boolean } = {}) {
    if (!this.views.has(name)) throw new Error(`Unknown view: ${name}`);
    // unmount previous
    if (this.current) {
      const prev = this.views.get(this.current)!;
      await prev.onUnmount?.(this);
    }
    if (!replace && this.current) {
      this.history.push(this.current);
    }
    this.current = name;
    const view = this.views.get(name)!;
    this.redraw(view);
    await view.onMount?.(this);
  }

  async back() {
    const current = this.current;
    const prev = this.history.pop();
    if (!prev) return;
    await this.show(prev, { replace: true });
    // if the view we just left was an anonymous view, deregister it
    if (current && current.startsWith('__anon_')) {
      try {
        this.views.delete(current);
      } catch {}
    }
  }

  /**
   * Open a dynamic/anonymous child view. Returns the generated view name.
   */
  async open(view: View): Promise<string> {
    const name = `__anon_${++this.anonCounter}`;
    this.register(name, view);
    await this.show(name);
    return name;
  }

  redraw(view?: View) {
    const v = view ?? (this.current ? this.views.get(this.current) : undefined);
    if (!v) return;
    // Produce a full-screen buffer and write it in a single write to avoid flicker.
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    // Request the view's content and split into lines
    const raw = v.render() || '';
    const lines = raw.replace(/\r/g, '').split('\n');
    // Remove final empty line caused by trailing newline
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    // Pad or trim to exactly `rows` lines (leave room for clean visual)
    const padded: string[] = lines.slice(0, rows);
    while (padded.length < rows) padded.push('');

    // Ensure each line is not longer than cols (trim), or pad to cols to avoid line-wrapping causing scroll
    const normalized = padded.map((ln) => {
      if (ln.length > cols) return ln.slice(0, cols);
      return ln + ' '.repeat(Math.max(0, cols - ln.length));
    });

    const buffer = '\x1b[H' + normalized.join('\n');
    process.stdout.write(buffer);
  }

  start(): Promise<void> {
    if (this.running) return Promise.resolve();
    this.running = true;
    // set up raw mode and input routing
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onData = async (chunk: string) => {
      if (!chunk) return;
      // global quit
      if (chunk === '\u0003') {
        await this.shutdown();
        return;
      }
      const lower = chunk.toLowerCase();
      if (lower === 'q' || lower === 'q\r' || lower === 'q\n') {
        await this.shutdown();
        return;
      }
      // forward to current view
      if (this.current) {
        const view = this.views.get(this.current)!;
        await view.onInput?.(chunk, this);
      }
    };

    process.stdin.on('data', onData as any);

    const onResize = () => this.redraw();
    process.stdout.on('resize', onResize as any);

    // enter alternate screen and clear scrollback
    process.stdout.write('\x1b[?1049h');
    process.stdout.write('\x1b[3J');
    process.stdout.write('\x1b[?25l'); // hide cursor

    return new Promise<void>((resolve) => {
      const finish = async () => {
        try {
          process.stdin.off('data', onData as any);
        } catch {}
        try {
          process.stdout.off('resize', onResize as any);
        } catch {}
        try {
          process.stdin.setRawMode && process.stdin.setRawMode(false);
        } catch {}
        try {
          process.stdin.pause();
        } catch {}
        try {
          process.stdout.write('\x1b[?25h'); // show cursor
          process.stdout.write('\x1b[2J\x1b[H');
          process.stdout.write('\x1b[?1049l'); // exit alt buffer
        } catch {}
        this.running = false;
        resolve();
      };

      // expose shutdown so views can call it
      (this as any)._finish = finish;
    });
  }

  async shutdown() {
    const fin = (this as any)._finish as (() => void) | undefined;
    if (fin) fin();
  }
}

export default ViewManager;
