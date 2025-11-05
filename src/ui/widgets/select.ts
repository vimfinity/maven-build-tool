export interface SelectOptions {
  multi?: boolean;
  initial?: number | number[];
  prompt?: string;
}

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

export function renderSelect(options: string[], current: number, selected: Set<number>, multi: boolean, prompt?: string): string {
  const lines: string[] = [];
  if (prompt) lines.push(prompt);
  for (let i = 0; i < options.length; i++) {
    const prefix = i === current ? '>' : ' ';
    const mark = multi ? (selected.has(i) ? '[x]' : '[ ]') : '   ';
    lines.push(`${prefix} ${mark} ${options[i]}`);
  }
  lines.push('');
  lines.push("Use ↑/↓ to move, <space> to toggle (multi), Enter to confirm, Esc/q to cancel");
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

  hideCursor();
  clearScreen();
  process.stdout.write(renderSelect(options, current, selected, multi, opts.prompt));

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
        current = (current - 1 + options.length) % options.length;
      } else if (key === '\u001b[B' || key === '\x1b[B') {
        current = (current + 1) % options.length;
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

      // re-render
      clearScreen();
      process.stdout.write(renderSelect(options, current, selected, multi, opts.prompt));
    }

    stdin.on('data', onData);
  });
}
