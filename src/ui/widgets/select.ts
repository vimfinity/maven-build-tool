export interface SelectOptions {
  multi?: boolean;
  initial?: number | number[];
  prompt?: string;
}

// Simple ANSI styling helpers (kept local to avoid new deps)
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  gray: '\x1b[90m',
};

function clearScreen() {
  // clear screen and move cursor to top-left
  process.stdout.write('\x1b[2J\x1b[0f');
}

function hideCursor() {
  process.stdout.write('\x1b[?25l');
}

function showCursor() {
  process.stdout.write('\x1b[?25h');
}

/**
 * Render the select list with nicer glyphs and colors.
 * - multi: uses checkbox glyphs ◻ / ◼
 * - single: uses radio glyphs ○ / ●
 * - current line is prefixed with a colored arrow ›
 */
export function renderSelect(options: string[], current: number, selected: Set<number>, multi: boolean, prompt?: string): string {
  const lines: string[] = [];
  const reset = ANSI.reset;
  const cyan = ANSI.cyan;
  const green = ANSI.green;
  const dim = ANSI.dim;

  if (prompt) lines.push(`${ANSI.bold}${prompt}${reset}`);
  for (let i = 0; i < options.length; i++) {
    const isCurrent = i === current;
    const pointer = isCurrent ? `${cyan}›${reset}` : ' ';

    let mark: string;
    if (multi) {
      // checkbox
      mark = selected.has(i) ? `${green}◼${reset}` : `${dim}◻${reset}`;
    } else {
      // radio
      mark = isCurrent ? `${cyan}●${reset}` : `${dim}○${reset}`;
    }

    const label = isCurrent ? `${ANSI.bold}${options[i]}${reset}` : `${options[i]}`;
    lines.push(`${pointer} ${mark} ${label}`);
  }

  lines.push('');
  lines.push(`${ANSI.gray}Use ↑/↓ to move, <space> to toggle (multi), Enter to confirm, Esc/q to cancel${reset}`);
  return lines.join('\n');
}

export async function interactiveSelect(options: string[], opts: SelectOptions = {}): Promise<number | number[] | null> {
  const multi = !!opts.multi;
  let current = typeof opts.initial === 'number' ? opts.initial : 0;
  const selected = new Set<number>();
  if (Array.isArray(opts.initial)) for (const i of opts.initial) selected.add(i);

  const stdin = process.stdin;
  const wasRaw = !!(stdin as any).isRaw;
  stdin.setEncoding('utf8');
  if (stdin.isTTY) stdin.setRawMode(true);
  stdin.resume();

  // viewport handling
  const reservedLines = 3; // prompt + empty line + help
  function pageSize() {
    const rows = (process.stdout && typeof process.stdout.rows === 'number') ? process.stdout.rows : 24;
    return Math.max(3, rows - reservedLines);
  }
  let visibleStart = 0;

  function ensureVisible() {
    const ps = pageSize();
    const maxStart = Math.max(0, options.length - ps);
    if (current < visibleStart) visibleStart = current;
    if (current > visibleStart + ps - 1) visibleStart = current - (ps - 1);
    visibleStart = Math.max(0, Math.min(visibleStart, maxStart));
  }

  hideCursor();
  clearScreen();
  ensureVisible();
  process.stdout.write(renderSelect(options.slice(visibleStart, visibleStart + pageSize()), current - visibleStart, selected, multi, opts.prompt));

  return await new Promise((resolve) => {
    function cleanup() {
      stdin.removeListener('data', onData);
      try {
        if (stdin.isTTY) stdin.setRawMode(wasRaw);
      } catch (e) {
        // ignore
      }
      stdin.pause();
      showCursor();
    }

    let resizeTimer: NodeJS.Timeout | null = null;

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer as any);
      resizeTimer = setTimeout(() => {
        ensureVisible();
        clearScreen();
        process.stdout.write(renderSelect(options.slice(visibleStart, visibleStart + pageSize()), current - visibleStart, selected, multi, opts.prompt));
      }, 80);
    }

    if (process.stdout && typeof process.stdout.on === 'function') {
      process.stdout.on('resize', onResize as any);
    }

    function onData(chunk: string) {
      const key = chunk;

      // ctrl-c
      if (key === '\u0003') {
        cleanup();
        process.exit(1);
        return;
      }

      // arrows come as escape sequences
      if (key === '\u001b[A' || key === '\x1b[A') {
        current = Math.max(0, current - 1);
        ensureVisible();
      } else if (key === '\u001b[B' || key === '\x1b[B') {
        current = Math.min(options.length - 1, current + 1);
        ensureVisible();
      } else if (key === '\x1b[5~') { // PageUp
        const ps = pageSize();
        current = Math.max(0, current - ps);
        visibleStart = Math.max(0, visibleStart - ps);
        ensureVisible();
      } else if (key === '\x1b[6~') { // PageDown
        const ps = pageSize();
        current = Math.min(options.length - 1, current + ps);
        visibleStart = Math.min(Math.max(0, options.length - ps), visibleStart + ps);
        ensureVisible();
      } else if (key === '\x1b[H' || key === '\x1b[1~' || key === '\x1b[7~') { // Home
        current = 0;
        visibleStart = 0;
        ensureVisible();
      } else if (key === '\x1b[F' || key === '\x1b[4~' || key === '\x1b[8~') { // End
        current = options.length - 1;
        visibleStart = Math.max(0, options.length - pageSize());
        ensureVisible();
      } else if (key === ' ' && multi) {
        // toggle
        if (selected.has(current)) selected.delete(current); else selected.add(current);
      } else if (key === '\r' || key === '\n') {
        // confirm
        const result = multi ? Array.from(selected).sort((a,b)=>a-b) : current;
        cleanup();
        resolve(result as any);
        return;
      } else if (key === '\u001b' || key === 'q') {
        // Esc or q - cancel
        cleanup();
        resolve(null);
        return;
      } else {
        // ignore other keys
      }

      // re-render visible window
      clearScreen();
      process.stdout.write(renderSelect(options.slice(visibleStart, visibleStart + pageSize()), current - visibleStart, selected, multi, opts.prompt));
    }

    stdin.on('data', onData);
    // cleanup resize listener on exit
    const cleanupResize = () => {
      try {
        if (process.stdout && typeof process.stdout.removeListener === 'function') {
          process.stdout.removeListener('resize', onResize as any);
        }
      } catch {}
    };
  });
}
