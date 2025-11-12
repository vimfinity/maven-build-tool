import { joinLines, renderFooter } from '.';
import { PALETTE, accent } from './theme';

// small helper to remove ANSI SGR sequences when measuring visible length
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

export type View = {
  render: () => string;
  onMount?: (vm: ViewManager) => void | Promise<void>;
  onUnmount?: (vm: ViewManager) => void | Promise<void>;
  onInput?: (chunk: string, vm: ViewManager) => void | Promise<void>;
  footerHints?: () => string[];
  // optional human readable title
  title?: string;
  // optional per-view state bag; recommended place to keep current/selected indices, etc.
  state?: Record<string, unknown>;
  // components used by this view; used to auto-provide footer hints (e.g. 'select', 'multiselect')
  components?: string[];
};

export class ViewManager {
  private views: Map<string, View> = new Map();
  private current?: string;
  private running = false;
  private history: string[] = [];
  private anonCounter = 0;
  // typed fields for global handlers and shutdown finish function
  private _sigint?: () => void;
  private _uncaught?: (err: unknown) => void;
  private _unhandled?: (reason: unknown) => void;
  private _finish?: () => void;

  constructor() { }

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
    // small transition: clear then draw new view to avoid abrupt flicker
    const prevName = this.current;
    this.current = name;
    const view = this.views.get(name)!;

    // two-frame pseudo-transition (clear then draw)
    try {
      process.stdout.write('\x1b[2J\x1b[H');
      await new Promise((r) => setTimeout(r, 20));
    } catch { }

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
      } catch { }
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
    // reserve final 1 row for footer
    const bodyRows = Math.max(0, rows - 1);
    const padded: string[] = lines.slice(0, bodyRows);
    while (padded.length < bodyRows) padded.push('');

    // Ensure each line is not longer than cols (trim), or pad to cols to avoid line-wrapping causing scroll
    const normalized = padded.map((ln) => {
      const visible = stripAnsi(ln);
      if (visible.length > cols) {
        // truncate visible part; drop color escapes to keep output safe
        return visible.slice(0, cols);
      }
      return ln + ' '.repeat(Math.max(0, cols - visible.length));
    });

    // render footer: determine hints (explicit or auto-derived)
    try {
      let hints: string[] = [];
      if (v.footerHints) {
        hints = v.footerHints();
      } else {
        // auto derive from components
        const compHints: Record<string, string[]> = {
          select: ['↑/↓: bewegen', 'Enter: auswählen'],
          multiselect: ['↑/↓: bewegen', 'Leertaste: markieren', 'Enter: ausführen'],
        };
        const comps: string[] = v.components || [];
        for (const c of comps) {
          const mapped = compHints[c];
          if (mapped) hints.push(...mapped);
        }
        // contextual hints
        if (this.history.length > 0) hints.push('Esc: Zurück');
      }
      // global hint for quit (always present)
      hints.push('q: Beenden');


      // Format each hint into an ANSI string similar to renderFooter
      const formatHint = (h: string) => {
        const idx = h.indexOf(':');
        if (idx > 0) {
          const key = h.slice(0, idx).trim();
          const label = h.slice(idx + 1).trim();
          return `${accent()}${PALETTE.bold}${key}${PALETTE.reset}${PALETTE.dim}:${PALETTE.reset} ${PALETTE.dim}${label}${PALETTE.reset}`;
        }
        return `${PALETTE.dim}${h}${PALETTE.reset}`;
      };

      const formattedParts = hints.map(formatHint);

      // fit as many full parts as possible into `cols`, left-to-right
      const outParts: string[] = [];
      let used = 0;
      for (let i = 0; i < formattedParts.length; i++) {
        const part = formattedParts[i];
        const visibleLen = stripAnsi(part).length;
        const sep = outParts.length > 0 ? 2 : 0; // '  '
        if (used + sep + visibleLen <= cols) {
          if (sep) used += 2;
          outParts.push(part);
          used += visibleLen;
        } else {
          // cannot fit this part fully; skip it
          continue;
        }
      }

      // If no parts fit, show truncated first hint (plain text, no ANSI)
      let ln = '';
      if (outParts.length === 0 && formattedParts.length > 0) {
        const firstVisible = stripAnsi(formattedParts[0]);
        ln = firstVisible.slice(0, Math.max(0, cols));
      } else {
        ln = outParts.join('  ');
      }

      normalized.push(''); // placeholder to make length rows again
      const row = normalized.length - 1;
      const visible = stripAnsi(ln);
      normalized[row] = ln + ' '.repeat(Math.max(0, cols - visible.length));
    } catch { }

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

    // Robust signal and error handling: ensure terminal is restored on SIGINT / crashes
    const onSigInt = async () => {
      try {
        await this.shutdown();
      } catch (err) {
        // best-effort
      }
      // ensure process exits after cleanup
      try {
        process.exit(0);
      } catch { }
    };

    const onUncaught = async (err: unknown) => {
      try {
        // attempt graceful shutdown
        await this.shutdown();
      } catch (e) {
        // ignore
      }
      // log and exit with error
      // eslint-disable-next-line no-console
      console.error('Uncaught exception:', err);
      try {
        process.exit(1);
      } catch { }
    };

    const onUnhandledRejection = async (reason: unknown) => {
      try {
        await this.shutdown();
      } catch { }
      // eslint-disable-next-line no-console
      console.error('Unhandled rejection:', reason);
      try {
        process.exit(1);
      } catch { }
    };

    // register global handlers (store them so we can remove later)
    this._sigint = onSigInt;
    this._uncaught = onUncaught;
    this._unhandled = onUnhandledRejection;
    process.on('SIGINT', onSigInt);
    process.on('uncaughtException', onUncaught as any);
    process.on('unhandledRejection', onUnhandledRejection as any);

    // enter alternate screen and clear scrollback
    process.stdout.write('\x1b[?1049h');
    process.stdout.write('\x1b[3J');
    process.stdout.write('\x1b[?25l'); // hide cursor

    return new Promise<void>((resolve) => {
      const finish = async () => {
        try {
          process.stdin.off('data', onData as any);
        } catch { }
        try {
          process.stdout.off('resize', onResize as any);
        } catch { }
        try {
          process.stdin.setRawMode && process.stdin.setRawMode(false);
        } catch { }
        try {
          process.stdin.pause();
        } catch { }
        try {
          process.stdout.write('\x1b[?25h'); // show cursor
          process.stdout.write('\x1b[2J\x1b[H');
          process.stdout.write('\x1b[?1049l'); // exit alt buffer
        } catch { }

        // remove global handlers if they were set (best-effort)
        try { if (this._sigint) process.off('SIGINT', this._sigint); } catch { }
        try { if (this._uncaught) process.off('uncaughtException', this._uncaught as any); } catch { }
        try { if (this._unhandled) process.off('unhandledRejection', this._unhandled as any); } catch { }
        this.running = false;
        resolve();
      };

      // expose shutdown so views can call it
      this._finish = finish;
    });
  }

  async shutdown() {
    const fin = this._finish;
    if (fin) fin();
  }
}

export default ViewManager;
